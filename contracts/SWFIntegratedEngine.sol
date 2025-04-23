// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ISovranWealthFund.sol";

contract SWFIntegratedEngine {
    // Admin
    address public admin;
    
    // Token contract
    IERC20 public swfToken;
    
    // APR settings
    uint256 public aprBasisPoints = 2500; // 25% APR (in basis points)
    uint256 public constant BPS_DIVISOR = 10000;
    uint256 public constant SECONDS_IN_YEAR = 31536000;
    uint256 public constant MIN_STAKE_AMOUNT = 50 * 1e18; // 50 SWF minimum
    
    // SoloMethod Engine - 16 wallet structure
    enum WalletRole { BUYER, HOLDER, STAKER, LIQUIDITY, TRACKER }

    struct WalletInfo {
        WalletRole role;
        uint256 balance;
    }
    
    mapping(address => WalletInfo[16]) public userWallets;
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public lastRewardTime;
    mapping(address => uint256) public rewardDebt;
    
    // Sovereign Engine - Role distribution structure
    mapping(address => string) public roleRegistry;
    mapping(string => uint256) public roleAllocations;
    address[] public recipients;
    
    // Events
    event APRUpdated(uint256 oldAPR, uint256 newAPR);
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Minted(address indexed user, uint256 reward);
    event RoleRegistered(address indexed wallet, string role, uint256 percentage);

    constructor(address _swfTokenAddress) {
        admin = msg.sender;
        swfToken = IERC20(_swfTokenAddress);
        
        // Initialize sovereign engine wallet roles and percentages
        _register(0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6, "Main Distributor", 15);
        _register(0x26A8401287cE33CC4aeb5a106cd6D282a9C2f51d, "Treasury", 20);
        _register(0x7456BB1ab2FBb40B67807563595Cb6c9698d9aA1, "Service Wallet", 5);
        _register(0x7E9A4698788d582F3B99364071f539841693201, "OTC Buyer 1", 5);
        _register(0x613afBE121004958cE6000CB2B14D1c8B0CbbB9, "OTC Buyer 2", 5);
        _register(0x6Ea77F0B7Fe41fe01661b8BD82aaDF95DBAA5E79, "OTC Buyer 3", 5);
        _register(0xCeDdb7dF2F6f1e1caC7AC767337A38Ab1D85e1eD, "OTC Buyer 4", 5);
        _register(0x50f7022033Ce4b1c025D7bFE56d0C27020Ae2Fe3, "Dividend Holder 1", 5);
        _register(0xEb02b2bC1CEb07F0B9bb78A8467CeB090A4643Fc, "Dividend Holder 2", 5);
        _register(0x3cCC9DEB6121aB5733a9F5715Dc92f4a40ED872A, "Dividend Holder 3", 5);
        _register(0x750a4dbc335D9de258D9d8297C002c4E002FdE34, "Dividend Holder 4", 5);
        _register(0x62c62b5Bc31cA7F04910d6Be28d74E07D82b4A5, "LP Wallet 1", 5);
        _register(0x5013Ae54fBaEC83106afA6cD26C06Ba64D2f718d, "LP Wallet 2", 5);
        _register(0x62850718f02f8f5874c0ADf156876eF01Ae8bE8C, "LP Wallet 3", 5);
        _register(0x8Af139af51Fc53DD7575e331Fbb039Cf029e2DF, "Governance Wallet", 3);
        _register(0xFE60C780Ba081a03F211d7eadD4ABcd34B60f78F, "Reward Collector", 2);
    }
    
    // Modifier for admin-only functions
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call");
        _;
    }
    
    //---------------------------
    // SOLO METHOD ENGINE FUNCTIONS
    //---------------------------
    
    /// @notice Set a new APR value (in basis points)
    /// @param _newAprBps The new APR in basis points (100 = 1%)
    function setAPR(uint256 _newAprBps) external onlyAdmin {
        require(_newAprBps <= 5000, "APR too high (max 50%)");
        uint256 oldApr = aprBasisPoints;
        aprBasisPoints = _newAprBps;
        emit APRUpdated(oldApr, _newAprBps);
    }
    
    /// @notice Stake tokens and distribute them across 16 wallets
    function deposit(uint256 amount) external {
        require(amount >= MIN_STAKE_AMOUNT, "Minimum 50 SWF required");
        require(swfToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update rewards before changing stake
        _updateRewards(msg.sender);

        // Distribute the amount across 16 wallets evenly
        for (uint8 i = 0; i < 16; i++) {
            userWallets[msg.sender][i] = WalletInfo(WalletRole(i % 5), amount / 16);
        }

        stakedAmount[msg.sender] += amount;
        lastRewardTime[msg.sender] = block.timestamp;
        emit Deposited(msg.sender, amount);
    }
    
    /// @notice Withdraw staked tokens
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked balance");
        
        // Update rewards before changing stake
        _updateRewards(msg.sender);
        
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
        require(swfToken.transfer(msg.sender, amount), "Transfer failed");
        emit Withdrawn(msg.sender, amount);
    }
    
    /// @notice Update user's reward debt for precise tracking
    function _updateRewards(address user) internal {
        uint256 pending = calculateRewards(user);
        rewardDebt[user] = pending;
        lastRewardTime[user] = block.timestamp;
    }
    
    /// @notice Calculate earned rewards with continuous compounding
    function calculateRewards(address user) public view returns (uint256) {
        if (stakedAmount[user] == 0 || lastRewardTime[user] == 0) {
            return rewardDebt[user];
        }
        
        uint256 timeElapsed = block.timestamp - lastRewardTime[user];
        
        // Calculate reward: staked * APR * (timeElapsed / SECONDS_IN_YEAR)
        uint256 reward = (stakedAmount[user] * aprBasisPoints * timeElapsed) / 
                        BPS_DIVISOR / SECONDS_IN_YEAR;
        
        return reward + rewardDebt[user];
    }
    
    /// @notice Claim accumulated rewards
    function claimRewards() public {
        _updateRewards(msg.sender);
        uint256 reward = rewardDebt[msg.sender];
        
        if (reward > 0) {
            rewardDebt[msg.sender] = 0;
            
            // Transfer rewards to user (requires contract to have minter role)
            ISovranWealthFund swfTokenMinter = ISovranWealthFund(address(swfToken));
            swfTokenMinter.mint(msg.sender, reward);
            emit Minted(msg.sender, reward);
        }
    }
    
    /// @notice Get the distribution of tokens across 16 wallets
    function getWalletBreakdown(address user) external view returns (WalletInfo[16] memory) {
        return userWallets[user];
    }
    
    /// @notice Get total staked amount for a user
    function getTotalStaked(address user) external view returns (uint256) {
        return stakedAmount[user];
    }
    
    /// @notice Get pending rewards for a user
    function getPendingRewards(address user) external view returns (uint256) {
        return calculateRewards(user);
    }
    
    /// @notice Get current APR in percentage (25% = 2500 basis points)
    function getCurrentAPR() external view returns (uint256) {
        return aprBasisPoints;
    }
    
    //---------------------------
    // SOVEREIGN ENGINE FUNCTIONS
    //---------------------------
    
    /// @notice Register a wallet with a role and percentage allocation
    function _register(address wallet, string memory role, uint256 percentage) internal {
        roleRegistry[wallet] = role;
        roleAllocations[role] = percentage;
        recipients.push(wallet);
        emit RoleRegistered(wallet, role, percentage);
    }
    
    /// @notice Get the list of all registered recipients
    function getRecipientList() external view returns (address[] memory) {
        return recipients;
    }
    
    /// @notice Get the role of a specific wallet
    function getRole(address wallet) public view returns (string memory) {
        return roleRegistry[wallet];
    }
    
    /// @notice Get the percentage allocation for a specific role
    function getAllocationByRole(string memory role) public view returns (uint256) {
        return roleAllocations[role];
    }
    
    /// @notice Find an address by its role
    function getAddressByRole(string memory role) public view returns (address) {
        for (uint i = 0; i < recipients.length; i++) {
            if (keccak256(bytes(roleRegistry[recipients[i]])) == keccak256(bytes(role))) {
                return recipients[i];
            }
        }
        return address(0);
    }
    
    /// @notice Distribute tokens to all recipients according to their percentage allocations
    function distributeTokens(uint256 amount) external onlyAdmin {
        require(amount > 0, "Amount must be greater than 0");
        
        // Check if contract has permission to transfer the tokens
        uint256 total = 0;
        
        for (uint i = 0; i < recipients.length; i++) {
            string memory role = roleRegistry[recipients[i]];
            uint256 percentage = roleAllocations[role];
            uint256 allocation = (amount * percentage) / 100;
            total += allocation;
            
            require(swfToken.transferFrom(msg.sender, recipients[i], allocation), 
                    "Token distribution failed");
        }
        
        // Transfer any remainder (due to rounding) to the Treasury
        if (total < amount) {
            uint256 remainder = amount - total;
            address treasury = getAddressByRole("Treasury");
            require(treasury != address(0), "Treasury not found");
            require(swfToken.transferFrom(msg.sender, treasury, remainder), 
                    "Remainder transfer failed");
        }
    }
}