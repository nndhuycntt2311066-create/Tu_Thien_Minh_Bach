import { useState, useEffect, useCallback } from "react";
import { fetchCampaigns } from "../campaigns";

// provider: lấy từ useWallet (có thể để trống, khi đó chỉ đọc qua RPC công khai)
export function useCampaigns(provider = null) {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);
      setCampaigns(await fetchCampaigns(provider));
    } catch (err) {
      setError(err.shortMessage || err.message || "Không tải được danh sách chiến dịch.");
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    reload(); // tự tải khi component xuất hiện
  }, [reload]);

  return { campaigns, isLoading, error, reload };
}