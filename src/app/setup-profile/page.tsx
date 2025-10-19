"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Container, TextField, Typography, CircularProgress } from "@mui/material";
import { useAuthContext } from "@/store/Auth/useAuthContext";
import { userApi } from "@/apiService/userApi";

export default function SetupProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const {
    selectors: { user },
  } = useAuthContext();

  // Regex for Instagram-style usernames
  const usernameRegex = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/;

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow valid characters in input
    if (/^[a-zA-Z0-9._]*$/.test(value)) {
      setUsername(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !username) return alert("All fields required.");

    // Validate username
    if (!usernameRegex.test(username)) {
      return alert(
        "Invalid username. Only letters, numbers, underscores, and dots are allowed. Cannot end with dot or have consecutive dots.",
      );
    }

    setCreating(true);
    try {
      if (!user) throw new Error("Not logged in");

      await userApi.createUser({
        displayName,
        username,
      });

      alert("Profile created!");
      router.replace("/chats");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Setup your profile
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={handleUsernameChange}
          helperText="Allowed: letters, numbers, underscores, dots. No consecutive dots. Max 30 characters."
          sx={{ mb: 2 }}
        />

        <Button fullWidth variant="contained" color="primary" type="submit" disabled={creating}>
          {creating ? <CircularProgress size={24} color="inherit" /> : "Create Profile"}
        </Button>
      </Box>
    </Container>
  );
}
