"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { userApi } from "@/apiService/userApi";

interface AuthContextType {
  selectors: {
    user: User | null;
    userLoading: boolean;
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const idToken = await firebaseUser?.getIdToken();
      if (idToken) {
        localStorage.setItem("idToken", idToken);
      }

      // check if user profile exists
      if (firebaseUser) {
        const { exists } = await userApi.checkProfile();
        if (!exists) {
          router.push("/setup-profile");
        } else {
          // User has profile, proceed to chats
          router.push("/chats");
        }
      }

      setUser(firebaseUser);
      setUserLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      selectors: { user, userLoading },
    }),
    [user, userLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
