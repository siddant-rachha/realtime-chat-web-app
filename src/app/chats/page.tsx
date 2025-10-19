"use client";

import { Box, Typography, Button } from "@mui/material";
import { useAuth } from "@/store/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ChatsPage() {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">Hello, {user?.displayName || "User"} 👋</Typography>
      <Typography variant="body1">Welcome to your chats!</Typography>

      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => signOut(auth)}>
        Logout
      </Button>
    </Box>
  );
}
