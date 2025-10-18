"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";
import { useAuth } from "@/store/AuthContext";

const PUBLIC_ROUTES = ["/"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not logged in → only allow public routes
    if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

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

  return <>{children}</>;
}
