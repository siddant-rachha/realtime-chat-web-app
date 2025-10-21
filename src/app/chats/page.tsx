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
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    selectors: { user },
  } = useAuthContext();

  const generateChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join("_");
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const idToken = localStorage.getItem("idToken");
        const res = await fetch("/api/getChats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        const data = await res.json();
        setChats(data.chats || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) return <CircularProgress sx={{ mt: 5, display: "block", mx: "auto" }} />;

  if (!chats.length)
    return (
      <Container sx={{ mt: 5 }}>
        <Typography>No chats yet. Add friends to start chatting!</Typography>
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
      <List sx={{ width: "100%", maxWidth: 780, bgcolor: "background.paper", cursor: "pointer" }}>
        {chats.map((chat) => (
          <Box key={chat.chatId}>
            <Divider variant="inset" component="li" />
            <ListItem
              onClick={() => router.push(`/chats/${generateChatId(user!.uid, chat.friendUid)}`)}
              sx={{
                bgcolor: theme.palette.secondary.main,
                maxHeight: 100,
                height: 100,
                mb: 1,
                mt: 1,
                borderRadius: 2,
              }}
            >
              <ListItemAvatar>
                <Avatar alt={chat.displayName} src="#" />
              </ListItemAvatar>
              <ListItemText
                primary={chat.displayName}
                secondary={
                  chat.lastMessage ? `${chat.lastMessage.slice(0, 80)}...` : `@${chat.username}`
                }
              />
              {/* open chat arrow*/}
              <Box
                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={() => router.push(`/chats/${generateChatId(user!.uid, chat.friendUid)}`)}
              >
                <IconButton edge="end" aria-label="open chat">
                  <Typography variant="body2" color="primary">
                    Open chat
                  </Typography>

                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            </ListItem>
            <Divider variant="inset" component="li" />
          </Box>
        ))}
      </List>
    </Container>
  );
}
