import { useState, useEffect, useCallback, useRef } from "react";
import { connectWallet, hasMetaMask } from "../wallet";

export function useWalletState() {
  const [wallet, setWallet] = useState(null);      // { provider, signer, address, balance }
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  // Giữ giá trị wallet MỚI NHẤT để các listener bên dưới đọc được
  // (listener chỉ đăng ký một lần nên không thấy state mới nếu đọc trực tiếp)
  const walletRef = useRef(null);
  useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);

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
  // Tự kết nối lại khi tải trang, NẾU người dùng đã cấp quyền trước đó
  // (eth_accounts KHÔNG bật popup, khác với eth_requestAccounts)
  useEffect(() => {
    if (!hasMetaMask()) return;
    let cancelled = false;

    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (!cancelled && accounts.length > 0) connect();
      })
      .catch(() => {
        // Không làm gì: người dùng sẽ bấm nút Kết nối thủ công
      });

    return () => {
      cancelled = true;
    };
  }, [connect]);
  // Lắng nghe đổi tài khoản / đổi mạng
  useEffect(() => {
    if (!hasMetaMask()) return;

    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) setWallet(null);  // người dùng ngắt ví trong MetaMask
      else if (walletRef.current) connect();       // chỉ cập nhật lại khi ĐANG kết nối (tránh popup ngoài ý muốn)
    };
    const onChainChanged = () => {
      if (walletRef.current) connect();            // chỉ kiểm tra lại mạng khi ĐANG kết nối
    };

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
