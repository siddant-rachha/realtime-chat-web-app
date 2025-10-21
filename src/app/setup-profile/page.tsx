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

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // max 25
    if (value.length > 25) return;

    // Only allow valid characters in input
    if (/^[a-zA-Z0-9._]*$/.test(value)) {
      setUsername(value.toLowerCase());
    }
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 25 Max
    if (value.length > 25) return;

    setDisplayName(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !username) return alert("All fields required.");

    setCreating(true);
    try {
      if (!user) throw new Error("Not logged in");

      await userApi.createUser({
        displayName,
        username,
      });

      alert("Profile created!");
      router.push("/");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 12 }}>
      <Typography variant="h5" gutterBottom>
        Setup your profile
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Display Name"
          value={displayName}
          onChange={handleDisplayNameChange}
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
