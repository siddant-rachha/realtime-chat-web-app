"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";

interface NavContextType {
  selectors: {
    navTitle: string;
    isBackBtnEnabled?: boolean;
  };
  actions: {
    setNavTitle: (title: string) => void;
  };
}

export const NavContext = createContext<NavContextType | undefined>(undefined);

export const NavProvider = ({ children }: { children: React.ReactNode }) => {
  const [navTitle, setNavTitle] = useState<string>("");
  const pathname = usePathname();
  const { chatId } = useParams();

  useEffect(() => {
    switch (pathname) {
      case "/chats":
        setNavTitle("Chats");
        break;
      case "/profile":
        setNavTitle("Profile");
        break;
      case "/add-friend":
        setNavTitle("Add Friend");
        break;
      case "/setup-profile":
        setNavTitle("Setup Profile");
        break;
      case "/":
        setNavTitle("Welcome! Sign In to start");
        break;
      case `/chats/${chatId}`:
        // do nothing
        break;
      default:
        setNavTitle("");
    }
  }, [pathname]);

  const value = useMemo(() => {
    return {
      selectors: { navTitle, isBackBtnEnabled: pathname === `/chats/${chatId}` },
      actions: { setNavTitle },
    };
  }, [navTitle, pathname, chatId, setNavTitle]);

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
};
