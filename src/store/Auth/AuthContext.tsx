"use client";

import React, { createContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { userApi } from "@/apiService/userApi";
import { UserType } from "@/types/types";
import {
  getDatabase,
  onDisconnect,
  ref,
  serverTimestamp,
  set,
  onValue,
  update,
} from "firebase/database";

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
  const lastUidRef = useRef<string | null>(null);

  useEffect(() => {
    const db = getDatabase();
    let userStatusRef: ReturnType<typeof ref> | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        lastUidRef.current = firebaseUser.uid;

        // ✅ Save ID token
        const idToken = await firebaseUser.getIdToken();
        localStorage.setItem("idToken", idToken);

        // ✅ Presence tracking setup
        userStatusRef = ref(db, `status/${firebaseUser.uid}`);
        const connectedRef = ref(db, ".info/connected");

        const isOfflineForDatabase = {
          state: "offline",
          last_changed: serverTimestamp(),
        };
        const isOnlineForDatabase = {
          state: "online",
          last_changed: serverTimestamp(),
        };

        onValue(connectedRef, (snapshot) => {
          if (snapshot.val() === false) return;
          onDisconnect(userStatusRef!)
            .set(isOfflineForDatabase)
            .then(() => {
              set(userStatusRef!, isOnlineForDatabase);
            });
        });

        // ✅ Fetch profile
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
        // 🔥 LOGOUT / SESSION END
        const lastUid = lastUidRef.current;
        if (lastUid) {
          const statusRef = ref(db, `status/${lastUid}`);
          await update(statusRef, {
            state: "offline",
            last_changed: serverTimestamp(),
          });
        }

        setFirebaseUser(null);
        setUser(null);
        localStorage.removeItem("idToken");
        lastUidRef.current = null;
      }

      setUserLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // ✅ Optional: handle tab close or refresh cleanly
  useEffect(() => {
    if (!firebaseUser) return;
    const db = getDatabase();
    const statusRef = ref(db, `status/${firebaseUser.uid}`);

    const handleUnload = () => {
      set(statusRef, {
        state: "offline",
        last_changed: Date.now(),
      });
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [firebaseUser]);

  const value = useMemo(
    () => ({
      selectors: { user, userLoading, firebaseUser },
    }),
    [user, userLoading, firebaseUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
