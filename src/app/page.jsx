"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        const idToken = await user.getIdToken();
        const res = await fetch("/api/checkProfile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        const data = await res.json();

        if (data.exists) {
          router.replace("/chats");
        } else {
          router.replace("/setup-profile");
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      googleAuthProvider.setCustomParameters({
        prompt: "select_account",
      });
      await signInWithPopup(auth, googleAuthProvider);
      // No redirect here — onAuthStateChanged will handle it
    } catch (err) {
      console.error(err);
      alert("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Realtime Chat App
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Sign in with Google"
          )}
        </Button>
      </Box>
    </Container>
  );
}
