import { Message } from "@/commonTypes/types";
import { databaseInstance } from "@/lib/firebase";
import { endAt, limitToLast, orderByChild, query, get, ref } from "firebase/database";
import { useState } from "react";

export const useLoadOldMessages = ({
  earliestTimestamp,
  setEarliestTimestamp,
  setMessages,
  chatId,
  PAGE_SIZE,
  scrollContainerRef,
}: {
  earliestTimestamp: number | null;
  setEarliestTimestamp: React.Dispatch<React.SetStateAction<number | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  chatId: string;
  PAGE_SIZE: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [loadingOlderMsgs, setLoadingOlderMsgs] = useState(false);
  // Load older messages
  const loadOlderMessages = async () => {
    if (!earliestTimestamp || loadingOlderMsgs) return;
    setLoadingOlderMsgs(true);

    const container = scrollContainerRef?.current;
    const scrollTopBefore = container?.scrollTop || 0;
    const scrollHeightBefore = container?.scrollHeight || 0;

    try {
      const messagesRef = ref(databaseInstance, `chats/${chatId}`);
      const olderQuery = query(
        messagesRef,
        orderByChild("timestamp"),
        endAt(earliestTimestamp - 1),
        limitToLast(PAGE_SIZE),
      );

      const snap = await get(olderQuery);
      if (snap.exists()) {
        const olderMsgs = Object.entries(snap.val() as Record<string, Omit<Message, "id">>).map(
          ([id, data]) => ({
            id,
            ...data,
            timestamp: Number(data.timestamp),
          }),
        ) as Message[];

        olderMsgs.sort((a, b) => a.timestamp - b.timestamp);

        setMessages((prev) => [...olderMsgs, ...prev]);

        if (olderMsgs.length > 0) setEarliestTimestamp(olderMsgs[0].timestamp);

        // Adjust scroll after DOM updates
        if (container) {
          requestAnimationFrame(() => {
            const scrollHeightAfter = container.scrollHeight;
            container.scrollTop = scrollTopBefore + (scrollHeightAfter - scrollHeightBefore);
          });
        }
      } else {
        setEarliestTimestamp(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOlderMsgs(false);
    }
  };

  return {
    loadOlderMessages,
    loadingOlderMsgs,
  };
};
