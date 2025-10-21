"use client";

import { useState } from "react";
import { Container, Typography, TextField, Button, Box, CircularProgress } from "@mui/material";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/store/Auth/useAuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const {
    selectors: { user },
  } = useAuthContext();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username || "");
  const router = useRouter();

  const handleUpdate = async () => {
    if (!displayName.trim()) return alert("Display name cannot be empty");
    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await user.getIdToken();
      await fetch("/api/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, displayName, username }),
      });
      alert("Profile updated!");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 25 Max
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

  if (!user) {
    return (
      <Container sx={{ mt: 12, textAlign: "center" }}>
        <Typography variant="h6">Profile not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 12 }}>
      <Typography variant="h6" gutterBottom>
        My Profile
      </Typography>

      <Box sx={{ mt: 3 }}>
        <TextField
          label="Username"
          value={username}
          fullWidth
          margin="normal"
          onChange={handleUserNameChange}
        />
        <TextField
          label="Display Name"
          value={displayName}
          onChange={handleDisplayNameChange}
          fullWidth
          margin="normal"
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handleUpdate} disabled={saving}>
          {saving ? <CircularProgress size={22} color="inherit" /> : "Update"}
        </Button>
      </Box>
    </Container>
  );
}
