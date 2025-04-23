// Contract ABIs for interacting with the Sovran Wealth Fund ecosystem

// SWF Token ABI (minimal for frontend interactions)
export const SWF_TOKEN_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)"
];

// SWFBasketVault ABI (minimal for frontend interactions)
export const SWF_BASKET_VAULT_ABI = [
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function totalDeposited() external view returns (uint256)",
  "function deposits(address user) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)"
];

// SoloMethodEngine (Staking) ABI
export const SOLO_METHOD_ENGINE_ABI = [
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getReward() external",
  "function totalStaked() external view returns (uint256)",
  "function staked(address account) external view returns (uint256)",
  "function earned(address account) external view returns (uint256)",
  "function aprBasisPoints() external view returns (uint256)",
  "function rewardRate() external view returns (uint256)",
  "function rewardPerToken() external view returns (uint256)",
  "function lastTimeRewardApplicable() external view returns (uint256)"
];

// DynamicAPRController ABI
export const DYNAMIC_APR_CONTROLLER_ABI = [
  "function getAPRInfo() external view returns (uint256 currentAPR, uint256 nextAdjustmentTime, uint256 totalDeposited)",
  "function adjustAPR() external",
  "function simulateAPRForDeposit(uint256 depositAmount) external view returns (uint256)"
];

// Contract addresses - these should be configured based on environment
export const CONTRACT_ADDRESSES = {
  // Polygon Mainnet
  polygon: {
    // Correct contract addresses from your deployment
    swfToken: "0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7", // Replace with your deployed address
    vault: "0x883FaE02D319a5B7E67269bB21276B3e73DB43C9", // Replace with your deployed address
    stakingEngine: "0x8b7fD126e94A086B066bb3166Bb17834a09Ac73d", // Replace with your deployed address
    aprController: "0xFC49C9e14F5C40f0d91A248C6c8B77Cf8F55a748" // Replace with your deployed address
  },
  
  // Polygon Mumbai Testnet
  mumbai: {
    swfToken: "0x0000000000000000000000000000000000000000", // Replace with your testnet address if deployed
    vault: "0x0000000000000000000000000000000000000000", // Replace with your testnet address if deployed
    stakingEngine: "0x0000000000000000000000000000000000000000", // Replace with your testnet address if deployed
    aprController: "0x0000000000000000000000000000000000000000" // Replace with your testnet address if deployed
  },
  
  // Development / Hardhat
  development: {
    swfToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Local hardhat address (example)
    vault: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Local hardhat address (example)
    stakingEngine: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // Local hardhat address (example)
    aprController: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" // Local hardhat address (example)
  }
};

// Network configuration
export const SUPPORTED_NETWORKS = {
  137: {
    name: "Polygon Mainnet",
    chainName: "polygon",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"]
  },
  80001: {
    name: "Polygon Mumbai",
    chainName: "mumbai",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
  },
  31337: {
    name: "Local Development",
    chainName: "development",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["http://localhost:8545"],
    blockExplorerUrls: [""]
  }
};

// Function to get contract addresses based on network
export function getContractAddresses(chainId) {
  if (chainId === 137) {
    return CONTRACT_ADDRESSES.polygon;
  } else if (chainId === 80001) {
    return CONTRACT_ADDRESSES.mumbai;
  } else {
    // Default to development for local testing or if chain ID not recognized
    return CONTRACT_ADDRESSES.development;
  }
}

// Time-related constants
export const SECONDS_IN_YEAR = 31536000; // 365 days
export const BPS_DIVISOR = 10000; // Basis points divisor (100.00%)