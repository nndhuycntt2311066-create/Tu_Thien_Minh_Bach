// NGUỒN DUY NHẤT cho thông tin contract
export const CONTRACT_ADDRESS = "0x61958A66c61566BbEec28feEE3acf933776244f3";

export const SEPOLIA_CHAIN_ID = 11155111n;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

// Link Etherscan để người dùng tự xác minh (cốt lõi của tính minh bạch)
export const etherscanTxUrl = (hash) => `https://sepolia.etherscan.io/tx/${hash}`;
export const etherscanAddressUrl = (address) => `https://sepolia.etherscan.io/address/${address}`;

// Block mà contract được deploy (xem trên Etherscan) - giúp đọc event nhanh và không bị giới hạn RPC
export const DEPLOY_BLOCK = 12160571; // <-- thay bằng số block thật