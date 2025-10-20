/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  TextField,
  IconButton,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useParams } from "next/navigation";
import {
  ref,
  query,
  get,
  push,
  update,
  orderByChild,
  limitToLast,
  endAt,
  onChildAdded,
} from "firebase/database";
import { database as db } from "@/lib/firebase";
import { useAuthContext } from "@/store/Auth/useAuthContext";

interface Message {
  id: string;
  senderUid: string;
  text: string;
  timestamp: number;
}

const PAGE_SIZE = 50;

export default function ChatDetailPage() {
  const { chatId } = useParams();
  const {
    selectors: { user },
  } = useAuthContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [earliestTimestamp, setEarliestTimestamp] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!user || !chatId) {
    return <CircularProgress sx={{ mt: 5, display: "block", mx: "auto" }} />;
  }

  const friendUid = (chatId as string).split("_").find((uid) => uid !== user.uid)!;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load initial messages
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        const messagesRef = ref(db, `chats/${chatId}`);
        const initialQuery = query(messagesRef, orderByChild("timestamp"), limitToLast(PAGE_SIZE));
        const snap = await get(initialQuery);

        if (snap.exists()) {
          const msgs = Object.entries(snap.val()).map(([id, data]: any) => ({
            id,
            ...data,
          })) as Message[];

          msgs.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(msgs);
          if (msgs.length > 0) setEarliestTimestamp(msgs[0].timestamp);
        }
        setLoading(false);
        scrollToBottom();
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadInitialMessages();
  }, [chatId]);

  // Load older messages (preserve scroll position)
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
        })) as Message[];

        olderMsgs.sort((a, b) => a.timestamp - b.timestamp);
        setMessages((prev) => [...olderMsgs, ...prev]);
        if (olderMsgs.length > 0) setEarliestTimestamp(olderMsgs[0].timestamp);

        // Preserve scroll position
        if (container) {
          const scrollHeightAfter = container.scrollHeight;
          container.scrollTop = scrollHeightAfter - scrollHeightBefore;
        }
      }
    } catch (err) {
      console.error(err);
    }

    setLoadingMore(false);
  };

  // Real-time listener for new messages
  useEffect(() => {
    const messagesRef = ref(db, `chats/${chatId}`);
    const unsubscribe = onChildAdded(messagesRef, (snap) => {
      const data = snap.val();
      const newMsg: Message = {
        id: snap.key!,
        senderUid: data.senderUid,
        text: data.text,
        timestamp: data.timestamp,
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      scrollToBottom();
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const message = {
        senderUid: user.uid,
        text: input.trim(),
        timestamp: Date.now(),
        status: { [friendUid]: "sent" },
        edited: false,
        deleted: false,
      };

      const newMsgRef = push(ref(db, `chats/${chatId}`));
      await update(newMsgRef, message);

      const now = Date.now();
      const chatListUpdates: Record<string, any> = {};
      chatListUpdates[`chatList/${user.uid}/${chatId}`] = {
        lastMessage: message.text,
        lastTimestamp: now,
        friendUid,
      };
      chatListUpdates[`chatList/${friendUid}/${chatId}`] = {
        lastMessage: message.text,
        lastTimestamp: now,
        friendUid: user.uid,
      };
      await update(ref(db), chatListUpdates);

      setInput("");
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{ height: "100vh", display: "flex", flexDirection: "column", pb: 2 }}
    >
      {/* Messages container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          border: "1px solid #ccc",
          borderRadius: 2,
        }}
      >
        {/* Load older messages button */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button
            variant="outlined"
            onClick={loadOlderMessages}
            disabled={loadingMore || !earliestTimestamp}
          >
            {loadingMore ? "Loading..." : "Load Older Messages"}
          </Button>
        </Box>

        {/* Messages */}
        {loading ? (
          <CircularProgress sx={{ mx: "auto", mt: 5 }} />
        ) : messages.length === 0 ? (
          <Typography sx={{ textAlign: "center", mt: 2 }}>No messages yet</Typography>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                alignSelf: msg.senderUid === user.uid ? "flex-end" : "flex-start",
                backgroundColor: msg.senderUid === user.uid ? "#1976d2" : "#e0e0e0",
                color: msg.senderUid === user.uid ? "#fff" : "#000",
                borderRadius: 2,
                p: 1.5,
                maxWidth: "75%",
              }}
            >
              <Typography variant="body1">{msg.text}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, fontSize: "0.7rem" }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input box fixed at bottom */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mt: 1,
          position: "sticky",
          bottom: 0,
          background: "#fff",
          px: 2,
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
    </Container>
  );
}
