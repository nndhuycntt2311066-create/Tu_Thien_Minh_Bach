import { Contract, parseEther } from "ethers";
import { CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID } from "../contracts/config";
import { CROWDFUNDING_ABI } from "../contracts/abi";
import { USE_MOCK } from "./campaigns";
import { translateError } from "./errors";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Luồng chung: confirming -> pending -> success | rejected | error
// send(contract) là hàm gửi giao dịch cụ thể, trả về đối tượng tx
async function runTx(signer, send, onStatus) {
  try {
    // Chế độ giả lập: không đụng blockchain, chỉ mô phỏng các trạng thái
    if (USE_MOCK) {
      onStatus({ state: "confirming" });
      await sleep(1500);
      const hash = "0x" + "ab".repeat(32); // hash giả, link Etherscan sẽ báo không tìm thấy
      onStatus({ state: "pending", hash });
      await sleep(2000);
      onStatus({ state: "success", hash });
      return;
    }

    if (!signer) throw new Error("Vui lòng kết nối ví trước.");

    // Luôn kiểm tra mạng trước khi gửi giao dịch
    const network = await signer.provider.getNetwork();
    if (network.chainId !== SEPOLIA_CHAIN_ID)
      throw new Error("Sai mạng. Vui lòng chuyển ví sang Sepolia.");

    const contract = new Contract(CONTRACT_ADDRESS, CROWDFUNDING_ABI, signer); // cần signer vì ghi dữ liệu

    onStatus({ state: "confirming" });          // chờ người dùng bấm Confirm trong MetaMask
    const tx = await send(contract);

    onStatus({ state: "pending", hash: tx.hash }); // đã gửi, chờ đưa vào block
    await tx.wait();

    onStatus({ state: "success", hash: tx.hash });
  } catch (err) {
    if (err?.code === "ACTION_REJECTED" || err?.code === 4001)
      onStatus({ state: "rejected", message: "Bạn đã từ chối giao dịch." });
    else
      onStatus({ state: "error", message: translateError(err) });
  }
}

export function donateTx(signer, campaignId, amountEth, onStatus) {
  return runTx(signer, async (contract) => {
    // Kiểm tra đầu vào ở frontend (contract vẫn là nơi kiểm tra cuối cùng)
    if (!amountEth || Number(amountEth) <= 0) throw new Error("Số tiền phải lớn hơn 0.");
    return contract.donate(campaignId, { value: parseEther(String(amountEth)) }); // ETH -> wei
  }, onStatus);
}

export function withdrawTx(signer, campaignId, onStatus) {
  return runTx(signer, (contract) => contract.withdraw(campaignId), onStatus);
}

export function refundTx(signer, campaignId, onStatus) {
  return runTx(signer, (contract) => contract.refund(campaignId), onStatus);
}

export function createCampaignTx(signer, { title, description, imageURI, goalEth, days }, onStatus) {
  return runTx(signer, async (contract) => {
    if (!title?.trim()) throw new Error("Vui lòng nhập tiêu đề.");
    if (!goalEth || Number(goalEth) <= 0) throw new Error("Mục tiêu phải lớn hơn 0.");
if (!Number.isInteger(Number(days)) || Number(days) <= 0)
  throw new Error("Số ngày phải là số nguyên lớn hơn 0.");
    return contract.createCampaign(
      title, description ?? "", imageURI ?? "",
      parseEther(String(goalEth)),   // ETH -> wei
      BigInt(days)
    );
  }, onStatus);
}