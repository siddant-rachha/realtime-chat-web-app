import { Message } from "@/commonTypes/types";
import { databaseInstance } from "@/lib/firebase";
import { onChildChanged, orderByChild, query, ref, startAfter } from "firebase/database";
import { useEffect } from "react";

export const useListenUpdatesForMsgs = ({
  chatId,
  earliestTimestamp,
  setMessages,
}: {
  chatId: string;
  earliestTimestamp: number | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}) => {
  const messagesRef = ref(databaseInstance, `chats/${chatId}`);
  const newMessagesQuery = query(
    messagesRef,
    orderByChild("timestamp"),
    startAfter(earliestTimestamp),
  );
  useEffect(() => {
    if (!earliestTimestamp) return;
    // Listen for updates to existing messages (sent/read status etc.)
    const unsubscribeChanged = onChildChanged(newMessagesQuery, (snap) => {
      const updatedData = snap.val();
      setMessages((prev) =>
        prev
          .map((m) =>
            m.id === snap.key
              ? { ...m, ...updatedData, timestamp: Number(updatedData.timestamp) }
              : m,
          )
          .sort((a, b) => a.timestamp - b.timestamp),
      );
    });

    return () => unsubscribeChanged();
  }, [chatId, earliestTimestamp]);
};
