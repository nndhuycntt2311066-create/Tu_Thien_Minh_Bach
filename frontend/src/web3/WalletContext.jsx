import { createContext } from "react";
import { useWalletState } from "./hooks/useWalletState";

export const WalletContext = createContext(null);

// Gọi useWalletState ĐÚNG MỘT LẦN ở đây, mọi component dùng chung kết quả
export function WalletProvider({ children }) {
  const wallet = useWalletState();
  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}