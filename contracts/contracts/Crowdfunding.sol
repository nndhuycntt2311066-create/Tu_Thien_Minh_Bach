// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ReentrancyGuard: chặn tấn công gọi lại hàm (reentrancy) khi chuyển ETH
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Crowdfunding is ReentrancyGuard {
    struct Campaign {
        address owner;        // người thụ hưởng, duy nhất được rút tiền
        string title;
        string description;
        string imageURI;
        uint256 goal;         // mục tiêu, đơn vị wei
        uint256 deadline;     // hạn chót (timestamp, giây)
        uint256 amountRaised; // tổng đã quyên góp
        bool withdrawn;       // đã giải ngân chưa
    }

    Campaign[] private campaigns;

    // campaignId => người quyên góp => số wei đã đóng (dùng để hoàn tiền)
    mapping(uint256 => mapping(address => uint256)) public donations;

    // Event giúp frontend và Etherscan truy vết mọi hoạt động (tính minh bạch)
    event CampaignCreated(uint256 indexed id, address indexed owner, uint256 goal, uint256 deadline);
    event DonationReceived(uint256 indexed id, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address indexed owner, uint256 amount);
    event Refunded(uint256 indexed id, address indexed donor, uint256 amount);

    // Chặn truy cập id không tồn tại
    modifier validCampaign(uint256 _id) {
        require(_id < campaigns.length, "Campaign does not exist");
        _;
    }

    function createCampaign(
        string calldata _title,
        string calldata _description,
        string calldata _imageURI,
        uint256 _goal,
        uint256 _durationInDays
    ) external returns (uint256 id) {
        require(bytes(_title).length > 0, "Title required");
        require(_goal > 0, "Goal must be > 0");
        require(_durationInDays > 0, "Duration must be > 0");

        id = campaigns.length;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);

        campaigns.push(Campaign({
            owner: msg.sender,
            title: _title,
            description: _description,
            imageURI: _imageURI,
            goal: _goal,
            deadline: deadline,
            amountRaised: 0,
            withdrawn: false
        }));

        emit CampaignCreated(id, msg.sender, _goal, deadline);
    }

    function donate(uint256 _id) external payable validCampaign(_id) {
        Campaign storage c = campaigns[_id];
        require(block.timestamp < c.deadline, "Campaign ended");
        require(msg.value > 0, "Send some ETH");

        c.amountRaised += msg.value;
        donations[_id][msg.sender] += msg.value;

        emit DonationReceived(_id, msg.sender, msg.value);
    }

    // Chỉ owner rút, và chỉ khi đã đạt mục tiêu
    function withdraw(uint256 _id) external nonReentrant validCampaign(_id) {
        Campaign storage c = campaigns[_id];
        require(msg.sender == c.owner, "Only owner");
        require(c.amountRaised >= c.goal, "Goal not reached");
        require(!c.withdrawn, "Already withdrawn");

        // Checks-Effects-Interactions: cập nhật trạng thái TRƯỚC khi chuyển tiền
        c.withdrawn = true;
        uint256 amount = c.amountRaised;

        (bool ok, ) = payable(c.owner).call{value: amount}("");
        require(ok, "Transfer failed");

        emit FundsWithdrawn(_id, c.owner, amount);
    }

    // Hoàn tiền khi chiến dịch hết hạn mà không đạt mục tiêu
    function refund(uint256 _id) external nonReentrant validCampaign(_id) {
        Campaign storage c = campaigns[_id];
        require(block.timestamp >= c.deadline, "Campaign still active");
        require(c.amountRaised < c.goal, "Goal reached, no refund");

        uint256 amount = donations[_id][msg.sender];
        require(amount > 0, "Nothing to refund");

        donations[_id][msg.sender] = 0; // đặt về 0 trước khi chuyển tiền

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        require(ok, "Refund failed");

        emit Refunded(_id, msg.sender, amount);
    }

    function getCampaign(uint256 _id) external view validCampaign(_id) returns (Campaign memory) {
        return campaigns[_id];
    }

    function getCampaignCount() external view returns (uint256) {
        return campaigns.length;
    }
}