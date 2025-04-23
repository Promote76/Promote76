require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');

async function main() {
  try {
    // Check if we have the required environment variables
    if (!process.env.PRIVATE_KEY) {
      console.error("PRIVATE_KEY not found in .env file");
      return;
    }
    
    // Create wallet from private key (just to get the address)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const address = wallet.address;
    
    console.log(`Checking balance for address: ${address}`);
    
    // Use Polygonscan API to check balance
    const polygonscanApiUrl = `https://api-testnet.polygonscan.com/api?module=account&action=balance&address=${address}&tag=latest`;
    
    const response = await axios.get(polygonscanApiUrl);
    
    if (response.data.status === '1') {
      const balanceInWei = response.data.result;
      const balanceInMatic = ethers.utils.formatEther(balanceInWei);
      
      console.log(`Balance: ${balanceInMatic} MATIC`);
      console.log(`Raw balance in wei: ${balanceInWei}`);
      
      // Check if balance is sufficient for deployment (roughly 0.1 MATIC should be enough)
      if (parseFloat(balanceInMatic) < 0.1) {
        console.log("WARNING: Balance may be too low for deployment.");
        console.log("Consider getting more testnet MATIC from a faucet:");
        console.log("https://faucet.polygon.technology/");
      } else {
        console.log("Balance is sufficient for deployment.");
      }
    } else {
      console.error("Error from Polygonscan API:", response.data.message);
    }
    
  } catch (error) {
    console.error("Error checking balance:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

main();