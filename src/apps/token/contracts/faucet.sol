// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LeanovaFaucet is Ownable {
    IERC20 public leanovaToken;
    uint256 public constant MAX_DISTRIBUTION = 100000 * 10 ** 18; // 100,000 tokens with 18 decimals
    uint256 public constant CLAIM_THRESHOLD = 50000 * 10 ** 18; // 50,000 tokens with 18 decimals
    uint256 public constant CLAIM_INTERVAL = 30 days;

    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount);

    constructor(
        address _leanovaTokenAddress,
        address initialOwner
    ) Ownable(initialOwner) {
        leanovaToken = IERC20(_leanovaTokenAddress);
    }

    function claimTokens() external {
        require(
            canClaim(msg.sender),
            "You are not eligible to claim tokens yet"
        );

        uint256 userBalance = leanovaToken.balanceOf(msg.sender);
        require(
            userBalance < CLAIM_THRESHOLD,
            "Your balance is too high to claim"
        );

        uint256 amountToClaim = MAX_DISTRIBUTION - totalClaimed[msg.sender];
        if (amountToClaim > MAX_DISTRIBUTION - userBalance) {
            amountToClaim = MAX_DISTRIBUTION - userBalance;
        }

        require(amountToClaim > 0, "No tokens available to claim");
        require(
            leanovaToken.balanceOf(address(this)) >= amountToClaim,
            "Insufficient tokens in the contract"
        );

        lastClaimTime[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += amountToClaim;

        require(
            leanovaToken.transfer(msg.sender, amountToClaim),
            "Token transfer failed"
        );

        emit TokensClaimed(msg.sender, amountToClaim);
    }

    function canClaim(address user) public view returns (bool) {
        return
            block.timestamp >= lastClaimTime[user] + CLAIM_INTERVAL &&
            totalClaimed[user] < MAX_DISTRIBUTION;
    }

    function withdrawExcessTokens(uint256 amount) external onlyOwner {
        require(
            leanovaToken.transfer(owner(), amount),
            "Token transfer failed"
        );
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}
}
