import { UserStatus } from "@/commonTypes/types";
import { databaseInstance } from "@/lib/firebase";
import { useNavContext } from "@/store/NavDrawer/useNavContext";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";

export const useGetFriendStatus = (friendUid: string) => {
  const {
    actions: { setNavSubTitle },
  } = useNavContext();

  const [friendStatus, setFriendStatus] = useState<UserStatus | null>(null);

  // Listen for friend's online/offline updates in real-time
  useEffect(() => {
    const refStatus = ref(databaseInstance, `status/${friendUid}`);
    const unsubscribe = onValue(refStatus, (snap) => {
      setFriendStatus(snap.exists() ? (snap.val() as UserStatus) : null);
    });
    return () => unsubscribe();
  }, [friendUid]);

  useEffect(() => {
    const updateText = () => {
      setNavSubTitle(getFriendStatusText(friendStatus));
    };
    updateText(); // initial
    const interval = setInterval(updateText, 60000); // every minute
    return () => clearInterval(interval);
  }, [friendStatus]);

  function getFriendStatusText(friendStatus: UserStatus | null) {
    if (!friendStatus) return "Offline";
    if (friendStatus.state === "online") return "Online";

    const diffMs = Date.now() - friendStatus.last_changed;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Last seen just now";
    if (diffMin < 60) return `Last seen ${diffMin} min ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Last seen ${diffHrs} hr ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `Last seen ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }
};
