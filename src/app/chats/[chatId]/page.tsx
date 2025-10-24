"use client";

import { useRef, useState } from "react";
import { Box, TextField, IconButton, CircularProgress, Typography, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
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
  useGetFriendName(friendUid); // will set name to nav bar title
  useGetFriendStatus(friendUid); // will set status to nav bar subtitle

  const { sendingMsg, handleSend } = useSendMessage({
    chatId: chatId as string,
    scrollToBottom,
    inputRef,
  }); // provide functions to send message and scroll to bottom

  const { initialMsgLoading } = useLoadInitialMessages({
    chatId: chatId as string,
    PAGE_SIZE,
    setMessages,
    scrollToBottom,
    setEarliestTimestamp,
    setLatestTimestamp,
  }); // will load initial messages and set earliest and latest timestamps

  useListenNewMessages({
    chatId: chatId as string,
    latestTimestamp,
    setMessages,
    scrollToBottom,
  }); // listen for new messages from the latest timestamp and set the messages state

  useListenUpdatesForMsgs({
    chatId: chatId as string,
    earliestTimestamp,
    setMessages,
  }); // listen for updates to existing messages and update and set the messages state

  useMakeMsgAsRead({
    chatId: chatId as string,
    messages,
  }); // listen to messages which are in sent mode and mark them as read

  const { loadOlderMessages, loadingOlderMsgs } = useLoadOldMessages({
    earliestTimestamp,
    setEarliestTimestamp,
    setMessages,
    chatId: chatId as string,
    PAGE_SIZE,
    scrollContainerRef,
  }); // load older messages from the earliest timestamp and set the messages state and earliest timestamp // set the scroll position at its previous position

  // ===============

  // =================== HELPERS ===================
  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  // ===================

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
        <Typography fontSize={14}>{msg.text}</Typography>
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
          disabled={sendingMsg} // disable while sending
        >
          {sendingMsg ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </>
  );
}
