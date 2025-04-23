#!/usr/bin/env node
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Load contract ABIs
const modularEngineAbi = [
  // ModularEngine basics
  "function swfToken() external view returns (address)",
  "function basketIndex() external view returns (address)",
  "function roleRouter() external view returns (address)",
  "function stakingEngine() external view returns (address)",
  
  // SoloMethodEngine functions via ModularEngine
  "function setStakingAPR(uint256 newAprBps) external",
  "function stakeTokens(uint256 amount) external",
  "function withdrawStakedTokens(uint256 amount) external",
  "function claimStakingRewards() external",
  "function getCurrentAPR() external view returns (uint256)",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function getTotalStaked(address user) external view returns (uint256)",
  
  // Role Router functions via ModularEngine
  "function setRoles(address[] calldata wallets, string[] calldata roles, uint256[] calldata shares) external",
  "function distributeRoleRewards() external",
  "function setMainDistributor(address newDistributor) external",
  "function setTreasury(address newTreasury) external",
  "function getWalletRole(address wallet) external view returns (string memory)",
  "function getWalletShare(address wallet) external view returns (uint256)",
  "function getWalletRoles() external view returns (address[] memory)",
  
  // BasketIndex functions via ModularEngine
  "function setBasketAssets(address[] calldata assets, uint256[] calldata weights) external",
  "function rebalanceBasket() external",
  "function mintBasketTokens(uint256 amount) external",
  "function burnBasketTokens(uint256 amount) external",
  "function getBasketAssets() external view returns (address[] memory)",
  "function getBasketWeights() external view returns (uint256[] memory)"
];

// Standalone SoloMethodEngine ABI for direct interaction if needed
const soloMethodEngineAbi = [
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function claimRewards() public",
  "function calculateRewards(address user) public view returns (uint256)",
  "function getWalletBreakdown(address user) external view returns (tuple(uint8 role, uint256 balance)[16])",
  "function getTotalStaked(address user) external view returns (uint256)",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function getCurrentAPR() external view returns (uint256)",
  "function setAPR(uint256 _newAprBps) external",
  "function admin() external view returns (address)"
];

// RoleRouter ABI for direct interaction if needed
const roleRouterAbi = [
  "function rewardToken() external view returns (address)",
  "function mainDistributor() external view returns (address)",
  "function treasury() external view returns (address)",
  "function setRoles(address[] calldata wallets, string[] calldata roles, uint256[] calldata shares) external",
  "function distributeRewards() external",
  "function setMainDistributor(address _newDistributor) external",
  "function setTreasury(address _newTreasury) external",
  "function getWalletRoles() external view returns (address[] memory)",
  "function getWalletShare(address wallet) external view returns (uint256)",
  "function getWalletRole(address wallet) external view returns (string memory)"
];

// BasketIndex ABI for direct interaction if needed
const basketIndexAbi = [
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function setAssets(address[] calldata assets, uint256[] calldata weights) external",
  "function rebalance() external",
  "function mint(uint256 amount) external",
  "function burn(uint256 amount) external",
  "function getUnderlyingAssets() external view returns (address[] memory)",
  "function getAssetWeights() external view returns (uint256[] memory)",
  "function assetWeights(address) external view returns (uint256)"
];

// ERC20 Token ABI
const tokenAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

// RPC Providers by network
const RPC_URLS = {
  polygon: process.env.RPC_URL || 
    `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` || 
    'https://polygon-rpc.com',
  mumbai: process.env.MUMBAI_RPC_URL || 
    `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` || 
    'https://rpc-mumbai.maticvigil.com',
  localhost: 'http://localhost:8545'
};

// Connect to the blockchain and load contracts
async function connect() {
  const network = process.env.NETWORK || 'polygon';
  const provider = new ethers.providers.JsonRpcProvider(RPC_URLS[network]);
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not set in .env file');
  }
  
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const signerAddress = wallet.address;
  
  // Load deployment info if available
  let deploymentInfo = {};
  let modularEngineAddress = process.env.MODULAR_ENGINE_ADDRESS;
  
  if (fs.existsSync('modular-system-deployment.json')) {
    deploymentInfo = JSON.parse(fs.readFileSync('modular-system-deployment.json', 'utf8'));
    
    if (!modularEngineAddress && deploymentInfo.modularEngine) {
      modularEngineAddress = deploymentInfo.modularEngine;
      console.log(`Using ModularEngine address from deployment info: ${modularEngineAddress}`);
    }
  }
  
  if (!modularEngineAddress) {
    throw new Error('MODULAR_ENGINE_ADDRESS not set in .env file or deployment info');
  }
  
  // Connect to the ModularEngine
  const modularEngine = new ethers.Contract(
    modularEngineAddress,
    modularEngineAbi,
    wallet
  );
  
  // Get addresses of other components if not specified in env
  let swfTokenAddress = process.env.SWF_CONTRACT_ADDRESS || deploymentInfo.swfToken;
  
  if (!swfTokenAddress) {
    swfTokenAddress = await modularEngine.swfToken();
    console.log(`Using SWF token address from ModularEngine: ${swfTokenAddress}`);
  }
  
  // Connect to SWF token
  const swfToken = new ethers.Contract(
    swfTokenAddress,
    tokenAbi,
    wallet
  );
  
  // Get additional component addresses if needed for direct interaction
  let soloMethodEngineAddress = process.env.SOLO_METHOD_ENGINE_ADDRESS || deploymentInfo.soloMethodEngine;
  let roleRouterAddress = process.env.ROLE_ROUTER_ADDRESS || deploymentInfo.roleRouter;
  let basketIndexAddress = process.env.BASKET_INDEX_ADDRESS || deploymentInfo.basketIndex;
  
  try {
    if (!soloMethodEngineAddress) {
      soloMethodEngineAddress = await modularEngine.stakingEngine();
    }
    
    if (!roleRouterAddress) {
      roleRouterAddress = await modularEngine.roleRouter();
    }
    
    if (!basketIndexAddress) {
      basketIndexAddress = await modularEngine.basketIndex();
    }
  } catch (error) {
    console.warn("Warning: Could not get all component addresses from ModularEngine");
  }
  
  // Connect to individual components if addresses available
  let soloMethodEngine, roleRouter, basketIndex;
  
  if (soloMethodEngineAddress) {
    soloMethodEngine = new ethers.Contract(
      soloMethodEngineAddress,
      soloMethodEngineAbi,
      wallet
    );
  }
  
  if (roleRouterAddress) {
    roleRouter = new ethers.Contract(
      roleRouterAddress,
      roleRouterAbi,
      wallet
    );
  }
  
  if (basketIndexAddress) {
    basketIndex = new ethers.Contract(
      basketIndexAddress,
      basketIndexAbi,
      wallet
    );
  }
  
  return {
    provider,
    wallet,
    signerAddress,
    swfToken,
    modularEngine,
    soloMethodEngine,
    roleRouter,
    basketIndex
  };
}

/**
 * Helper function to get optimal gas price
 * @returns {BigNumber} Optimal gas price in wei
 */
async function getOptimalGasPrice() {
  try {
    const { provider } = await connect();
    
    // Get current gas price
    const gasPrice = await provider.getGasPrice();
    
    // Increase gas price to ensure fast confirmation (37.5 gwei minimum recommended for Polygon)
    const minimumGasPrice = ethers.utils.parseUnits("37.5", "gwei");
    const optimalGasPrice = gasPrice.gt(minimumGasPrice) ? gasPrice : minimumGasPrice;
    
    return optimalGasPrice;
  } catch (error) {
    console.error("Error getting gas price:", error);
    return ethers.utils.parseUnits("40", "gwei"); // Fallback to 40 gwei
  }
}

// =====================
// SYSTEM INFO COMMANDS
// =====================

/**
 * Display overall system information
 */
async function getSystemInfo() {
  try {
    const { 
      signerAddress, 
      swfToken, 
      modularEngine, 
      soloMethodEngine, 
      roleRouter, 
      basketIndex 
    } = await connect();
    
    console.log("\n=== Sovran Wealth Fund Modular System ===");
    console.log(`Connected wallet: ${signerAddress}`);
    
    // Get token info
    const symbol = await swfToken.symbol();
    const name = await swfToken.name();
    const decimals = await swfToken.decimals();
    const balance = await swfToken.balanceOf(signerAddress);
    
    console.log(`\nToken: ${name} (${symbol})`);
    console.log(`Your balance: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);
    
    // Component addresses
    console.log("\nComponent Addresses:");
    console.log(`ModularEngine: ${modularEngine.address}`);
    
    if (soloMethodEngine) {
      console.log(`SoloMethodEngine: ${soloMethodEngine.address}`);
      try {
        const apr = await soloMethodEngine.getCurrentAPR();
        console.log(`Current APR: ${apr.toNumber() / 100}%`);
      } catch (error) {
        console.log("Could not get current APR");
      }
    }
    
    if (roleRouter) {
      console.log(`RoleRouter: ${roleRouter.address}`);
      try {
        const walletRoles = await roleRouter.getWalletRoles();
        console.log(`Registered wallets: ${walletRoles.length}`);
      } catch (error) {
        console.log("Could not get wallet roles");
      }
    }
    
    if (basketIndex) {
      console.log(`BasketIndex: ${basketIndex.address}`);
      try {
        const assets = await basketIndex.getUnderlyingAssets();
        console.log(`Basket assets: ${assets.length}`);
      } catch (error) {
        console.log("Could not get basket assets");
      }
    }
    
    console.log("\nSystem is ready to use!");
    
  } catch (error) {
    console.error("Error getting system information:", error.message);
    throw error;
  }
}

// =====================
// STAKING COMMANDS
// =====================

/**
 * Get staking information
 */
async function getStakingInfo() {
  try {
    const { signerAddress, swfToken, modularEngine, soloMethodEngine } = await connect();
    
    // Get basic token info
    const symbol = await swfToken.symbol();
    const name = await swfToken.name();
    const decimals = await swfToken.decimals();
    
    // Get wallet's token balance
    const balance = await swfToken.balanceOf(signerAddress);
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);
    
    // Get staking information
    const stakedAmount = await modularEngine.getTotalStaked(signerAddress);
    const formattedStaked = ethers.utils.formatUnits(stakedAmount, decimals);
    
    // Get current APR
    const currentAPR = await modularEngine.getCurrentAPR();
    const aprPercentage = currentAPR.toNumber() / 100;
    
    // Get pending rewards
    const pendingRewards = await modularEngine.getPendingRewards(signerAddress);
    const formattedRewards = ethers.utils.formatUnits(pendingRewards, decimals);
    
    console.log(`\n=== Staking Information for ${signerAddress} ===`);
    console.log(`Token: ${name} (${symbol})`);
    console.log(`Wallet balance: ${formattedBalance} ${symbol}`);
    console.log(`Total staked: ${formattedStaked} ${symbol}`);
    console.log(`Current APR: ${aprPercentage}%`);
    console.log(`Pending rewards: ${formattedRewards} ${symbol}`);
    
    // Get wallet breakdown if the direct soloMethodEngine contract is available
    if (soloMethodEngine && stakedAmount.gt(0)) {
      try {
        const wallets = await soloMethodEngine.getWalletBreakdown(signerAddress);
        const WALLET_ROLES = ["BUYER", "HOLDER", "STAKER", "LIQUIDITY", "TRACKER"];
        
        console.log("\nWallet Breakdown:");
        console.log("ID  | Role      | Balance");
        console.log("----|-----------|-------------");
        
        wallets.forEach((wallet, index) => {
          const roleName = WALLET_ROLES[wallet.role];
          const walletBalance = ethers.utils.formatUnits(wallet.balance, decimals);
          console.log(
            `${index.toString().padEnd(4)} | ${roleName.padEnd(10)} | ${walletBalance} ${symbol}`
          );
        });
      } catch (error) {
        console.log("Could not get wallet breakdown - requires direct access to SoloMethodEngine");
      }
    }
    
  } catch (error) {
    console.error("Error getting staking information:", error.message);
    throw error;
  }
}

/**
 * Approve spending of tokens by the modular engine
 * @param {string} amount The amount to approve (in token units, not wei)
 */
async function approveSpending(amount) {
  try {
    const { swfToken, modularEngine, signerAddress } = await connect();
    
    // Convert amount to wei
    const decimals = await swfToken.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    console.log(`Approving ${amount} SWF for the modular engine with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Approve token transfer
    const tx = await swfToken.approve(
      modularEngine.address,
      amountInWei,
      { gasPrice }
    );
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);
    
    await tx.wait();
    console.log(`✅ Approval confirmed!`);
    
  } catch (error) {
    console.error("Error approving tokens:", error.message);
    throw error;
  }
}

/**
 * Stake tokens via the ModularEngine
 * @param {string} amount The amount to stake (in token units, not wei)
 */
async function stakeTokens(amount) {
  try {
    const { swfToken, modularEngine, signerAddress } = await connect();
    
    // Convert amount to wei
    const decimals = await swfToken.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    // Check if wallet has enough tokens
    const balance = await swfToken.balanceOf(signerAddress);
    if (balance.lt(amountInWei)) {
      throw new Error(`Insufficient balance. You have ${ethers.utils.formatUnits(balance, decimals)} SWF but tried to stake ${amount} SWF.`);
    }
    
    // Check if allowance is sufficient
    const allowance = await swfToken.allowance(signerAddress, modularEngine.address);
    if (allowance.lt(amountInWei)) {
      console.log("Insufficient allowance. Approving tokens first...");
      await approveSpending(amount);
    }
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    console.log(`Staking ${amount} SWF with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Stake tokens
    const tx = await modularEngine.stakeTokens(
      amountInWei,
      { gasPrice, gasLimit: 500000 }
    );
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);
    
    await tx.wait();
    console.log(`✅ Staking confirmed!`);
    
    // Show updated staking info
    await getStakingInfo();
    
  } catch (error) {
    console.error("Error staking tokens:", error.message);
    throw error;
  }
}

/**
 * Withdraw staked tokens via the ModularEngine
 * @param {string} amount The amount to withdraw (in token units, not wei)
 */
async function withdrawTokens(amount) {
  try {
    const { swfToken, modularEngine, signerAddress } = await connect();
    
    // Convert amount to wei
    const decimals = await swfToken.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    // Check if staked balance is sufficient
    const stakedAmount = await modularEngine.getTotalStaked(signerAddress);
    if (stakedAmount.lt(amountInWei)) {
      throw new Error(`Insufficient staked balance. You have ${ethers.utils.formatUnits(stakedAmount, decimals)} SWF staked but tried to withdraw ${amount} SWF.`);
    }
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    console.log(`Withdrawing ${amount} SWF with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Withdraw tokens
    const tx = await modularEngine.withdrawStakedTokens(
      amountInWei,
      { gasPrice, gasLimit: 500000 }
    );
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);
    
    await tx.wait();
    console.log(`✅ Withdrawal confirmed!`);
    
    // Show updated staking info
    await getStakingInfo();
    
  } catch (error) {
    console.error("Error withdrawing tokens:", error.message);
    throw error;
  }
}

/**
 * Claim staking rewards via the ModularEngine
 */
async function claimRewards() {
  try {
    const { modularEngine, signerAddress } = await connect();
    
    // Check if there are rewards to claim
    const pendingRewards = await modularEngine.getPendingRewards(signerAddress);
    const decimals = 18; // SWF token decimals
    
    if (pendingRewards.isZero()) {
      console.log("No rewards available to claim.");
      return;
    }
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    console.log(`Claiming ${ethers.utils.formatUnits(pendingRewards, decimals)} SWF rewards with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Claim rewards
    const tx = await modularEngine.claimStakingRewards(
      { gasPrice, gasLimit: 300000 }
    );
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);
    
    await tx.wait();
    console.log(`✅ Rewards claimed!`);
    
    // Show updated staking info
    await getStakingInfo();
    
  } catch (error) {
    console.error("Error claiming rewards:", error.message);
    throw error;
  }
}

/**
 * Set a new APR for staking rewards via the ModularEngine (admin only)
 * @param {string} newAprPercentage The new APR in percentage (e.g., "20" for 20%)
 */
async function setAPR(newAprPercentage) {
  try {
    const { modularEngine, soloMethodEngine, signerAddress } = await connect();
    
    // Check if caller might be admin
    let isAdmin = false;
    if (soloMethodEngine) {
      try {
        const adminAddress = await soloMethodEngine.admin();
        isAdmin = signerAddress.toLowerCase() === adminAddress.toLowerCase();
        
        if (!isAdmin) {
          throw new Error("Only the admin can set the APR rate");
        }
      } catch (error) {
        console.log("Could not verify admin status, attempting to set APR anyway...");
      }
    }
    
    // Convert percentage to basis points (e.g., 20% = 2000 basis points)
    const basisPoints = parseInt(newAprPercentage) * 100;
    
    // Validate the APR is within acceptable range
    if (basisPoints <= 0 || basisPoints > 5000) {
      throw new Error("APR must be between 0.01% and 50%");
    }
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    // Get current APR for comparison
    const currentAPR = await modularEngine.getCurrentAPR();
    const currentPercentage = currentAPR.toNumber() / 100;
    
    console.log(`Changing APR from ${currentPercentage}% to ${newAprPercentage}% with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Set the new APR
    const tx = await modularEngine.setStakingAPR(
      basisPoints,
      { gasPrice, gasLimit: 200000 }
    );
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);
    
    await tx.wait();
    console.log(`✅ APR updated successfully to ${newAprPercentage}%!`);
    
    // Show updated staking info
    await getStakingInfo();
    
  } catch (error) {
    console.error("Error setting APR:", error.message);
    throw error;
  }
}

// =====================
// ROLE ROUTER COMMANDS
// =====================

/**
 * Get role router information
 */
async function getRoleRouterInfo() {
  try {
    const { signerAddress, modularEngine, roleRouter } = await connect();
    
    console.log("\n=== Role Router Information ===");
    
    // If we don't have direct access to role router, try through modular engine
    if (!roleRouter) {
      console.log("Limited information available - using ModularEngine only");
      
      try {
        const walletRoles = await modularEngine.getWalletRoles();
        console.log(`Number of configured wallets: ${walletRoles.length}`);
        
        if (walletRoles.length > 0) {
          console.log("\nWallet Roles:");
          console.log("Address | Role | Share");
          console.log("--------|------|------");
          
          for (let i = 0; i < walletRoles.length; i++) {
            const wallet = walletRoles[i];
            const role = await modularEngine.getWalletRole(wallet);
            const share = await modularEngine.getWalletShare(wallet);
            console.log(`${wallet.substring(0, 10)}... | ${role.padEnd(10)} | ${share.toString()} basis points`);
          }
        }
      } catch (error) {
        console.log("Could not retrieve wallet roles:", error.message);
      }
      
      return;
    }
    
    // Get detailed information if direct access is available
    try {
      const mainDistributor = await roleRouter.mainDistributor();
      const treasury = await roleRouter.treasury();
      
      console.log(`Main Distributor: ${mainDistributor}`);
      console.log(`Treasury: ${treasury}`);
      
      const walletRoles = await roleRouter.getWalletRoles();
      console.log(`\nNumber of configured wallets: ${walletRoles.length}`);
      
      if (walletRoles.length > 0) {
        console.log("\nWallet Roles:");
        console.log("Address | Role | Share");
        console.log("--------|------|------");
        
        for (let i = 0; i < walletRoles.length; i++) {
          const wallet = walletRoles[i];
          const role = await roleRouter.getWalletRole(wallet);
          const share = await roleRouter.getWalletShare(wallet);
          console.log(`${wallet.substring(0, 10)}... | ${role.padEnd(10)} | ${share.toString()} basis points`);
        }
      }
    } catch (error) {
      console.error("Error getting detailed role router info:", error.message);
    }
    
  } catch (error) {
    console.error("Error getting role router information:", error.message);
    throw error;
  }
}

/**
 * Distribute rewards according to roles via the ModularEngine
 */
async function distributeRoleRewards() {
  try {
    const { swfToken, modularEngine, roleRouter, signerAddress } = await connect();
    
    // Check if we have a balance to distribute
    const decimals = await swfToken.decimals();
    const symbol = await swfToken.symbol();
    const balance = await swfToken.balanceOf(signerAddress);
    
    if (balance.isZero()) {
      throw new Error(`You don't have any ${symbol} tokens to distribute`);
    }
    
    // Ask how many tokens to distribute
    const amount = await promptForInput(`Enter amount of ${symbol} to distribute (max ${ethers.utils.formatUnits(balance, decimals)}): `);
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    if (amountInWei.gt(balance)) {
      throw new Error(`Insufficient balance. You have ${ethers.utils.formatUnits(balance, decimals)} ${symbol} but tried to distribute ${amount} ${symbol}.`);
    }
    
    // First transfer tokens to the role router or modular engine
    console.log(`Transferring ${amount} ${symbol} for distribution...`);
    
    // Determine target address (role router directly if available, otherwise modular engine)
    const targetAddress = roleRouter ? roleRouter.address : modularEngine.address;
    
    const transferTx = await swfToken.transfer(targetAddress, amountInWei);
    await transferTx.wait();
    console.log(`✅ Tokens transferred for distribution`);
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    // Now distribute the rewards
    console.log(`Distributing rewards with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    const tx = await modularEngine.distributeRoleRewards(
      { gasPrice, gasLimit: 1000000 }
    );
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);
    
    await tx.wait();
    console.log(`✅ Rewards distributed successfully!`);
    
  } catch (error) {
    console.error("Error distributing role rewards:", error.message);
    throw error;
  }
}

// =====================
// BASKET INDEX COMMANDS
// =====================

/**
 * Get basket index information
 */
async function getBasketInfo() {
  try {
    const { modularEngine, basketIndex } = await connect();
    
    console.log("\n=== Basket Index Information ===");
    
    if (!basketIndex) {
      console.log("Limited information available - using ModularEngine only");
      
      try {
        const assets = await modularEngine.getBasketAssets();
        const weights = await modularEngine.getBasketWeights();
        
        console.log(`Number of assets in basket: ${assets.length}`);
        
        if (assets.length > 0) {
          console.log("\nBasket Composition:");
          console.log("Asset | Weight");
          console.log("------|-------");
          
          for (let i = 0; i < assets.length; i++) {
            console.log(`${assets[i].substring(0, 10)}... | ${weights[i].toString()} basis points`);
          }
        }
      } catch (error) {
        console.log("Could not retrieve basket assets:", error.message);
      }
      
      return;
    }
    
    // Get detailed information if direct access is available
    try {
      const name = await basketIndex.name();
      const symbol = await basketIndex.symbol();
      
      console.log(`Name: ${name}`);
      console.log(`Symbol: ${symbol}`);
      
      const assets = await basketIndex.getUnderlyingAssets();
      const weights = await basketIndex.getAssetWeights();
      
      console.log(`\nNumber of assets in basket: ${assets.length}`);
      
      if (assets.length > 0) {
        console.log("\nBasket Composition:");
        console.log("Asset | Weight");
        console.log("------|-------");
        
        for (let i = 0; i < assets.length; i++) {
          console.log(`${assets[i].substring(0, 10)}... | ${weights[i].toString()} basis points`);
        }
      }
    } catch (error) {
      console.error("Error getting detailed basket info:", error.message);
    }
    
  } catch (error) {
    console.error("Error getting basket information:", error.message);
    throw error;
  }
}

// =====================
// COMMAND LINE INTERFACE
// =====================

/**
 * Helper function to prompt for input
 * @param {string} question The question to ask
 * @returns {Promise<string>} The user's response
 */
function promptForInput(question) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    readline.question(question, answer => {
      readline.close();
      resolve(answer);
    });
  });
}

/**
 * Process command line arguments and execute the appropriate function
 */
async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
      console.log("Usage: node swf-modular-manager.js <command> [options]");
      console.log("\nSystem Commands:");
      console.log("  info                      Get system information");
      
      console.log("\nStaking Commands:");
      console.log("  staking-info              Get staking information");
      console.log("  approve <amount>          Approve tokens for staking");
      console.log("  stake <amount>            Stake tokens");
      console.log("  withdraw <amount>         Withdraw staked tokens");
      console.log("  claim                     Claim staking rewards");
      console.log("  set-apr <percentage>      Set APR percentage (admin only)");
      
      console.log("\nRole Router Commands:");
      console.log("  roles-info                Get role router information");
      console.log("  distribute                Distribute tokens according to roles");
      
      console.log("\nBasket Index Commands:");
      console.log("  basket-info               Get basket index information");
      return;
    }
    
    switch (command) {
      // System commands
      case "info":
        await getSystemInfo();
        break;
      
      // Staking commands
      case "staking-info":
        await getStakingInfo();
        break;
        
      case "approve":
        if (!args[1]) {
          console.log("Error: Missing amount to approve");
          console.log("Usage: node swf-modular-manager.js approve <amount>");
          return;
        }
        await approveSpending(args[1]);
        break;
        
      case "stake":
        if (!args[1]) {
          console.log("Error: Missing amount to stake");
          console.log("Usage: node swf-modular-manager.js stake <amount>");
          return;
        }
        await stakeTokens(args[1]);
        break;
        
      case "withdraw":
        if (!args[1]) {
          console.log("Error: Missing amount to withdraw");
          console.log("Usage: node swf-modular-manager.js withdraw <amount>");
          return;
        }
        await withdrawTokens(args[1]);
        break;
        
      case "claim":
        await claimRewards();
        break;
      
      case "set-apr":
        if (!args[1]) {
          console.log("Error: Missing APR percentage");
          console.log("Usage: node swf-modular-manager.js set-apr <percentage>");
          console.log("Example: node swf-modular-manager.js set-apr 20");
          return;
        }
        await setAPR(args[1]);
        break;
      
      // Role Router commands
      case "roles-info":
        await getRoleRouterInfo();
        break;
        
      case "distribute":
        await distributeRoleRewards();
        break;
      
      // Basket Index commands
      case "basket-info":
        await getBasketInfo();
        break;
        
      default:
        console.log(`Unknown command: ${command}`);
        console.log("Run without arguments to see usage information.");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });