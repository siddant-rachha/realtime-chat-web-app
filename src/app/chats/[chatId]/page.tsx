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
  startAfter,
  onChildAdded,
  onChildChanged,
  onValue,
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
    actions: { setNavTitle, setNavSubTitle },
  } = useNavContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [earliestTimestamp, setEarliestTimestamp] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [friendStatus, setFriendStatus] = useState<{ state: string; last_changed: number } | null>(
    null,
  );

  if (!user || !chatId) return <CircularProgress sx={{ mt: 5, display: "block", mx: "auto" }} />;

  const friendUid = (chatId as string).split("_").find((uid) => uid !== user.uid)!;

  // ✅ Listen for friend's online/offline updates in real-time
  useEffect(() => {
    const friendStatusRef = ref(db, `status/${friendUid}`);

    const unsubscribe = onValue(friendStatusRef, (snap) => {
      if (snap.exists()) setFriendStatus(snap.val());
      else setFriendStatus(null);
    });

    return () => unsubscribe();
  }, [friendUid]);

  const getFriendStatusText = () => {
    if (!friendStatus) return "Offline";
    if (friendStatus.state === "online") return "Online";

    const diffMs = Date.now() - friendStatus.last_changed;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Last seen just now";
    if (diffMin < 60) return `Last seen ${diffMin} min ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Last seen ${diffHrs} hr ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `Last seen ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    const statusText = getFriendStatusText();
    setNavSubTitle(statusText);

    return () => {
      setNavSubTitle("");
    };
  }, [friendStatus]);

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

  // Load initial messages + listen for new messages in real-time
  useEffect(() => {
    const messagesRef = ref(db, `chats/${chatId}`);

    let unsubscribeAdded: (() => void) | null = null;
    let unsubscribeChanged: (() => void) | null = null;

    // Load initial messages (latest PAGE_SIZE messages)
    const loadInitialMessages = async () => {
      try {
        const initialQuery = query(messagesRef, orderByChild("timestamp"), limitToLast(PAGE_SIZE));
        const snap = await get(initialQuery);

        let latestTimestamp = 0; // Default for new chats
        let msgs: Message[] = [];

        if (snap.exists()) {
          msgs = Object.entries(snap.val()).map(([id, data]: any) => ({
            id,
            ...data,
            timestamp: Number(data.timestamp),
          }));
          msgs.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(msgs);
          msgs.forEach((m) => messageIds.current.add(m.id));

          if (msgs.length > 0) {
            setEarliestTimestamp(msgs[0].timestamp);
            latestTimestamp = msgs[msgs.length - 1].timestamp;
          }
        }

        // ✅ Always attach listener for new messages after latest timestamp
        const newMessagesQuery = query(
          messagesRef,
          orderByChild("timestamp"),
          startAfter(latestTimestamp),
        );
        unsubscribeAdded = onChildAdded(newMessagesQuery, (snap) => {
          const data = snap.val();
          if (!data) return;

          const newMsg: Message = {
            id: snap.key!,
            senderUid: data.senderUid,
            text: data.text,
            timestamp: Number(data.timestamp),
            status: data.status || {},
          };

          // Skip duplicates
          if (messageIds.current.has(newMsg.id)) return;
          messageIds.current.add(newMsg.id);

          setMessages((prev) => [...prev, newMsg].sort((a, b) => a.timestamp - b.timestamp));
          setTimeout(scrollToBottom, 50);
        });

        // Listen for updates to existing messages (read status etc.)
        unsubscribeChanged = onChildChanged(messagesRef, (snap) => {
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

        setLoading(false);
        setTimeout(scrollToBottom, 100);
        initializedRef.current = true;
      } catch (err) {
        console.error("Error loading messages:", err);
        setLoading(false);
        initializedRef.current = true;
      }
    };

    loadInitialMessages();

    // Cleanup on unmount
    return () => {
      if (unsubscribeAdded) unsubscribeAdded();
      if (unsubscribeChanged) unsubscribeChanged();
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
    if (!inputRef.current?.value.trim() || sending) return; // Prevent multiple sends

    setSending(true);
    try {
      inputRef.current.focus();
      await messageApi.sendMessage({ chatId: chatId as string, text: inputRef.current.value });

      inputRef.current.value = "";
      inputRef.current.focus();

      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
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
            const isToday = date.toDateString() === now.toDateString();
            const isYesterday = date.toDateString() === yesterday.toDateString();
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
          multiline
          inputRef={inputRef}
          maxRows={4}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          tabIndex={-1} // prevents focusing
          size="large"
          disabled={sending} // disable while sending
        >
          {sending ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </>
  );
}
