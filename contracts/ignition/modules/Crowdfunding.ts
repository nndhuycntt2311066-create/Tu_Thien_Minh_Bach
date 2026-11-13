import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Module mô tả cách deploy: chỉ 1 contract, không có tham số
export default buildModule("CrowdfundingModule", (m) => {
  const crowdfunding = m.contract("Crowdfunding");
  return { crowdfunding };
});