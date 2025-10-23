"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useAuthContext } from "@/store/Auth/useAuthContext";

const PUBLIC_ROUTES = ["/"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    selectors: { firebaseUser, authLoading },
  } = useAuthContext();

  useEffect(() => {
    if (authLoading) return;

    // Not logged in → only allow public routes
    if (!firebaseUser && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/");
    }
  }, [firebaseUser, authLoading, pathname, router]);

  if (authLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 12 }}>
        <Typography variant="h6" fontFamily="monospace">
          Checking login...
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
