import { useTransaction } from "./useTransaction";
import { donateTx } from "../transactions";

// signer lấy từ useWallet()
export function useDonate(signer) {
  const { run, ...tx } = useTransaction();
  const donate = (campaignId, amountEth) =>
    run((onStatus) => donateTx(signer, campaignId, amountEth, onStatus));
  return { donate, ...tx };
}