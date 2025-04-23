// Script to check deployment status and contract information on Amoy testnet
require("dotenv").config();
const { ethers } = require("hardhat");
const axios = require("axios");

// Define our transaction hashes to check
const TX_HASHES = [
  "0xdffb6f9d50969ff342c1db8e33c2a51c1a6becf951c0c6270eadbe660fd9793c",
  "0x2bf937ff30b959d3efa5b2f48e7defb594753b29b5a16612ab613b2769db6a06",
  "0x2cbc8be1eb64a1312b730182687d41b9c4cabfec8ec1e0c92728ee903de4ab02"
  // Add any new transaction hashes here
];

// Treasury wallet address
const TREASURY_ADDRESS = "0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d";

async function main() {
  try {
    console.log("Checking deployment status on Polygon Amoy testnet...");
    console.log("Treasury address:", TREASURY_ADDRESS);
    
    // Check account balance
    const provider = ethers.provider;
    const balance = await provider.getBalance(TREASURY_ADDRESS);
    console.log("Current balance:", ethers.utils.formatEther(balance), "POL");
    
    console.log("\nChecking transaction status:");
    
    // Check each transaction
    for (const txHash of TX_HASHES) {
      console.log(`\n${txHash}:`);
      
      // Get transaction receipt from provider
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (receipt) {
        console.log("Status:", receipt.status === 1 ? "SUCCESS" : "FAILED");
        console.log("Block number:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());
        
        if (receipt.contractAddress) {
          console.log("Contract address:", receipt.contractAddress);
          
          // If we have a contract address, try to interact with it
          try {
            const contract = await ethers.getContractAt("SovranWealthFund", receipt.contractAddress);
            const name = await contract.name();
            const symbol = await contract.symbol();
            const totalSupply = await contract.totalSupply();
            const owner = await contract.owner();
            
            console.log("\nContract details:");
            console.log("Name:", name);
            console.log("Symbol:", symbol);
            console.log("Total supply:", ethers.utils.formatEther(totalSupply));
            console.log("Owner:", owner);
            console.log("Contract verification link:");
            console.log(`https://amoy.polygonscan.com/address/${receipt.contractAddress}#code`);
            
            // Write deployment info to file
            const fs = require("fs");
            const deploymentInfo = {
              network: "Polygon Amoy Testnet",
              contractAddress: receipt.contractAddress,
              txHash: txHash,
              name: name,
              symbol: symbol,
              owner: owner,
              deployedBy: TREASURY_ADDRESS
            };
            
            fs.writeFileSync(
              "deployment-successful.json", 
              JSON.stringify(deploymentInfo, null, 2)
            );
            
            console.log("\nDeployment information saved to deployment-successful.json");
          } catch (error) {
            console.log("Could not interact with contract:", error.message);
          }
        } else {
          console.log("No contract was created in this transaction");
        }
      } else {
        console.log("Status: PENDING (not confirmed yet)");
        
        // Try to check status from explorer API
        try {
          const response = await axios.get(`https://api-amoy.polygonscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=YourApiKey`);
          if (response.data?.status === "1") {
            console.log("Polygonscan API status:", response.data?.result?.status || "Pending");
          } else {
            console.log("Could not get status from Polygonscan API");
          }
        } catch (error) {
          console.log("Error checking Polygonscan:", error.message);
        }
      }
    }
    
    console.log("\nVerification complete");
    
  } catch (error) {
    console.error("Error checking deployment:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });