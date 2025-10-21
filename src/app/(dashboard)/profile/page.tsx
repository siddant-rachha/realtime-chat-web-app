"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/store/Auth/useAuthContext";

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const {
    selectors: { user },
  } = useAuthContext();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username || "");

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
      setSnackbar(true);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h6">Profile not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Your Profile
      </Typography>

      <Box sx={{ mt: 3 }}>
        <TextField
          label="Username"
          value={user?.username}
          fullWidth
          margin="normal"
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
          margin="normal"
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handleUpdate} disabled={saving}>
          {saving ? <CircularProgress size={22} color="inherit" /> : "Update"}
        </Button>
      </Box>

      <Snackbar
        open={snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(false)}
        message="Profile updated successfully"
      />
    </Container>
  );
}
