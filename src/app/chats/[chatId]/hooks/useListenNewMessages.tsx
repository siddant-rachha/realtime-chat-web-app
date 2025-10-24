import { Message } from "@/commonTypes/types";
import { databaseInstance } from "@/lib/firebase";
import { onChildAdded, orderByChild, query, ref, startAfter } from "firebase/database";
import { useEffect } from "react";

export const useListenNewMessages = ({
  chatId,
  latestTimestamp,
  setMessages,
  scrollToBottom,
}: {
  chatId: string;
  latestTimestamp: number;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  scrollToBottom: () => void;
}) => {
  useEffect(() => {
    if (!latestTimestamp) return;
    const messagesRef = ref(databaseInstance, `chats/${chatId}`);
    //  Always attach listener for new messages after latest timestamp
    const newMessagesQuery = query(
      messagesRef,
      orderByChild("timestamp"),
      startAfter(latestTimestamp),
    );
    const unsubscribeAdded = onChildAdded(newMessagesQuery, (snap) => {
      const data = snap.val();
      if (!data) return;

      const newMsg: Message = {
        id: snap.key!,
        senderUid: data.senderUid,
        text: data.text,
        timestamp: Number(data.timestamp),
        status: data.status || {},
        deleted: data.deleted,
        edited: data.edited,
      };

      setMessages((prev) => [...prev, newMsg].sort((a, b) => a.timestamp - b.timestamp));
      setTimeout(scrollToBottom, 50);
    });

    return () => unsubscribeAdded();
  }, [chatId]);
};
