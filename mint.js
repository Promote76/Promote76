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

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  console.log(`Minting 1,000,000 SWF to ${recipient}...`);
  const tx = await contract.mint(recipient, amount);
  await tx.wait();
  console.log("✅ Mint successful:", tx.hash);
}

main().catch((error) => {
  console.error("❌ Mint failed:", error);
  process.exit(1);
});