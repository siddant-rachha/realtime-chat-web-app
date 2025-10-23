"use client";

import { useEffect, useState } from "react";
import {
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
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
import { LoadingText } from "@/components/LoadingText";
import { Overlay } from "@/components/Overlay";
import { ChatListItem } from "@/commonTypes/types";
import { messageApi } from "@/apiService/messageApi";
import { useToast } from "@/hooks/useToast";

export default function ChatsListPage() {
  const router = useRouter();
  const [chatList, setChatList] = useState<ChatListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    selectors: { user },
  } = useAuthContext();
  const { errorToast } = useToast();

  const generateChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join("_");
  };

  const handleChatClick = (item: { friendUid: string; displayName: string }) => {
    setOpen(true);
    router.push(`/chats/${generateChatId(user!.uid, item.friendUid)}`);
  };

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const chatListRes = await messageApi.fetchChatList();
        setChatList(chatListRes.chatList);
      } catch (err) {
        console.error(err);
        errorToast("Failed to fetch chat list");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) return <LoadingText text="Loading chats..." />;

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
        {open && <Overlay />}
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
                primary={
                  <>
                    <Typography variant="body1" fontWeight="bold" component={"span"}>
                      {item.displayName}{" "}
                    </Typography>
                    <Typography
                      variant="body2"
                      component={"span"}
                      color="text.secondary"
                      fontStyle={"italic"}
                    >
                      @{item.username}
                    </Typography>
                  </>
                }
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
