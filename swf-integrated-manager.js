#!/usr/bin/env node
require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Load ABI for the integrated engine
const engineAbi = [
  // SoloMethodEngine functions
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function claimRewards() public",
  "function calculateRewards(address user) public view returns (uint256)",
  "function getWalletBreakdown(address user) external view returns (tuple(uint8 role, uint256 balance)[16])",
  "function getTotalStaked(address user) external view returns (uint256)",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function getCurrentAPR() external view returns (uint256)",
  "function setAPR(uint256 _newAprBps) external",
  "function admin() external view returns (address)",
  
  // SovereignEngine functions
  "function getRecipientList() external view returns (address[])",
  "function getRole(address wallet) public view returns (string)",
  "function getAllocationByRole(string memory role) public view returns (uint256)",
  "function getAddressByRole(string memory role) public view returns (address)",
  "function distributeTokens(uint256 amount) external"
];

// Load ABI from the compile output (this is a simplified ERC20 ABI)
const tokenAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)"
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

/**
 * Connect to provider and wallet
 * @returns {Object} Object containing provider, wallet, contracts, and signer address
 */
async function connect() {
  const network = process.env.NETWORK || 'polygon';
  const provider = new ethers.providers.JsonRpcProvider(RPC_URLS[network]);
  
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not set in .env file');
  }
  
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const signerAddress = wallet.address;
  
  if (!process.env.SWF_CONTRACT_ADDRESS) {
    throw new Error('SWF_CONTRACT_ADDRESS not set in .env file');
  }
  
  if (!process.env.INTEGRATED_ENGINE_ADDRESS) {
    throw new Error('INTEGRATED_ENGINE_ADDRESS not set in .env file');
  }
  
  const swfToken = new ethers.Contract(
    process.env.SWF_CONTRACT_ADDRESS,
    tokenAbi,
    wallet
  );
  
  const integratedEngine = new ethers.Contract(
    process.env.INTEGRATED_ENGINE_ADDRESS,
    engineAbi,
    wallet
  );
  
  return {
    provider,
    wallet,
    swfToken,
    integratedEngine,
    signerAddress
  };
}

/**
 * Get staking information
 */
async function getStakingInfo() {
  try {
    const { swfToken, integratedEngine, signerAddress } = await connect();
    
    // Get basic token info
    const symbol = await swfToken.symbol();
    const name = await swfToken.name();
    const decimals = await swfToken.decimals();
    
    // Get wallet's token balance
    const balance = await swfToken.balanceOf(signerAddress);
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);
    
    // Get staking information
    const stakedAmount = await integratedEngine.getTotalStaked(signerAddress);
    const formattedStaked = ethers.utils.formatUnits(stakedAmount, decimals);
    
    // Get current APR
    const currentAPR = await integratedEngine.getCurrentAPR();
    const aprPercentage = currentAPR.toNumber() / 100;
    
    // Get pending rewards
    const pendingRewards = await integratedEngine.getPendingRewards(signerAddress);
    const formattedRewards = ethers.utils.formatUnits(pendingRewards, decimals);
    
    // Get wallet breakdown
    const wallets = await integratedEngine.getWalletBreakdown(signerAddress);
    
    // Get admin address
    const adminAddress = await integratedEngine.admin();
    const isAdmin = signerAddress.toLowerCase() === adminAddress.toLowerCase();
    
    console.log(`\n=== Staking Information for ${signerAddress} ===`);
    console.log(`Token: ${name} (${symbol})`);
    console.log(`Wallet balance: ${formattedBalance} ${symbol}`);
    console.log(`Total staked: ${formattedStaked} ${symbol}`);
    console.log(`Current APR: ${aprPercentage}%`);
    console.log(`Pending rewards: ${formattedRewards} ${symbol}`);
    if (isAdmin) {
      console.log(`Admin Status: ✅ You are the contract admin`);
    }
    
    if (stakedAmount.gt(0)) {
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
    }
    
    return {
      balance: formattedBalance,
      staked: formattedStaked,
      rewards: formattedRewards,
      apr: aprPercentage,
      isAdmin
    };
    
  } catch (error) {
    console.error("Error getting staking information:", error.message);
    throw error;
  }
}

/**
 * Get sovereign engine information
 */
async function getSovereignInfo() {
  try {
    const { swfToken, integratedEngine, signerAddress } = await connect();
    
    // Get basic token info
    const symbol = await swfToken.symbol();
    const name = await swfToken.name();
    const decimals = await swfToken.decimals();
    
    // Get admin address
    const adminAddress = await integratedEngine.admin();
    const isAdmin = signerAddress.toLowerCase() === adminAddress.toLowerCase();
    
    // Get recipients
    const recipients = await integratedEngine.getRecipientList();
    
    console.log(`\n=== Sovereign Engine Information ===`);
    console.log(`Token: ${name} (${symbol})`);
    console.log(`Admin: ${adminAddress}`);
    if (isAdmin) {
      console.log(`Admin Status: ✅ You are the contract admin`);
    }
    console.log(`Number of registered wallets: ${recipients.length}`);
    
    console.log("\nWallet Allocations:");
    console.log("Address | Role | Allocation");
    console.log("--------|------|----------");
    
    let totalAllocation = 0;
    
    for (let i = 0; i < recipients.length; i++) {
      const address = recipients[i];
      const role = await integratedEngine.getRole(address);
      const allocation = await integratedEngine.getAllocationByRole(role);
      totalAllocation += allocation;
      
      console.log(`${address.substring(0, 10)}... | ${role.padEnd(20)} | ${allocation}%`);
    }
    
    console.log(`\nTotal allocation: ${totalAllocation}%`);
    
    return {
      isAdmin,
      recipients: recipients.length,
      totalAllocation
    };
    
  } catch (error) {
    console.error("Error getting sovereign information:", error.message);
    throw error;
  }
}

/**
 * Approve spending of tokens by the integrated engine
 * @param {string} amount The amount to approve (in token units, not wei)
 */
async function approveSpending(amount) {
  try {
    const { swfToken, integratedEngine, signerAddress } = await connect();
    
    // Convert amount to wei
    const decimals = await swfToken.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    console.log(`Approving ${amount} SWF for the integrated engine with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Approve token transfer
    const tx = await swfToken.approve(
      integratedEngine.address,
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
 * Stake tokens in the Integrated Engine
 * @param {string} amount The amount to stake (in token units, not wei)
 */
async function stakeTokens(amount) {
  try {
    const { swfToken, integratedEngine, signerAddress } = await connect();
    
    // Convert amount to wei
    const decimals = await swfToken.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    // Check if wallet has enough tokens
    const balance = await swfToken.balanceOf(signerAddress);
    if (balance.lt(amountInWei)) {
      throw new Error(`Insufficient balance. You have ${ethers.utils.formatUnits(balance, decimals)} SWF but tried to stake ${amount} SWF.`);
    }
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    console.log(`Staking ${amount} SWF with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Stake tokens
    const tx = await integratedEngine.deposit(
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
 * Withdraw tokens from the Integrated Engine
 * @param {string} amount The amount to withdraw (in token units, not wei)
 */
async function withdrawTokens(amount) {
  try {
    const { swfToken, integratedEngine, signerAddress } = await connect();
    
    // Convert amount to wei
    const decimals = await swfToken.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    // Check if staked balance is sufficient
    const stakedAmount = await integratedEngine.getTotalStaked(signerAddress);
    if (stakedAmount.lt(amountInWei)) {
      throw new Error(`Insufficient staked balance. You have ${ethers.utils.formatUnits(stakedAmount, decimals)} SWF staked but tried to withdraw ${amount} SWF.`);
    }
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    console.log(`Withdrawing ${amount} SWF with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Withdraw tokens (this will also claim any pending rewards)
    const tx = await integratedEngine.withdraw(
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
 * Claim rewards from the Integrated Engine
 */
async function claimRewards() {
  try {
    const { integratedEngine, signerAddress } = await connect();
    
    // Check if there are rewards to claim
    const pendingRewards = await integratedEngine.getPendingRewards(signerAddress);
    const decimals = 18; // SWF token decimals
    
    if (pendingRewards.isZero()) {
      console.log("No rewards available to claim.");
      return;
    }
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    console.log(`Claiming ${ethers.utils.formatUnits(pendingRewards, decimals)} SWF rewards with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Claim rewards
    const tx = await integratedEngine.claimRewards(
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
 * Set a new APR for the Integrated Engine (admin only)
 * @param {string} newAprPercentage The new APR in percentage (e.g., "20" for 20%)
 */
async function setAPR(newAprPercentage) {
  try {
    const { integratedEngine, signerAddress } = await connect();
    
    // Check if caller is admin
    const adminAddress = await integratedEngine.admin();
    if (signerAddress.toLowerCase() !== adminAddress.toLowerCase()) {
      throw new Error("Only the admin can set the APR rate");
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
    const currentAPR = await integratedEngine.getCurrentAPR();
    const currentPercentage = currentAPR.toNumber() / 100;
    
    console.log(`Changing APR from ${currentPercentage}% to ${newAprPercentage}% with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Set the new APR
    const tx = await integratedEngine.setAPR(
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

/**
 * Distribute tokens according to wallet allocations (admin only)
 * @param {string} amount The amount to distribute (in token units, not wei)
 */
async function distributeTokens(amount) {
  try {
    const { swfToken, integratedEngine, signerAddress } = await connect();
    
    // Check if caller is admin
    const adminAddress = await integratedEngine.admin();
    if (signerAddress.toLowerCase() !== adminAddress.toLowerCase()) {
      throw new Error("Only the admin can distribute tokens");
    }
    
    // Convert amount to wei
    const decimals = await swfToken.decimals();
    const amountInWei = ethers.utils.parseUnits(amount, decimals);
    
    // Check if wallet has enough tokens
    const balance = await swfToken.balanceOf(signerAddress);
    if (balance.lt(amountInWei)) {
      throw new Error(`Insufficient balance. You have ${ethers.utils.formatUnits(balance, decimals)} SWF but tried to distribute ${amount} SWF.`);
    }
    
    // Approve the engine to spend the tokens if needed
    const allowance = await swfToken.allowance(signerAddress, integratedEngine.address);
    if (allowance.lt(amountInWei)) {
      console.log("Approving token transfer for distribution...");
      const approveTx = await swfToken.approve(integratedEngine.address, amountInWei);
      await approveTx.wait();
      console.log("✅ Approval confirmed!");
    }
    
    // Get gas parameters
    const gasPrice = await getOptimalGasPrice();
    
    console.log(`Distributing ${amount} SWF with gas price ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei...`);
    
    // Distribute tokens
    const tx = await integratedEngine.distributeTokens(
      amountInWei,
      { gasPrice, gasLimit: 1000000 }
    );
    
    console.log(`Transaction sent: ${tx.hash}`);
    console.log(`Waiting for confirmation...`);
    
    await tx.wait();
    console.log(`✅ Tokens distributed successfully!`);
    
    // Show updated sovereign info
    await getSovereignInfo();
    
  } catch (error) {
    console.error("Error distributing tokens:", error.message);
    throw error;
  }
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

/**
 * Process command line arguments and execute the appropriate function
 */
async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
      console.log("Usage: node swf-integrated-manager.js <command> [options]");
      console.log("\nStaking Commands:");
      console.log("  staking-info              Get staking information");
      console.log("  approve <amount>          Approve tokens for staking");
      console.log("  stake <amount>            Stake tokens");
      console.log("  withdraw <amount>         Withdraw staked tokens");
      console.log("  claim                     Claim staking rewards");
      console.log("  set-apr <percentage>      Set APR percentage (admin only)");
      console.log("\nSovereign Commands:");
      console.log("  sovereign-info            Get sovereign engine information");
      console.log("  distribute <amount>       Distribute tokens (admin only)");
      return;
    }
    
    switch (command) {
      case "staking-info":
        await getStakingInfo();
        break;
        
      case "sovereign-info":
        await getSovereignInfo();
        break;
        
      case "approve":
        if (!args[1]) {
          console.log("Error: Missing amount to approve");
          console.log("Usage: node swf-integrated-manager.js approve <amount>");
          return;
        }
        await approveSpending(args[1]);
        break;
        
      case "stake":
        if (!args[1]) {
          console.log("Error: Missing amount to stake");
          console.log("Usage: node swf-integrated-manager.js stake <amount>");
          return;
        }
        await stakeTokens(args[1]);
        break;
        
      case "withdraw":
        if (!args[1]) {
          console.log("Error: Missing amount to withdraw");
          console.log("Usage: node swf-integrated-manager.js withdraw <amount>");
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
          console.log("Usage: node swf-integrated-manager.js set-apr <percentage>");
          console.log("Example: node swf-integrated-manager.js set-apr 20");
          return;
        }
        await setAPR(args[1]);
        break;
        
      case "distribute":
        if (!args[1]) {
          console.log("Error: Missing amount to distribute");
          console.log("Usage: node swf-integrated-manager.js distribute <amount>");
          return;
        }
        await distributeTokens(args[1]);
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