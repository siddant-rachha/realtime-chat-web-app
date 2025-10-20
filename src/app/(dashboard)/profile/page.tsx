"use client";

import { useEffect, useState } from "react";
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
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    displayName: string;
    username: string;
  } | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.replace("/");
          return;
        }
        const idToken = await user.getIdToken();
        const res = await fetch("/api/getProfile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setDisplayName(data.profile.displayName || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

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
        body: JSON.stringify({ idToken, displayName }),
      });
      setSnackbar(true);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
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
        <TextField label="Username" value={profile.username} fullWidth margin="normal" disabled />
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
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
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
