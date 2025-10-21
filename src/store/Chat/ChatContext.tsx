"use client";

import React, { createContext, useMemo, useState } from "react";

interface ChatContextType {
  selectors: {
    currentChatFriendDisplayName: string;
  };
  actions: {
    setCurrentChatFriendDisplayName: (displayName: string) => void;
  };
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentChatFriendDisplayName, setCurrentChatFriendDisplayName] = useState<string>("");

  const value = useMemo(() => {
    return {
      selectors: { currentChatFriendDisplayName },
      actions: { setCurrentChatFriendDisplayName },
    };
  }, [currentChatFriendDisplayName, setCurrentChatFriendDisplayName]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
