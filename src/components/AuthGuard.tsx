"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/store/Auth/useAuthContext";
import { LoadingText } from "./LoadingText";

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
    return <LoadingText text="Checking login..." />;
  }

  return <>{children}</>;
}
