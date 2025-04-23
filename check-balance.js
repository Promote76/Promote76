require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  try {
    // Check if we have the required environment variables
    if (!process.env.PRIVATE_KEY) {
      console.error("PRIVATE_KEY not found in .env file");
      return;
    }
    
    // Connect to Mumbai testnet using a public RPC endpoint
    const provider = new ethers.providers.JsonRpcProvider(
      'https://rpc-mumbai.maticvigil.com'
    );
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Get wallet address
    const address = wallet.address;
    console.log(`Checking balance for address: ${address}`);
    
    // Get balance
    const balance = await provider.getBalance(address);
    const balanceInMatic = ethers.utils.formatEther(balance);
    
    console.log(`Balance: ${balanceInMatic} MATIC`);
    console.log(`Raw balance in wei: ${balance.toString()}`);
    
    // Check if balance is sufficient for deployment (roughly 0.1 MATIC should be enough)
    if (parseFloat(balanceInMatic) < 0.1) {
      console.log("WARNING: Balance may be too low for deployment.");
      console.log("Consider getting more testnet MATIC from a faucet:");
      console.log("https://faucet.polygon.technology/");
    } else {
      console.log("Balance is sufficient for deployment.");
    }
    
  } catch (error) {
    console.error("Error checking balance:", error.message);
  }
}

main();