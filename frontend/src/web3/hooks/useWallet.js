import { useContext } from "react";
import { WalletContext } from "../WalletContext";

// Mọi nơi gọi useWallet() đều nhận cùng một trạng thái ví
export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet phải nằm trong <WalletProvider>");
  return ctx;
}