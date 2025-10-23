"use client";

import React, { createContext, useMemo } from "react";

import { AuthContextType } from "./types";
import { useAuthHook } from "./hooks";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, user, authLoading, signOutUser } = useAuthHook();

  const value = useMemo(
    () => ({
      selectors: { user, firebaseUser, authLoading },
      actions: { signOutUser },
    }),
    [user, firebaseUser, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
