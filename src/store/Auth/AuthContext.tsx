"use client";

import React, { createContext, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  update,
  onDisconnect,
  onValue,
  serverTimestamp,
} from "firebase/database";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { userApi } from "@/apiService/userApi";
import { UserType } from "@/types/types";

// -------------------------------
// 🔑 Context Type Definition
// -------------------------------
interface AuthContextType {
  selectors: {
    user: UserType | null;
    firebaseUser: User | null;
    userLoading: boolean;
  };
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// -------------------------------
// 🧩 AuthProvider Component
// -------------------------------
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null); // Stores backend user profile
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null); // Stores Firebase Auth user
  const [userLoading, setUserLoading] = useState(true); // Loading state until auth resolves
  const router = useRouter();
  const pathname = usePathname();
  const lastUidRef = useRef<string | null>(null); // Keeps track of the last logged-in UID

  // -------------------------------
  // 👀 Watch for Firebase Auth Changes
  // -------------------------------
  useEffect(() => {
    const db = getDatabase();

    // Listener runs whenever Firebase login/logout happens
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // ✅ If user is logged in
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        lastUidRef.current = firebaseUser.uid;

        // Save token in localStorage (for backend requests)
        const idToken = await firebaseUser.getIdToken();
        localStorage.setItem("idToken", idToken);

        // ✅ Track presence (online/offline status)
        setupPresenceTracking(db, firebaseUser.uid);

        // ✅ Fetch user profile from backend
        const userData = await userApi.getProfile();

        // If profile not set up, go to setup page
        if (!userData.displayName) {
          router.replace("/setup-profile");
        } else {
          setUser(userData);
          // Redirect to /chats if on root or setup page
          if (pathname === "/" || pathname === "/setup-profile") {
            router.replace("/chats");
          }
        }
      }

      // ❌ If user is logged out
      else {
        await markUserOffline(lastUidRef.current);
        cleanupSession();
      }

      setUserLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // -------------------------------
  // 🧹 Handle Tab Close or Refresh
  // -------------------------------
  useEffect(() => {
    if (!firebaseUser) return;

    const db = getDatabase();
    const statusRef = ref(db, `status/${firebaseUser.uid}`);

    const handleUnload = () => {
      // Mark user offline when tab closes or reloads
      set(statusRef, { state: "offline", last_changed: Date.now() });
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [firebaseUser]);

  // -------------------------------
  // 🧠 Context Value
  // -------------------------------
  const value = useMemo(
    () => ({
      selectors: { user, firebaseUser, userLoading },
    }),
    [user, firebaseUser, userLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

  // ============================================================
  // 🧩 Helper Functions
  // ============================================================

  // Setup Firebase Realtime Database presence tracking
  function setupPresenceTracking(db: ReturnType<typeof getDatabase>, uid: string) {
    const userStatusRef = ref(db, `status/${uid}`);
    const connectedRef = ref(db, ".info/connected");

    const offlineState = { state: "offline", last_changed: serverTimestamp() };
    const onlineState = { state: "online", last_changed: serverTimestamp() };

    // When Firebase detects connection, update presence
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) return;
      onDisconnect(userStatusRef)
        .set(offlineState)
        .then(() => set(userStatusRef, onlineState));
    });
  }

  // Update user’s last status to offline on logout
  async function markUserOffline(uid: string | null) {
    if (!uid) return;
    const db = getDatabase();
    const statusRef = ref(db, `status/${uid}`);
    await update(statusRef, {
      state: "offline",
      last_changed: serverTimestamp(),
    });
  }

  // Clear session data on logout
  function cleanupSession() {
    setFirebaseUser(null);
    setUser(null);
    localStorage.removeItem("idToken");
    lastUidRef.current = null;
  }
};
