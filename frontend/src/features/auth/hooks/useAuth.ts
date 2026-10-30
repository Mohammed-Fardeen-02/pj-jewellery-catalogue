"use client";

import * as React from "react";
import { AuthContext, type AuthContextValue } from "../context/AuthContext";

/**
 * Hook to access authentication context and state.
 * Throws a descriptive error if used outside an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
