// Script for checking the status of mainnet deployment transactions
require("dotenv").config();
const { ethers } = require("hardhat");

// Add your transaction hash here
const TX_HASH = "0x0ac75e83b1ddb5261c96d6bf73deded44fe069b96bfec13a0a34ea1c84fcbf73";

async function main() {
  try {
    console.log("-".repeat(50));
    console.log("CHECKING POLYGON MAINNET DEPLOYMENT");
    console.log("-".repeat(50));
    
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ALCHEMY_API_KEY 
      ? `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : "https://polygon-rpc.com"
    );
    
    console.log(`Checking transaction: ${TX_HASH}`);
    
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(TX_HASH);
    
    if (!receipt) {
      console.log("Transaction is still pending. Please wait for confirmation.");
      return;
    }
    
    console.log("Transaction Status:", receipt.status === 1 ? "SUCCESS ✅" : "FAILED ❌");
    console.log("Block Number:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());
    
    if (receipt.status === 1) {
      // Get contract address from receipt
      const contractAddress = receipt.contractAddress;
      console.log("\nContract Address:", contractAddress);
      
      // Display contract info URL
      console.log(`\nView your contract on Polygonscan:`);
      console.log(`https://polygonscan.com/address/${contractAddress}`);
      
      // Save contract information to file
      const fs = require("fs");
      fs.writeFileSync(
        "mainnet-contract-info.json", 
        JSON.stringify({
          network: "Polygon Mainnet",
          contractType: "SovranWealthFund (Full)",
          contractAddress: contractAddress,
          deploymentTxHash: TX_HASH,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          deployedAt: new Date().toISOString()
        }, null, 2)
      );
      
      console.log("\nContract information saved to mainnet-contract-info.json");
      
      // Verification instructions
      console.log("\nTo verify your contract on Polygonscan, run:");
      console.log(`npx hardhat verify --network polygon ${contractAddress}`);
    }
  } catch (error) {
    console.error("Error checking transaction:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });