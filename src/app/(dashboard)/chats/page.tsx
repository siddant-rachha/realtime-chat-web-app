"use client";

import { useEffect, useState } from "react";
import {
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/store/Auth/useAuthContext";

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
    <Container sx={{ mt: 3 }}>
      <List>
        {chats.map((chat) => (
          <ListItem
            key={chat.chatId}
            component="button"
            onClick={() => router.push(`/chats/${generateChatId(user!.uid, chat.friendUid)}`)}
          >
            <ListItemText
              primary={chat.displayName}
              secondary={chat.lastMessage ? `${chat.lastMessage}` : `@${chat.username}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
