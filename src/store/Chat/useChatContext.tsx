import { useContext } from "react";
import { ChatContext } from "./ChatContext";

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within an ChatProvider");
  }
  return context;
};
