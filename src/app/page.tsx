"use client";

import { useState } from "react";
import { Button, Container, Typography, Box, CircularProgress } from "@mui/material";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { errorToast } = useToast();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      googleAuthProvider.setCustomParameters({
        prompt: "select_account",
      });
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err) {
      console.error(err);
      errorToast("Failed to sign in, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h6" sx={{ fontFamily: "monospace" }} gutterBottom>
        {!loading
          ? "Welcome to DiHola.Vercel.App 👋 Click on below sign in button to use all features."
          : "Signing you in..., Please select your account and wait... Refresh the page if it doesn't load after a long time."}
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handleGoogleLogin} disabled={loading}>
          {loading ? (
            <>
              <CircularProgress size={24} color="inherit" />
            </>
          ) : (
            "Sign in with Google"
          )}
        </Button>
      </Box>
    </Container>
  );
}
