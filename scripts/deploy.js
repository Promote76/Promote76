// Deploy script for Sovran Wealth Fund token

async function main() {
  try {
    // Get the account that will deploy the contract
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Get the contract factory
    const SovranWealthFund = await ethers.getContractFactory("SovranWealthFund");
    
    // Deploy the contract
    console.log("Deploying SovranWealthFund...");
    const token = await SovranWealthFund.deploy();
    
    // Wait for the contract to be deployed
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
