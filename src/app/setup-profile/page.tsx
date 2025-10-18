"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

export default function SetupProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  // Check if user already has a profile
  useEffect(() => {
    const checkProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/");
        return;
      }

      const idToken = await user.getIdToken();
      const res = await fetch("/api/checkProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (data.exists) {
        // ✅ User already has profile → redirect to /chats
        router.replace("/chats");
      } else {
        // ✅ Allow filling the form
        setLoading(false);
      }
    };

    checkProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !username) return alert("All fields required.");

    setCreating(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not logged in");
      const idToken = await user.getIdToken();

      const res = await fetch("/api/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, displayName, username }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error creating profile");

      alert("Profile created!");
      router.replace("/chats");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={creating}
        >
          {creating ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Create Profile"
          )}
        </Button>
      </Box>
    </Container>
  );
}
