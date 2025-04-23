// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SWFSovereignEngine {
    // Admin and role management
    address public admin;
    mapping(address => string) public roleRegistry;
    mapping(string => uint256) public roleAllocations;
    address[] public recipients;

    // APR and rewards management
    IERC20 public swfToken;
    uint256 public aprBasisPoints = 2500; // 25% APR (in basis points)
    uint256 public constant BPS_DIVISOR = 10000;
    uint256 public constant SECONDS_IN_YEAR = 31536000;
    
    // Staking tracking
    mapping(address => uint256) public staked;
    mapping(address => uint256) public lastRewardTime;
    mapping(address => uint256) public rewardDebt;
    
    event APRUpdated(uint256 oldAPR, uint256 newAPR);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _swfTokenAddress) {
        admin = msg.sender;
        swfToken = IERC20(_swfTokenAddress);

        // Initialize wallet roles and percentages
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

    // Role management functions
    function _register(address wallet, string memory role, uint256 percentage) internal {
        roleRegistry[wallet] = role;
        roleAllocations[role] = percentage;
        recipients.push(wallet);
    }

    function getRecipientList() external view returns (address[] memory) {
        return recipients;
    }

    function getRole(address wallet) public view returns (string memory) {
        return roleRegistry[wallet];
    }

    function getAllocationByRole(string memory role) public view returns (uint256) {
        return roleAllocations[role];
    }

    // Modifier for admin-only functions
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call");
        _;
    }

    // Dynamic APR functions
    function setAPR(uint256 _newAprBps) external onlyAdmin {
        require(_newAprBps <= 5000, "APR too high (max 50%)");
        uint256 oldApr = aprBasisPoints;
        aprBasisPoints = _newAprBps;
        emit APRUpdated(oldApr, _newAprBps);
    }

    function getCurrentAPR() external view returns (uint256) {
        return aprBasisPoints;
    }

    // Staking functions
    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        
        // Update rewards before changing stake
        _updateRewards(msg.sender);

        // Transfer tokens to this contract
        require(swfToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        // Update staking data
        staked[msg.sender] += amount;
        lastRewardTime[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(staked[msg.sender] >= amount, "Insufficient staked balance");
        
        // Update rewards before changing stake
        _updateRewards(msg.sender);
        
        // Update staked amount
        staked[msg.sender] -= amount;
        
        // Transfer tokens back to user
        require(swfToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }

    // Reward functions
    function _updateRewards(address user) internal {
        uint256 pending = calculateRewards(user);
        rewardDebt[user] = pending;
        lastRewardTime[user] = block.timestamp;
    }

    function calculateRewards(address user) public view returns (uint256) {
        if (staked[user] == 0 || lastRewardTime[user] == 0) {
            return rewardDebt[user];
        }
        
        uint256 timeElapsed = block.timestamp - lastRewardTime[user];
        uint256 reward = (staked[user] * aprBasisPoints * timeElapsed) / 
                        BPS_DIVISOR / SECONDS_IN_YEAR;
        
        return reward + rewardDebt[user];
    }

    function claimRewards() external {
        _updateRewards(msg.sender);
        uint256 reward = rewardDebt[msg.sender];
        
        if (reward > 0) {
            rewardDebt[msg.sender] = 0;
            
            // Transfer rewards from treasury to the user
            address treasury = getAddressByRole("Treasury");
            require(treasury != address(0), "Treasury not found");
            
            // This requires the Treasury to have approved this contract to spend SWF
            require(swfToken.transferFrom(treasury, msg.sender, reward), "Reward transfer failed");
            
            emit RewardsClaimed(msg.sender, reward);
        }
    }

    // Helper functions
    function getAddressByRole(string memory role) public view returns (address) {
        for (uint i = 0; i < recipients.length; i++) {
            if (keccak256(bytes(roleRegistry[recipients[i]])) == keccak256(bytes(role))) {
                return recipients[i];
            }
        }
        return address(0);
    }
    
    function getTotalStaked(address user) external view returns (uint256) {
        return staked[user];
    }
    
    function getPendingRewards(address user) external view returns (uint256) {
        return calculateRewards(user);
    }
}