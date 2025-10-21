"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";
import { useAuthContext } from "@/store/Auth/useAuthContext";

const PUBLIC_ROUTES = ["/"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    selectors: { user, userLoading },
  } = useAuthContext();

  useEffect(() => {
    if (userLoading) return;

    // Not logged in → only allow public routes
    if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace("/");
    }
  }, [user, userLoading, pathname, router]);

  if (userLoading) {
    return (
      <Box
        sx={{
          position: "absolute",
          top: "40vh",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
