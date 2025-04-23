// Simple script to check balance and nonce
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  try {
    const TREASURY_ADDRESS = "0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d";
    
    console.log("Checking Treasury wallet status...");
    console.log("Address:", TREASURY_ADDRESS);
    
    // Get the provider
    const provider = ethers.provider;
    
    // Get balance
    const balance = await provider.getBalance(TREASURY_ADDRESS);
    console.log("Balance:", ethers.utils.formatEther(balance), "POL");
    
    // Get nonce
    const nonce = await provider.getTransactionCount(TREASURY_ADDRESS);
    console.log("Current nonce:", nonce);
    
    // Check network status
    const network = await provider.getNetwork();
    console.log("Connected to network:", network.name);
    console.log("Chain ID:", network.chainId);
    
    // Get latest block
    const latestBlock = await provider.getBlock("latest");
    console.log("Latest block number:", latestBlock.number);
    console.log("Latest block timestamp:", new Date(latestBlock.timestamp * 1000).toISOString());
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });