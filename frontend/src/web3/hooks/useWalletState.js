import { useState, useEffect, useCallback } from "react";
import { connectWallet, hasMetaMask } from "../wallet";

export function useWalletState() {
  const [wallet, setWallet] = useState(null);      // { provider, signer, address, balance }
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  const connect = useCallback(async () => {
    try {
      setError("");
      setIsConnecting(true);
      setWallet(await connectWallet());
    } catch (err) {
      // 4001 / ACTION_REJECTED = người dùng bấm Reject trong MetaMask
      if (err.code === 4001 || err.code === "ACTION_REJECTED") {
        setError("Bạn đã từ chối kết nối ví.");
      } else {
        setError(err.message || "Không thể kết nối ví.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // MetaMask không có lệnh "ngắt kết nối" thật; ta chỉ xóa trạng thái trong app
  const disconnect = useCallback(() => setWallet(null), []);

  // Lắng nghe đổi tài khoản / đổi mạng
  useEffect(() => {
    if (!hasMetaMask()) return;

    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) setWallet(null); // người dùng ngắt ví trong MetaMask
      else connect();                              // đổi tài khoản -> cập nhật lại
    };
    const onChainChanged = () => connect();        // đổi mạng -> kiểm tra lại

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);
    return () => {
      // Gỡ listener khi component biến mất để tránh rò rỉ
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, [connect]);

  return {
    address: wallet?.address ?? null,
    balance: wallet?.balance ?? null,
    provider: wallet?.provider ?? null,
    signer: wallet?.signer ?? null,
    isConnected: Boolean(wallet),
    isConnecting,
    error,
    connect,
    disconnect,
  };
}