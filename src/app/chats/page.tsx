"use client";

import { useEffect, useState } from "react";
import {
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/store/Auth/useAuthContext";
import Divider from "@mui/material/Divider";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import theme from "../theme";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

interface ChatItem {
  chatId: string;
  friendUid: string;
  displayName: string;
  username: string;
  lastMessage: string;
}

export default function ChatsPage() {
  const router = useRouter();
  const [chatList, setChatList] = useState<ChatItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    selectors: { user },
  } = useAuthContext();

  const generateChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join("_");
  };

  const handleChatClick = (item: { friendUid: string; displayName: string }) => {
    setOpen(true);
    router.push(`/chats/${generateChatId(user!.uid, item.friendUid)}`);
  };

  useEffect(() => {
    // need to implement axios
    const fetchChats = async () => {
      setLoading(true);
      try {
        const idToken = localStorage.getItem("idToken");
        const res = await fetch("/api/getChats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        const data = await res.json();
        setChatList(data.chatList || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 12 }}>
        <Typography variant="h6" fontFamily="monospace">
          Loading chats...
        </Typography>
        <CircularProgress />
      </Box>
    );

  if (chatList && chatList.length === 0)
    return (
      <Container sx={{ mt: 12 }}>
        <Typography variant="h6" fontFamily="monospace">
          No chats yet. Add friends to start chatting!
        </Typography>
      </Container>
    );

  return (
    <Container
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        height: "100%",
        padding: 0,
      }}
    >
      <List sx={{ width: "100%", bgcolor: "background.paper", userSelect: "none" }}>
        {/* overlay box */}
        {true && (
          <Box
            sx={{
              position: "fixed",
              left: 0,

              width: "100vw",
              height: "100vh",
              zIndex: 10,
              opacity: 0.5,
              bgcolor: "background.default",
              display: "flex",
              justifyContent: "center", // horizontal
              alignItems: "flex-start", // vertical
            }}
          >
            <CircularProgress sx={{ mt: 12 }} />
          </Box>
        )}
        {chatList?.map((item) => (
          <Box key={item.chatId}>
            <ListItem
              onClick={() => handleChatClick(item)}
              sx={{
                bgcolor: theme.palette.secondary.main,
                maxHeight: 80,
                height: 80,
                mb: 1,
                mt: 1,
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              <ListItemAvatar>
                <Avatar alt={item.displayName} src="#" />
              </ListItemAvatar>
              <ListItemText
                primary={item.displayName}
                slotProps={{ primary: { fontWeight: "bold" } }}
                secondary={
                  item.lastMessage ? `${item.lastMessage.slice(0, 60)}...` : `@${item.username}`
                }
              />
              {/* open chat arrow*/}
              <Box
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", pl: 1 }}
                onClick={() => handleChatClick(item)}
              >
                <Typography variant="body2" color="primary" fontWeight="bold" noWrap p={0}>
                  Open chat
                </Typography>
                <IconButton edge="end" aria-label="open chat" size="small" sx={{ p: 0 }}>
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            </ListItem>
            <Divider component="li" />
          </Box>
        ))}
      </List>
    </Container>
  );
}
