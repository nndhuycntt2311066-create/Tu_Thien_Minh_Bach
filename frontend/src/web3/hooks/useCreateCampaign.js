import { useTransaction } from "./useTransaction";
import { createCampaignTx } from "../transactions";

// signer lấy từ useWallet()
export function useCreateCampaign(signer) {
  const { run, ...tx } = useTransaction();
  const createCampaign = (data) => run((onStatus) => createCampaignTx(signer, data, onStatus));
  return { createCampaign, ...tx };
}