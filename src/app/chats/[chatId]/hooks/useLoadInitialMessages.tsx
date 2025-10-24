import { Message } from "@/commonTypes/types";
import { databaseInstance } from "@/lib/firebase";
import { orderByChild, query, ref, get, limitToLast } from "firebase/database";
import { useEffect, useState } from "react";

export const useLoadInitialMessages = ({
  chatId,
  PAGE_SIZE,
  setMessages,
  scrollToBottom,
  setEarliestTimestamp,
  setLatestTimestamp,
}: {
  chatId: string;
  PAGE_SIZE: number;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  scrollToBottom: () => void;
  setEarliestTimestamp: React.Dispatch<React.SetStateAction<number | null>>;
  setLatestTimestamp: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [initialMsgLoading, setInitialMsgLoading] = useState(true);

  // Load initial messages
  useEffect(() => {
    if (!chatId) return;
    const messagesRef = ref(databaseInstance, `chats/${chatId}`);

    // Load initial messages (latest PAGE_SIZE messages)
    const loadInitialMessages = async () => {
      try {
        const initialQuery = query(messagesRef, orderByChild("timestamp"), limitToLast(PAGE_SIZE));
        const snap = await get(initialQuery);
        let msgs: Message[] = [];

        if (snap.exists()) {
          msgs = Object.entries(snap.val() as Record<string, Omit<Message, "id">>).map(
            ([id, data]) => ({
              id,
              ...data,
              timestamp: Number(data.timestamp),
            }),
          );
          msgs.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(msgs);

          if (msgs.length > 0) {
            setEarliestTimestamp(msgs[0].timestamp);
            setLatestTimestamp(msgs[msgs.length - 1].timestamp);
          }
        }

        setInitialMsgLoading(false);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setInitialMsgLoading(false);
      }
    };

    loadInitialMessages();
  }, [chatId]);

  return {
    initialMsgLoading,
  };
};
