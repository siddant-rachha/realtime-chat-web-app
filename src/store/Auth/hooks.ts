import { userApi } from "@/apiService/userApi";
import { UserType } from "@/commonTypes/types";
import { useToast } from "@/hooks/useToast";
import { auth, databaseInstance } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { onDisconnect, onValue, ref, serverTimestamp, set, update } from "firebase/database";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useAuthHook = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { errorToast } = useToast();

  // ------ states ------
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null); // Stores Firebase Auth user
  const [user, setUser] = useState<UserType | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Loading state until auth resolves
  // --------------------

  // ===================== Authentication =====================
  // whenever pathname changes auth needs to be rechecked
  useEffect(() => {
    // Listener runs whenever Firebase login/logout happens
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If user is logged in
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);

        // Save token in localStorage (for backend requests)
        const idToken = await firebaseUser.getIdToken();
        localStorage.setItem("idToken", idToken);
      }

      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router, pathname]);
  // =====================

  // ===================== Check Registration =====================
  // check if user is registered user
  useEffect(() => {
    const checkUserRegistration = async () => {
      // check if user is logged in
      if (!firebaseUser) return;

      try {
        // Fetch user profile from backend
        const userData = await userApi.getProfile();

        // If profile not set up, go to setup page
        if (!userData.uid) {
          router.replace("/setup-profile");
        } else {
          setUser(userData);
          // Redirect to /chats if on root or setup page
          // other pages should not be redirected
          if (pathname === "/" || pathname === "/setup-profile") {
            router.replace("/chats");
          }
        }
      } catch (err) {
        console.log(err);
        errorToast("Failed to fetch user profile");
      }
    };

    checkUserRegistration();
  }, [firebaseUser, router]);

  // =====================

  // ===================== Mark User online/offline =====================
  useEffect(() => {
    // check if user is logged in and registered user
    if (!(firebaseUser && firebaseUser?.uid && user?.uid)) return;

    // objects to store
    const offlineState = { state: "offline", last_changed: serverTimestamp() };
    const onlineState = { state: "online", last_changed: serverTimestamp() };

    // check if the user is connected to database
    const connectedRef = ref(databaseInstance, ".info/connected");

    // get existing stored user status
    const userStatusRef = ref(databaseInstance, `status/${firebaseUser.uid}`);

    // register onValue listener, runs every time when connectedRef changes
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      // if not connected, return
      if (snapshot.val() === false) return;

      // register onDisconnect listener, runs when user disconnects
      onDisconnect(userStatusRef)
        // onDisconnect sets user status to offline
        .set(offlineState)

        // when onDisconnect registers first time, set user status to online
        .then(() => set(userStatusRef, onlineState));
    });

    return () => unsubscribe();
  }, [firebaseUser, user]);

  // =====================

  // ===================== Sign Out and Mark User offline =====================
  const signOutUser = async () => {
    if (!firebaseUser) return;

    markUserOffline();

    try {
      await auth.signOut();
      setFirebaseUser(null);
      setUser(null);
      localStorage.removeItem("idToken");
    } catch (err) {
      console.log(err);
      errorToast("Failed to sign out");
    }
  };
  // =====================

  // ===================== When User Focus or Blur, mark User online/offline =====================

  useEffect(() => {
    // check if user is logged in and registered user
    if (!(firebaseUser && firebaseUser?.uid && user?.uid)) return;
    const handleBlur = () => {
      markUserOffline();
    };

    const handleFocus = () => {
      markUserOnline();
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [firebaseUser, user]);
  // =====================

  const markUserOnline = async () => {
    const statusRef = ref(databaseInstance, `status/${firebaseUser?.uid}`);
    await update(statusRef, {
      state: "online",
      last_changed: serverTimestamp(),
    });
  };

  const markUserOffline = async () => {
    const statusRef = ref(databaseInstance, `status/${firebaseUser?.uid}`);
    await update(statusRef, {
      state: "offline",
      last_changed: serverTimestamp(),
    });
  };

  return {
    firebaseUser,
    user,
    authLoading,
    signOutUser,
  };
};
