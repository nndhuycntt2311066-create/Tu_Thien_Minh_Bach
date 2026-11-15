import { useState, useEffect, useCallback } from "react";
import { fetchDonations, getReadContract } from "../donations";

export function useDonations(campaignId, provider = null) {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);
      setDonations(await fetchDonations(campaignId, provider));
    } catch (err) {
      setError(err.shortMessage || err.message || "Không tải được lịch sử quyên góp.");
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, provider]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Cập nhật tức thời khi có người quyên góp mới
  useEffect(() => {
    const contract = getReadContract(provider);
    const onDonation = (id) => {
      if (Number(id) === Number(campaignId)) reload();
    };
    contract.on("DonationReceived", onDonation);
    return () => {
      contract.off("DonationReceived", onDonation); // gỡ listener khi component biến mất
    };
  }, [campaignId, provider, reload]);

  return { donations, isLoading, error, reload };
}