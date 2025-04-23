// swf-token-manager.js - Comprehensive Sovran Wealth Fund Token Management Tool

require("dotenv").config();
const { ethers } = require("ethers");

// Token contract information
const CONTRACT_ADDRESS = "0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7";
const TOKEN_SYMBOL = "SWF";
const TOKEN_DECIMALS = 18;

// More complete ABI with common token functions
const ABI = [
  // ERC20 Standard Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  
  // Extended SWF Token Functions (ThirdWeb ERC20Base with extensions)
  "function mint(address to, uint256 amount) public",
  "function burn(uint256 amount) public",
  "function pause() public",
  "function unpause() public",
  "function paused() view returns (bool)",
  "function owner() view returns (address)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function grantRole(bytes32 role, address account) public",
  "function revokeRole(bytes32 role, address account) public",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Paused(address account)",
  "event Unpaused(address account)",
];

// Role constants (ThirdWeb roles)
const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));

/**
 * Connect to provider and wallet
 * @returns {Object} Object containing provider, wallet, contract, and signer address
 */
async function connect() {
  // Connect to Polygon mainnet
  const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
  
  // Check if private key is set
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env file");
  }
  
  // Set up wallet and contract
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
  const signerAddress = wallet.address;
  
  return { provider, wallet, contract, signerAddress };
}

/**
 * Get token information
 */
async function getTokenInfo() {
  const { contract } = await connect();
  
  // Get basic token information
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const totalSupply = await contract.totalSupply();
  const formattedSupply = ethers.utils.formatUnits(totalSupply, decimals);
  const paused = await contract.paused();
  const owner = await contract.owner();
  
  console.log("\n=== Sovran Wealth Fund Token Info ===");
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total Supply: ${formattedSupply} ${symbol}`);
  console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`Owner Address: ${owner}`);
  console.log(`Paused: ${paused ? "Yes ⚠️" : "No ✅"}`);
  console.log("=======================================\n");
}

/**
 * Check the balance of a specific address
 * @param {string} address The address to check
 */
async function checkBalance(address) {
  const { contract } = await connect();
  
  // Validate address
  if (!ethers.utils.isAddress(address)) {
    console.error("❌ Invalid Ethereum address");
    return;
  }
  
  // Get and display balance
  const balance = await contract.balanceOf(address);
  const formattedBalance = ethers.utils.formatUnits(balance, TOKEN_DECIMALS);
  
  console.log(`\n${address}`);
  console.log(`Balance: ${formattedBalance} ${TOKEN_SYMBOL}\n`);
}

/**
 * Mint tokens to a specified address
 * @param {string} recipient The address to mint tokens to
 * @param {string} amount The amount to mint (in token units, not wei)
 */
async function mintTokens(recipient, amount) {
  const { contract, signerAddress } = await connect();
  
  // Validate recipient address
  if (!ethers.utils.isAddress(recipient)) {
    console.error("❌ Invalid recipient address");
    return;
  }
  
  // Validate amount
  if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    console.error("❌ Invalid amount");
    return;
  }
  
  // Check if the caller has the minter role
  const hasMinterRole = await contract.hasRole(MINTER_ROLE, signerAddress);
  if (!hasMinterRole) {
    console.error(`❌ Your address (${signerAddress}) does not have the MINTER_ROLE`);
    return;
  }
  
  // Parse the amount to wei
  const weiAmount = ethers.utils.parseUnits(amount, TOKEN_DECIMALS);
  
  // Mint tokens
  console.log(`Minting ${amount} ${TOKEN_SYMBOL} to ${recipient}...`);
  const tx = await contract.mint(recipient, weiAmount);
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  // Wait for the transaction to be mined
  const receipt = await tx.wait();
  console.log(`✅ Minting successful! (Block: ${receipt.blockNumber})`);
  
  // Check the new balance
  await checkBalance(recipient);
}

/**
 * Toggle token pause state (pause/unpause)
 */
async function togglePause() {
  const { contract } = await connect();
  
  // Check current pause state
  const isPaused = await contract.paused();
  
  if (isPaused) {
    // Unpause the token
    console.log("Unpausing token transfers...");
    const tx = await contract.unpause();
    console.log(`Transaction hash: ${tx.hash}`);
    console.log("Waiting for confirmation...");
    await tx.wait();
    console.log("✅ Token transfers enabled!");
  } else {
    // Pause the token
    console.log("Pausing token transfers...");
    const tx = await contract.pause();
    console.log(`Transaction hash: ${tx.hash}`);
    console.log("Waiting for confirmation...");
    await tx.wait();
    console.log("⚠️ Token transfers disabled!");
  }
}

/**
 * Grant the minter role to a new address
 * @param {string} address The address to grant the minter role to
 */
async function grantMinterRole(address) {
  const { contract, signerAddress } = await connect();
  
  // Validate address
  if (!ethers.utils.isAddress(address)) {
    console.error("❌ Invalid Ethereum address");
    return;
  }
  
  // Check if the user already has the role
  const hasRole = await contract.hasRole(MINTER_ROLE, address);
  if (hasRole) {
    console.log(`Address ${address} already has the MINTER_ROLE ✅`);
    return;
  }
  
  // Grant the role
  console.log(`Granting MINTER_ROLE to ${address}...`);
  const tx = await contract.grantRole(MINTER_ROLE, address);
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  // Wait for the transaction to be mined
  await tx.wait();
  console.log(`✅ MINTER_ROLE granted to ${address}`);
}

/**
 * Revoke the minter role from an address
 * @param {string} address The address to revoke the minter role from
 */
async function revokeMinterRole(address) {
  const { contract } = await connect();
  
  // Validate address
  if (!ethers.utils.isAddress(address)) {
    console.error("❌ Invalid Ethereum address");
    return;
  }
  
  // Check if the user has the role
  const hasRole = await contract.hasRole(MINTER_ROLE, address);
  if (!hasRole) {
    console.log(`Address ${address} does not have the MINTER_ROLE ❌`);
    return;
  }
  
  // Revoke the role
  console.log(`Revoking MINTER_ROLE from ${address}...`);
  const tx = await contract.revokeRole(MINTER_ROLE, address);
  console.log(`Transaction hash: ${tx.hash}`);
  console.log("Waiting for confirmation...");
  
  // Wait for the transaction to be mined
  await tx.wait();
  console.log(`✅ MINTER_ROLE revoked from ${address}`);
}

/**
 * Process command line arguments and execute the appropriate function
 */
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  
  try {
    switch (command) {
      case "info":
        await getTokenInfo();
        break;
        
      case "balance":
        if (!args[1]) {
          console.error("❌ Please specify an address. Example: node swf-token-manager.js balance 0x123...");
          process.exit(1);
        }
        await checkBalance(args[1]);
        break;
        
      case "mint":
        if (!args[1] || !args[2]) {
          console.error("❌ Please specify a recipient address and amount. Example: node swf-token-manager.js mint 0x123... 1000");
          process.exit(1);
        }
        await mintTokens(args[1], args[2]);
        break;
        
      case "pause":
        await togglePause();
        break;
        
      case "grant-minter":
        if (!args[1]) {
          console.error("❌ Please specify an address. Example: node swf-token-manager.js grant-minter 0x123...");
          process.exit(1);
        }
        await grantMinterRole(args[1]);
        break;
        
      case "revoke-minter":
        if (!args[1]) {
          console.error("❌ Please specify an address. Example: node swf-token-manager.js revoke-minter 0x123...");
          process.exit(1);
        }
        await revokeMinterRole(args[1]);
        break;
        
      default:
        console.log("=== Sovran Wealth Fund Token Manager ===");
        console.log("Usage:");
        console.log("  node swf-token-manager.js info                        - Get token information");
        console.log("  node swf-token-manager.js balance <address>           - Check token balance");
        console.log("  node swf-token-manager.js mint <address> <amount>     - Mint tokens");
        console.log("  node swf-token-manager.js pause                       - Toggle pause state");
        console.log("  node swf-token-manager.js grant-minter <address>      - Grant minter role");
        console.log("  node swf-token-manager.js revoke-minter <address>     - Revoke minter role");
        console.log("===========================================");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    process.exit(1);
  }
}

// Execute main function
main();