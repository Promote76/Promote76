// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";
import "@thirdweb-dev/contracts/eip/interface/IERC20.sol";

/// @title Sovran Wealth Fund Token
contract SovranWealthFund is ERC20Base, PermissionsEnumerable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20Base(msg.sender, "Sovran Wealth Fund", "SWF") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}

/// @title Solo Method Engine
/// @notice Manages 16-role staking logic and tracks per-user wallet structure
contract SoloMethodEngine {
    IERC20 public swf;
    address public admin;

    enum WalletRole { BUYER, HOLDER, STAKER, LIQUIDITY, TRACKER }

    struct WalletInfo {
        WalletRole role;
        uint256 balance;
    }

    mapping(address => WalletInfo[16]) public userWallets;
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public lastRewardTime;
    uint256 public constant REWARD_RATE = 5; // 5% APR
    uint256 public constant REWARD_PERIOD = 30 days;
    
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Minted(address indexed user, uint256 reward);

    constructor(address _swfTokenAddress) {
        swf = IERC20(_swfTokenAddress);
        admin = msg.sender;
    }

    function deposit(uint256 amount) external {
        require(amount >= 50 * 1e18, "Minimum 50 SWF required");
        require(swf.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Distribute the amount across 16 wallets evenly
        for (uint8 i = 0; i < 16; i++) {
            userWallets[msg.sender][i] = WalletInfo(WalletRole(i % 5), amount / 16);
        }

        stakedAmount[msg.sender] += amount;
        lastRewardTime[msg.sender] = block.timestamp;
        emit Deposited(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked balance");
        
        // Claim rewards first
        claimRewards();
        
        // Update staked amount
        stakedAmount[msg.sender] -= amount;
        
        // Reset wallet distribution
        if (stakedAmount[msg.sender] > 0) {
            // Recalculate wallets with new amount
            uint256 amountPerWallet = stakedAmount[msg.sender] / 16;
            for (uint8 i = 0; i < 16; i++) {
                userWallets[msg.sender][i].balance = amountPerWallet;
            }
        } else {
            // Clear all wallets if fully withdrawn
            for (uint8 i = 0; i < 16; i++) {
                userWallets[msg.sender][i].balance = 0;
            }
        }
        
        // Transfer SWF tokens back to user
        require(swf.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }
    
    function calculateRewards(address user) public view returns (uint256) {
        if (stakedAmount[user] == 0 || lastRewardTime[user] == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - lastRewardTime[user];
        uint256 rewardPeriods = timeElapsed / REWARD_PERIOD;
        
        if (rewardPeriods == 0) {
            return 0;
        }
        
        // Calculate reward: staked * rate * (timeElapsed / period)
        uint256 reward = stakedAmount[user] * REWARD_RATE * rewardPeriods / 100;
        return reward;
    }
    
    function claimRewards() public {
        uint256 reward = calculateRewards(msg.sender);
        if (reward > 0) {
            lastRewardTime[msg.sender] = block.timestamp;
            
            // Transfer rewards to user (requires contract to have minter role)
            SovranWealthFund swfToken = SovranWealthFund(address(swf));
            swfToken.mint(msg.sender, reward);
            emit Minted(msg.sender, reward);
        }
    }

    function getWalletBreakdown(address user) external view returns (WalletInfo[16] memory) {
        return userWallets[user];
    }

    function getTotalStaked(address user) external view returns (uint256) {
        return stakedAmount[user];
    }
    
    function getPendingRewards(address user) external view returns (uint256) {
        return calculateRewards(user);
    }
}