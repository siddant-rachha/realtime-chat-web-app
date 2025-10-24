import { Message } from "@/commonTypes/types";
import { databaseInstance } from "@/lib/firebase";
import { useAuthContext } from "@/store/Auth/useAuthContext";
import { ref, update } from "firebase/database";
import { useEffect } from "react";

export const useMakeMsgAsRead = ({ chatId, messages }: { chatId: string; messages: Message[] }) => {
  const {
    selectors: { user },
  } = useAuthContext();
  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (!chatId || !messages || !user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = {};

      messages.forEach((msg) => {
        // only prepare updates for messages that are in sent mode
        if (msg.senderUid !== user.uid && msg.status?.[user.uid] === "sent") {
          updates[`chats/${chatId}/${msg.id}/status/${user.uid}`] = "read";
        }
      });

      if (Object.keys(updates).length > 0) await update(ref(databaseInstance), updates);
    };

    if (messages.length > 0) markMessagesAsRead();
  }, [messages, chatId]);
};
