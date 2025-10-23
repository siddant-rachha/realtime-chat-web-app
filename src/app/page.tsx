"use client";

import { useState } from "react";
import { Button, Container, Typography, Box, CircularProgress } from "@mui/material";
import { auth, googleAuthProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/useToast";
import { useAuthContext } from "@/store/Auth/useAuthContext";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { errorToast } = useToast();
  const {
    selectors: { firebaseUser },
  } = useAuthContext();

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

  if (firebaseUser)
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 12 }}>
        <Typography variant="h6" fontFamily="monospace">
          Redirecting to chats...
        </Typography>
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h6" sx={{ fontFamily: "monospace" }} gutterBottom>
        {!loading
          ? "Welcome to DiHola.Vercel.App 👋 Click on below sign in button to use all features."
          : "Signing you in..., please select your account and wait... refresh the page if it doesn't load after a long time."}
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
