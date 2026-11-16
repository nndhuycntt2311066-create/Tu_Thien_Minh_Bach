import { useTransaction } from "./useTransaction";
import { withdrawTx } from "../transactions";

export function useWithdraw(signer) {
  const { run, ...tx } = useTransaction();
  const withdraw = (campaignId) => run((onStatus) => withdrawTx(signer, campaignId, onStatus));
  return { withdraw, ...tx };
}