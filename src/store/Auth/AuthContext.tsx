"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { userApi } from "@/apiService/userApi";
import { UserType } from "@/types/types";

interface AuthContextType {
  selectors: {
    user: UserType | null;
    userLoading: boolean;
    firebaseUser: User | null;
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const idToken = await firebaseUser?.getIdToken();
      if (idToken) {
        localStorage.setItem("idToken", idToken);
      }

      // check if user profile exists
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        const userResponse = await userApi.getProfile();
        if (!userResponse.displayName) {
          router.replace("/setup-profile");
        } else {
          setUser(userResponse);

          // User has profile, proceed to chats
          if (pathname === "/" || pathname === "/setup-profile") {
            router.replace("/chats");
          }
        }
      }

      setUserLoading(false);
    });
    return () => unsubscribe();
  }, [router, pathname]);

  const value = useMemo(
    () => ({
      selectors: { user, userLoading, firebaseUser },
    }),
    [user, userLoading, firebaseUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
