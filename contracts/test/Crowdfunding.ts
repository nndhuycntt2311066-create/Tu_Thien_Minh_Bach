import { expect } from "chai";
import { network } from "hardhat";

// Kết nối mạng giả lập; lấy ethers và công cụ chỉnh thời gian
const { ethers, networkHelpers } = await network.connect();

const ONE_DAY = 24 * 60 * 60;

describe("Crowdfunding", function () {
  // Hàm tạo môi trường mới cho mỗi test (deploy contract + lấy các ví thử)
  async function deploy() {
    const [owner, donor1, donor2, stranger] = await ethers.getSigners();
    const crowdfunding = await ethers.deployContract("Crowdfunding");
    return { crowdfunding, owner, donor1, donor2, stranger };
  }

  // Tạo sẵn 1 chiến dịch: mục tiêu 1 ETH, thời hạn 7 ngày
  async function withCampaign() {
    const env = await deploy();
    await env.crowdfunding
      .connect(env.owner)
      .createCampaign("Xay truong", "Mo ta", "ipfs://img", ethers.parseEther("1"), 7);
    return env;
  }

  describe("createCampaign", function () {
    it("tạo chiến dịch và phát event", async function () {
      const { crowdfunding, owner } = await deploy();
      await expect(
        crowdfunding.createCampaign("A", "B", "C", ethers.parseEther("1"), 7)
      ).to.emit(crowdfunding, "CampaignCreated");
      expect(await crowdfunding.getCampaignCount()).to.equal(1n);
      const c = await crowdfunding.getCampaign(0);
      expect(c.owner).to.equal(owner.address);
    });

    it("từ chối goal = 0", async function () {
      const { crowdfunding } = await deploy();
      await expect(
        crowdfunding.createCampaign("A", "B", "C", 0, 7)
      ).to.be.revertedWith("Goal must be > 0");
    });

    it("từ chối tiêu đề rỗng", async function () {
      const { crowdfunding } = await deploy();
      await expect(
        crowdfunding.createCampaign("", "B", "C", 1, 7)
      ).to.be.revertedWith("Title required");
    });
  });

  describe("donate", function () {
    it("nhận quyên góp và ghi nhận đúng số tiền", async function () {
      const { crowdfunding, donor1 } = await withCampaign();
      const amount = ethers.parseEther("0.4");
      await expect(crowdfunding.connect(donor1).donate(0, { value: amount }))
        .to.emit(crowdfunding, "DonationReceived")
        .withArgs(0, donor1.address, amount);
      expect(await crowdfunding.donations(0, donor1.address)).to.equal(amount);
      expect((await crowdfunding.getCampaign(0)).amountRaised).to.equal(amount);
    });

    it("từ chối quyên góp 0 ETH", async function () {
      const { crowdfunding, donor1 } = await withCampaign();
      await expect(
        crowdfunding.connect(donor1).donate(0, { value: 0 })
      ).to.be.revertedWith("Send some ETH");
    });

    it("từ chối khi chiến dịch đã hết hạn", async function () {
      const { crowdfunding, donor1 } = await withCampaign();
      await networkHelpers.time.increase(8 * ONE_DAY); // tua thời gian 8 ngày
      await expect(
        crowdfunding.connect(donor1).donate(0, { value: 1 })
      ).to.be.revertedWith("Campaign ended");
    });

    it("từ chối chiến dịch không tồn tại", async function () {
      const { crowdfunding, donor1 } = await deploy();
      await expect(
        crowdfunding.connect(donor1).donate(99, { value: 1 })
      ).to.be.revertedWith("Campaign does not exist");
    });
  });

  describe("withdraw", function () {
    it("owner rút được khi đạt mục tiêu", async function () {
      const { crowdfunding, owner, donor1 } = await withCampaign();
      await crowdfunding.connect(donor1).donate(0, { value: ethers.parseEther("1") });

      await expect(crowdfunding.connect(owner).withdraw(0)).to.changeEtherBalances(
        ethers,
        [owner, crowdfunding],
        [ethers.parseEther("1"), -ethers.parseEther("1")]
      );
    });

    it("chưa đạt mục tiêu thì không rút được", async function () {
      const { crowdfunding, owner, donor1 } = await withCampaign();
      await crowdfunding.connect(donor1).donate(0, { value: ethers.parseEther("0.5") });
      await expect(crowdfunding.connect(owner).withdraw(0)).to.be.revertedWith("Goal not reached");
    });

    it("người lạ không rút được", async function () {
      const { crowdfunding, donor1, stranger } = await withCampaign();
      await crowdfunding.connect(donor1).donate(0, { value: ethers.parseEther("1") });
      await expect(crowdfunding.connect(stranger).withdraw(0)).to.be.revertedWith("Only owner");
    });

    it("không rút được 2 lần", async function () {
      const { crowdfunding, owner, donor1 } = await withCampaign();
      await crowdfunding.connect(donor1).donate(0, { value: ethers.parseEther("1") });
      await crowdfunding.connect(owner).withdraw(0);
      await expect(crowdfunding.connect(owner).withdraw(0)).to.be.revertedWith("Already withdrawn");
    });
  });

  describe("refund", function () {
    it("hoàn tiền khi hết hạn mà không đạt mục tiêu", async function () {
      const { crowdfunding, donor1 } = await withCampaign();
      const amount = ethers.parseEther("0.3");
      await crowdfunding.connect(donor1).donate(0, { value: amount });
      await networkHelpers.time.increase(8 * ONE_DAY);

      await expect(crowdfunding.connect(donor1).refund(0)).to.changeEtherBalances(
        ethers,
        [donor1, crowdfunding],
        [amount, -amount]
      );
    });

    it("không hoàn tiền khi chiến dịch còn hoạt động", async function () {
      const { crowdfunding, donor1 } = await withCampaign();
      await crowdfunding.connect(donor1).donate(0, { value: 1 });
      await expect(crowdfunding.connect(donor1).refund(0)).to.be.revertedWith("Campaign still active");
    });

    it("không hoàn tiền khi đã đạt mục tiêu", async function () {
      const { crowdfunding, donor1 } = await withCampaign();
      await crowdfunding.connect(donor1).donate(0, { value: ethers.parseEther("1") });
      await networkHelpers.time.increase(8 * ONE_DAY);
      await expect(crowdfunding.connect(donor1).refund(0)).to.be.revertedWith("Goal reached, no refund");
    });

    it("không hoàn tiền 2 lần", async function () {
      const { crowdfunding, donor1 } = await withCampaign();
      await crowdfunding.connect(donor1).donate(0, { value: 1000 });
      await networkHelpers.time.increase(8 * ONE_DAY);
      await crowdfunding.connect(donor1).refund(0);
      await expect(crowdfunding.connect(donor1).refund(0)).to.be.revertedWith("Nothing to refund");
    });
  });
});