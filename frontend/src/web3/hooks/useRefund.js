import { useTransaction } from "./useTransaction";
import { refundTx } from "../transactions";

export function useRefund(signer) {
  const { run, ...tx } = useTransaction();
  const refund = (campaignId) => run((onStatus) => refundTx(signer, campaignId, onStatus));
  return { refund, ...tx };
}