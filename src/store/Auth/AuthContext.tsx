"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { userApi } from "@/apiService/userApi";
import { UserType } from "@/types/types";
import { getDatabase, onDisconnect, ref, serverTimestamp, set, onValue } from "firebase/database";

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

      if (firebaseUser) {
        setFirebaseUser(firebaseUser);

        // ✅ REALTIME PRESENCE TRACKING
        const db = getDatabase();
        const userStatusRef = ref(db, `status/${firebaseUser.uid}`);
        const connectedRef = ref(db, ".info/connected");

        const isOfflineForDatabase = {
          state: "offline",
          last_changed: serverTimestamp(),
        };

        const isOnlineForDatabase = {
          state: "online",
          last_changed: serverTimestamp(),
        };

        // 🔥 Listen for realtime connection state
        onValue(connectedRef, (snapshot) => {
          if (snapshot.val() === false) {
            // Not connected to Firebase Realtime Database
            return;
          }

          // When online, setup disconnect + set online
          onDisconnect(userStatusRef)
            .set(isOfflineForDatabase)
            .then(() => {
              set(userStatusRef, isOnlineForDatabase);
            });
        });

        // ✅ EXISTING PROFILE FETCH LOGIC
        const userResponse = await userApi.getProfile();
        if (!userResponse.displayName) {
          router.replace("/setup-profile");
        } else {
          setUser(userResponse);
          if (pathname === "/" || pathname === "/setup-profile") {
            router.replace("/chats");
          }
        }
      } else {
        // When logged out
        setFirebaseUser(null);
        setUser(null);
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
