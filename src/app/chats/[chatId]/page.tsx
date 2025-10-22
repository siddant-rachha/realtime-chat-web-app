/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useRef, useState } from "react";
import { Box, TextField, IconButton, CircularProgress, Typography, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useParams } from "next/navigation";
import {
  ref,
  query,
  get,
  update,
  orderByChild,
  limitToLast,
  endAt,
  onChildAdded,
  onChildChanged,
} from "firebase/database";
import { database as db } from "@/lib/firebase";
import { useAuthContext } from "@/store/Auth/useAuthContext";
import theme from "@/app/theme";
import { userApi } from "@/apiService/userApi";
import { messageApi } from "@/apiService/messageApi";
import { useNavContext } from "@/store/NavDrawer/useNavContext";

interface Message {
  id: string;
  senderUid: string;
  text: string;
  timestamp: number;
  status?: Record<string, string>;
}

const PAGE_SIZE = 50;

export default function ChatDetailPage() {
  const { chatId } = useParams();
  const {
    selectors: { user },
  } = useAuthContext();
  const {
    actions: { setNavTitle },
  } = useNavContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [earliestTimestamp, setEarliestTimestamp] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false); // ✅ track initial load

  if (!user || !chatId) return <CircularProgress sx={{ mt: 5, display: "block", mx: "auto" }} />;

  const friendUid = (chatId as string).split("_").find((uid) => uid !== user.uid)!;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get friend name
  useEffect(() => {
    const getFriendName = async () => {
      try {
        const { user } = await userApi.searchUser({ userUid: friendUid });
        setNavTitle(`(${user?.displayName})`);
      } catch (err) {
        console.error(err);
      }
    };
    getFriendName();
  }, []);

  // Load initial messages + attach listeners
  useEffect(() => {
    const messagesRef = ref(db, `chats/${chatId}`);
    const initialQuery = query(messagesRef, orderByChild("timestamp"), limitToLast(PAGE_SIZE));

    // New messages listener
    const unsubscribeAdded = onChildAdded(messagesRef, (snap) => {
      if (!initializedRef.current) return; // ignore until initial load done

      const data = snap.val();
      const newMsg: Message = {
        id: snap.key!,
        senderUid: data.senderUid,
        text: data.text,
        timestamp: Number(data.timestamp),
        status: data.status || {},
      };

      setMessages((prev) => {
        if (messageIds.current.has(newMsg.id)) return prev;
        messageIds.current.add(newMsg.id);
        const sorted = [...prev, newMsg].sort((a, b) => a.timestamp - b.timestamp);
        return sorted;
      });

      setTimeout(() => scrollToBottom(), 50);
    });

    // Updates listener
    const unsubscribeChanged = onChildChanged(messagesRef, (snap) => {
      const updatedData = snap.val();
      setMessages((prev) =>
        prev
          .map((m) =>
            m.id === snap.key
              ? { ...m, ...updatedData, timestamp: Number(updatedData.timestamp) }
              : m,
          )
          .sort((a, b) => a.timestamp - b.timestamp),
      );
    });

    // Initial load
    get(initialQuery)
      .then((snap) => {
        if (snap.exists()) {
          const msgs = Object.entries(snap.val()).map(([id, data]: any) => ({
            id,
            ...data,
            timestamp: Number(data.timestamp),
          })) as Message[];

          msgs.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(msgs);
          msgs.forEach((m) => messageIds.current.add(m.id));
          if (msgs.length > 0) setEarliestTimestamp(msgs[0].timestamp);
        }

        setLoading(false);
        setTimeout(() => scrollToBottom(), 100);
        initializedRef.current = true; // ✅ mark initial load done
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        initializedRef.current = true;
      });

    return () => {
      unsubscribeAdded();
      unsubscribeChanged();
    };
  }, [chatId]);

  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!user?.uid || !chatId) return;
      const updates: Record<string, any> = {};

      messages.forEach((msg) => {
        if (msg.senderUid !== user.uid && msg.status?.[user.uid] === "sent") {
          updates[`chats/${chatId}/${msg.id}/status/${user.uid}`] = "read";
        }
      });

      if (Object.keys(updates).length > 0) await update(ref(db), updates);
    };

    if (messages.length > 0) markMessagesAsRead();
  }, [messages, chatId, user?.uid]);

  // Load older messages
  const loadOlderMessages = async () => {
    if (!earliestTimestamp || loadingMore) return;
    setLoadingMore(true);

    const container = scrollContainerRef.current;
    const scrollHeightBefore = container?.scrollHeight || 0;

    try {
      const messagesRef = ref(db, `chats/${chatId}`);
      const olderQuery = query(
        messagesRef,
        orderByChild("timestamp"),
        endAt(earliestTimestamp - 1),
        limitToLast(PAGE_SIZE),
      );

      const snap = await get(olderQuery);
      if (snap.exists()) {
        const olderMsgs = Object.entries(snap.val()).map(([id, data]: any) => ({
          id,
          ...data,
          timestamp: Number(data.timestamp),
        })) as Message[];

        olderMsgs.sort((a, b) => a.timestamp - b.timestamp);
        setMessages((prev) => {
          olderMsgs.forEach((m) => messageIds.current.add(m.id));
          return [...olderMsgs, ...prev];
        });

        if (olderMsgs.length > 0) setEarliestTimestamp(olderMsgs[0].timestamp);

        if (container) {
          const scrollHeightAfter = container.scrollHeight;
          container.scrollTop = scrollHeightAfter - scrollHeightBefore;
        }
      } else {
        setEarliestTimestamp(null);
      }
    } catch (err) {
      console.error(err);
    }

    setLoadingMore(false);
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await messageApi.sendMessage({ chatId: chatId as string, text: input });
      setInput("");
      setTimeout(() => scrollToBottom(), 50);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <>
      <Box
        ref={scrollContainerRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          height: "calc(100vh - 128px)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button
            variant="outlined"
            onClick={loadOlderMessages}
            disabled={loadingMore || !earliestTimestamp}
          >
            {loadingMore ? "Loading..." : <ArrowUpwardIcon />}
          </Button>
        </Box>

        {loading ? (
          <CircularProgress sx={{ mx: "auto", mt: 5 }} />
        ) : messages.length === 0 ? (
          <Typography sx={{ textAlign: "center", mt: 2 }}>No messages yet</Typography>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderUid === user.uid;
            const statusForFriend = msg.status?.[friendUid];
            const date = new Date(msg.timestamp);
            const now = new Date();
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);

            const isToday =
              date.getDate() === now.getDate() &&
              date.getMonth() === now.getMonth() &&
              date.getFullYear() === now.getFullYear();
            const isYesterday =
              date.getDate() === yesterday.getDate() &&
              date.getMonth() === yesterday.getMonth() &&
              date.getFullYear() === yesterday.getFullYear();

            const timeString = date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            const displayTime = isToday
              ? `Today, ${timeString}`
              : isYesterday
                ? `Yesterday, ${timeString}`
                : date.toLocaleString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

            return (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: isMine ? "flex-end" : "flex-start",
                  backgroundColor: isMine
                    ? theme.palette.primary.main
                    : theme.palette.secondary.main,
                  color: isMine ? "#fff" : "#000",
                  borderBottomLeftRadius: isMine ? 16 : 0,
                  borderBottomRightRadius: isMine ? 0 : 16,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  px: 2,
                  py: 0.5,
                  pt: 1,
                  maxWidth: "90%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography fontSize={14}>{msg.text}</Typography>
                <Box
                  sx={{ display: "flex" }}
                  {...(isMine ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" })}
                >
                  <Box
                    display="flex"
                    position="relative"
                    alignItems="center"
                    sx={isMine ? { right: -10 } : { left: -10 }}
                  >
                    <Typography variant="caption" fontSize={9} sx={{ opacity: 0.7 }}>
                      {displayTime}
                    </Typography>
                    {isMine && (
                      <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
                        {statusForFriend === "read" ? (
                          <DoneAllIcon sx={{ fontSize: "1rem", color: "#4FC3F7" }} />
                        ) : (
                          <DoneIcon sx={{ fontSize: "1rem", color: "#fff" }} />
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 1,
          position: "sticky",
          bottom: 0,
          background: "#fff",
          py: 1,
          borderTop: "1px solid #ccc",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <IconButton color="primary" onClick={handleSend}>
          <SendIcon />
        </IconButton>
      </Box>
    </>
  );
}
