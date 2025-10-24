import { messageApi } from "@/apiService/messageApi";
import { RefObject, useState } from "react";

export const useSendMessage = ({
  chatId,
  scrollToBottom,
  inputRef,
}: {
  chatId: string;
  scrollToBottom: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) => {
  const [sendingMsg, setSendingMsg] = useState(false);

  // Send message
  const handleSend = async () => {
    if (!inputRef.current?.value.trim() || sendingMsg) return; // Prevent multiple sends

    setSendingMsg(true);
    try {
      inputRef.current.focus();
      await messageApi.sendMessage({ chatId: chatId as string, text: inputRef.current.value });

      inputRef.current.value = "";
      inputRef.current.focus();

      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendingMsg(false);
    }
  };

  return {
    handleSend,
    sendingMsg,
  };
};
