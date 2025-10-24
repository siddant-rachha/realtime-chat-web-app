"use client";

import { useRef, useState } from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useParams } from "next/navigation";
import { useAuthContext } from "@/store/Auth/useAuthContext";
import theme from "@/app/theme";
import { Message } from "@/commonTypes/types";
import { useGetFriendName } from "./hooks/useGetFriendName";
import { useGetFriendStatus } from "./hooks/useGetFriendStatus";
import { useSendMessage } from "./hooks/useSendMessage";
import { useLoadInitialMessages } from "./hooks/useLoadInitialMessages";
import { useListenNewMessages } from "./hooks/useListenNewMessages";
import { useListenUpdatesForMsgs } from "./hooks/useListenUpdatesForMsgs";
import { useMakeMsgAsRead } from "./hooks/useMakeMsgAsRead";
import { useLoadOldMessages } from "./hooks/useLoadOldMessages";
import { LoadingText } from "@/components/LoadingText";
import { formatTimestamp } from "./helpers/helpers";
import { ChatInputBox } from "./components/ChatInputBox";

const PAGE_SIZE = 50;

export default function ChatDetailPage() {
  const { chatId } = useParams();
  const {
    selectors: { user },
  } = useAuthContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // =============== STATES ===============
  const [messages, setMessages] = useState<Message[]>([]);
  const [earliestTimestamp, setEarliestTimestamp] = useState<number | null>(null);
  const [latestTimestamp, setLatestTimestamp] = useState<number>(0);
  // ===============

  const friendUid = (chatId as string).split("_").find((uid) => uid !== user?.uid)!;

  // =============== HOOKS ===============
  useGetFriendName(friendUid);
  useGetFriendStatus(friendUid);

  const { sendingMsg, handleSend } = useSendMessage({
    chatId: chatId as string,
    scrollToBottom,
    inputRef,
  });

  const { initialMsgLoading } = useLoadInitialMessages({
    chatId: chatId as string,
    PAGE_SIZE,
    setMessages,
    scrollToBottom,
    setEarliestTimestamp,
    setLatestTimestamp,
  });

  useListenNewMessages({
    chatId: chatId as string,
    latestTimestamp,
    setMessages,
    scrollToBottom,
  });

  useListenUpdatesForMsgs({
    chatId: chatId as string,
    earliestTimestamp,
    setMessages,
  });

  useMakeMsgAsRead({
    chatId: chatId as string,
    messages,
  });

  const { loadOlderMessages, loadingOlderMsgs } = useLoadOldMessages({
    earliestTimestamp,
    setEarliestTimestamp,
    setMessages,
    chatId: chatId as string,
    PAGE_SIZE,
    scrollContainerRef,
  });

  // =================== HELPERS ===================
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const renderMessage = (msg: Message) => {
    const isMine = msg.senderUid === user?.uid;
    const statusForFriend = msg.status?.[friendUid];
    const displayTime = formatTimestamp(msg.timestamp);

    return (
      <Box
        key={msg.id}
        sx={{
          alignSelf: isMine ? "flex-end" : "flex-start",
          backgroundColor: isMine ? theme.palette.primary.main : theme.palette.secondary.main,
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
        {msg.image ? (
          <Box component="img" src={msg.image} alt="GIF" sx={{ width: "100%", borderRadius: 1 }} />
        ) : (
          <Typography fontSize={14}>{msg.text}</Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
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
  };

  if (!user || !chatId) return <LoadingText text="Loading chat..." />;

  // =================== RENDER ===================
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
        {/* Load older messages */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button
            variant="outlined"
            onClick={loadOlderMessages}
            disabled={loadingOlderMsgs || !earliestTimestamp}
          >
            {loadingOlderMsgs ? <CircularProgress size={20} /> : <ArrowUpwardIcon />}
          </Button>
        </Box>

        {/* Messages */}
        {initialMsgLoading ? (
          <LoadingText text="Loading recent messages..." />
        ) : messages.length === 0 ? (
          <Typography sx={{ textAlign: "center", mt: 2 }}>No messages yet</Typography>
        ) : (
          messages.map(renderMessage)
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input area */}
      <ChatInputBox sendingMsg={sendingMsg} inputRef={inputRef} handleSend={handleSend} />
    </>
  );
}
