'use client'
import { createContext } from "react";
import type { AuthContextType } from "./AuthProvider";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});