import { Contract, JsonRpcProvider, formatEther } from "ethers";
import { CONTRACT_ADDRESS, DEPLOY_BLOCK } from "../contracts/config";
import { CROWDFUNDING_ABI } from "../contracts/abi";

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

export function getReadContract(provider) {
  return new Contract(CONTRACT_ADDRESS, CROWDFUNDING_ABI, provider ?? new JsonRpcProvider(RPC_URL));
}

// Lịch sử quyên góp của một chiến dịch, đọc từ event DonationReceived (công khai, không thể sửa)
export async function fetchDonations(campaignId, provider) {
  const contract = getReadContract(provider);
  const events = await contract.queryFilter(
    contract.filters.DonationReceived(campaignId), // lọc theo id (đã indexed)
    DEPLOY_BLOCK
  );
  return events
    .map((e) => ({
      donor: e.args.donor,
      amount: formatEther(e.args.amount), // wei -> ETH
      txHash: e.transactionHash,          // để tạo link Etherscan
      blockNumber: e.blockNumber,
    }))
    .reverse(); // mới nhất lên đầu
}