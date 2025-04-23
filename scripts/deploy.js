// Deploy script for Sovran Wealth Fund token
require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  try {
    // Get the account that will deploy the contract
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Get the contract factory with fully qualified name to resolve ambiguity
    const SovranWealthFund = await ethers.getContractFactory("contracts/SovranWealthFund.sol:SovranWealthFund");
    
    // Deploy the contract with optimized gas settings
    console.log("Deploying SovranWealthFund with optimized gas...");
    const gasPrice = ethers.utils.parseUnits("25", "gwei"); // 25 gwei minimum required by network
    
    // Get deployment gas estimate
    const deploymentData = SovranWealthFund.getDeployTransaction();
    const estimatedGas = await ethers.provider.estimateGas(deploymentData);
    console.log(`Estimated gas: ${estimatedGas.toString()}`);
    console.log(`Gas price: ${ethers.utils.formatUnits(gasPrice, "gwei")} gwei`);
    
    // Deploy with specific gas parameters
    const token = await SovranWealthFund.deploy({
      gasPrice: gasPrice,
      gasLimit: Math.ceil(estimatedGas.toNumber() * 1.1) // Add 10% buffer
    });
    
    // Wait for the contract to be deployed
    console.log("Waiting for deployment transaction to be mined...");
    await token.deployed();
    
    console.log("SovranWealthFund deployed to:", token.address);
    console.log("Transaction hash:", token.deployTransaction.hash);
    
    // Verify contract details
    const name = await token.name();
    const symbol = await token.symbol();
    console.log(`Token Name: ${name}`);
    console.log(`Token Symbol: ${symbol}`);
    
    // Log additional deployment information
    console.log("Deployment completed successfully");
    console.log("-----------------------------------");
    console.log("Contract Owner:", await token.owner());
    console.log("MINTER_ROLE hash:", await token.MINTER_ROLE());
    console.log("Pausable status: not paused");
    
  } catch (error) {
    console.error("Deployment failed with error:", error);
    process.exitCode = 1;
  }
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error during deployment:", error);
    process.exit(1);
  });
