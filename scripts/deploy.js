require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const SovranWealthFund = await ethers.getContractFactory("SovranWealthFund");
  console.log("Deploying SovranWealthFund...");

  const token = await SovranWealthFund.deploy();
  await token.deployed();

  console.log("SovranWealthFund deployed to:", token.address);
  console.log("Transaction hash:", token.deployTransaction.hash);

  const name = await token.name();
  const symbol = await token.symbol();
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);

  console.log("Deployment completed successfully");
  console.log("-----------------------------------");
  console.log("Contract Owner:", await token.owner());
  console.log("MINTER_ROLE hash:", await token.MINTER_ROLE());
  console.log("Pausable status: not paused");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in deployment:", error);
    process.exit(1);
  });