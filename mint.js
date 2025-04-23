// mint.js

require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const contractAddress = "0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7"; // SWF Token
  const recipient = "0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d"; // Treasury wallet
  const amount = ethers.utils.parseUnits("1000000", 18); // 1,000,000 SWF

  const abi = [
    "function mint(address to, uint256 amount) public",
  ];

  // Get current gas prices from the network
  const gasPrice = await provider.getGasPrice();
  console.log(`Current gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
  
  // Set higher gas price to ensure transaction goes through
  // Using at least 30 gwei or 1.5x current price, whichever is higher
  const minGasPrice = ethers.utils.parseUnits("30", "gwei");
  const recommendedGasPrice = gasPrice.mul(15).div(10); // 1.5x current price
  const finalGasPrice = recommendedGasPrice.gt(minGasPrice) ? recommendedGasPrice : minGasPrice;
  
  console.log(`Using gas price: ${ethers.utils.formatUnits(finalGasPrice, 'gwei')} gwei`);

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  console.log(`Minting 1,000,000 SWF to ${recipient}...`);
  
  // Include gas price in transaction
  const tx = await contract.mint(recipient, amount, {
    gasPrice: finalGasPrice,
    gasLimit: 250000 // Setting an appropriate gas limit
  });
  
  console.log(`Transaction sent! Hash: ${tx.hash}`);
  console.log(`Waiting for confirmation (this may take a few minutes)...`);
  
  const receipt = await tx.wait();
  console.log("✅ Mint successful! Block number:", receipt.blockNumber);
}

main().catch((error) => {
  console.error("❌ Mint failed:", error);
  process.exit(1);
});