import { userApi } from "@/apiService/userApi";
import { UserType } from "@/commonTypes/types";
import { auth, databaseInstance } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { onDisconnect, onValue, ref, serverTimestamp, set, update } from "firebase/database";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useAuthHook = () => {
  const router = useRouter();
  const pathname = usePathname();

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
      setAuthLoading(true);
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
    };

    checkUserRegistration();
  }, [firebaseUser, router]);

  // =====================

  // ===================== Mark User online/offline =====================
  useEffect(() => {
    function setupPresenceTracking() {
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
      onValue(connectedRef, (snapshot) => {
        // if not connected, return
        if (snapshot.val() === false) return;

        // register onDisconnect listener, runs when user disconnects
        onDisconnect(userStatusRef)
          // onDisconnect sets user status to offline
          .set(offlineState)

          // when onDisconnect registers first time, set user status to online
          .then(() => set(userStatusRef, onlineState));
      });
    }

    setupPresenceTracking();
  }, [firebaseUser, user]);

  // =====================

  // ===================== Sign Out and Mark User offline =====================
  const signOutUser = async () => {
    const statusRef = ref(databaseInstance, `status/${firebaseUser?.uid}`);
    await update(statusRef, {
      state: "offline",
      last_changed: serverTimestamp(),
    });
    setFirebaseUser(null);
    setUser(null);
    localStorage.removeItem("idToken");
    await auth.signOut();
  };
  // =====================

  return {
    firebaseUser,
    user,
    authLoading,
    signOutUser,
  };
};
