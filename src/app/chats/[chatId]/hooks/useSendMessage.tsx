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

  const handleSend = async ({ text, image }: { text?: string; image?: string }) => {
    const trimmedText = text?.trim();

    if ((!trimmedText && !image) || sendingMsg) return;

    setSendingMsg(true);

    try {
      inputRef.current?.focus();

      await messageApi.sendMessage({
        chatId,
        text: trimmedText || "",
        image,
      });

      // Clear input only if text was sent from input box
      if (trimmedText) inputRef.current!.value = "";

      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSendingMsg(false);
    }
  };

  return { handleSend, sendingMsg };
};
