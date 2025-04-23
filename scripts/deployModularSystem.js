const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  try {
    console.log("Deploying Sovran Wealth Fund Modular System...");
    
    // Get the deployer's address
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying from address: ${deployer.address}`);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");
    console.log("");
    
    // Deploy or get SWF Token contract
    let swfToken;
    if (process.env.SWF_CONTRACT_ADDRESS) {
      console.log(`Using existing SWF token at ${process.env.SWF_CONTRACT_ADDRESS}`);
      const SovranWealthFund = await ethers.getContractFactory("SovranWealthFund");
      swfToken = await SovranWealthFund.attach(process.env.SWF_CONTRACT_ADDRESS);
    } else {
      console.log("Deploying SovranWealthFund token...");
      const SovranWealthFund = await ethers.getContractFactory("SovranWealthFund");
      swfToken = await SovranWealthFund.deploy();
      await swfToken.deployed();
      console.log(`SWF token deployed to: ${swfToken.address}`);
    }
    console.log("");
    
    // Deploy BasketIndex
    console.log("Deploying BasketIndex...");
    const BasketIndex = await ethers.getContractFactory("BasketIndex");
    const basketIndex = await BasketIndex.deploy("Sovran Wealth Basket", "SWB");
    await basketIndex.deployed();
    console.log(`BasketIndex deployed to: ${basketIndex.address}`);
    console.log("");
    
    // Deploy RoleRouter
    console.log("Deploying RoleRouter...");
    const mainDistributor = "0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6";
    const treasury = "0x26A8401287cE33CC4aeb5a106cd6D282a9C2f51d";
    
    const RoleRouter = await ethers.getContractFactory("RoleRouter");
    const roleRouter = await RoleRouter.deploy(swfToken.address, mainDistributor, treasury);
    await roleRouter.deployed();
    console.log(`RoleRouter deployed to: ${roleRouter.address}`);
    console.log("");
    
    // Deploy SoloMethodEngineV2
    console.log("Deploying SoloMethodEngineV2...");
    const SoloMethodEngineV2 = await ethers.getContractFactory("SoloMethodEngineV2");
    const soloMethodEngine = await SoloMethodEngineV2.deploy(swfToken.address);
    await soloMethodEngine.deployed();
    console.log(`SoloMethodEngineV2 deployed to: ${soloMethodEngine.address}`);
    console.log("");
    
    // Deploy SWFModularEngine
    console.log("Deploying SWFModularEngine...");
    const SWFModularEngine = await ethers.getContractFactory("SWFModularEngine");
    const modularEngine = await SWFModularEngine.deploy(swfToken.address);
    await modularEngine.deployed();
    console.log(`SWFModularEngine deployed to: ${modularEngine.address}`);
    console.log("");
    
    // Initialize the modular engine components
    console.log("Initializing SWFModularEngine components...");
    
    let tx = await modularEngine.initializeBasketIndex(basketIndex.address);
    await tx.wait();
    console.log("✅ BasketIndex initialized");
    
    tx = await modularEngine.initializeRoleRouter(roleRouter.address);
    await tx.wait();
    console.log("✅ RoleRouter initialized");
    
    tx = await modularEngine.initializeStakingEngine(soloMethodEngine.address);
    await tx.wait();
    console.log("✅ StakingEngine initialized");
    console.log("");
    
    // Grant MINTER_ROLE to the SoloMethodEngine
    if (await swfToken.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("")), deployer.address)) {
      console.log("Granting MINTER_ROLE to SoloMethodEngineV2...");
      const MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MINTER_ROLE"));
      tx = await swfToken.grantRole(MINTER_ROLE, soloMethodEngine.address);
      await tx.wait();
      console.log("✅ MINTER_ROLE granted to SoloMethodEngineV2");
      console.log("");
    } else {
      console.log("⚠️ Deployer does not have admin role to grant MINTER_ROLE");
      console.log("Please manually grant MINTER_ROLE to the SoloMethodEngine");
      console.log("");
    }
    
    // Setup default roles in RoleRouter
    console.log("Setting up default roles in RoleRouter...");
    const walletRoles = [
      { address: "0x26A8401287cE33CC4aeb5a106cd6D282a9C2f51d", role: "Treasury", share: 2000 },
      { address: "0x7456BB1ab2FBb40B67807563595Cb6c9698d9aA1", role: "Service Wallet", share: 500 },
      { address: "0x7E9A4698788d582F3B99364071f539841693201", role: "OTC Buyer 1", share: 500 },
      { address: "0x50f7022033Ce4b1c025D7bFE56d0C27020Ae2Fe3", role: "Dividend Holder 1", share: 500 },
      { address: "0xEb02b2bC1CEb07F0B9bb78A8467CeB090A4643Fc", role: "Dividend Holder 2", share: 500 },
      { address: "0x3cCC9DEB6121aB5733a9F5715Dc92f4a40ED872A", role: "Dividend Holder 3", share: 500 },
      { address: "0x750a4dbc335D9de258D9d8297C002c4E002FdE34", role: "Dividend Holder 4", share: 500 },
      { address: "0x613afBE121004958cE6000CB2B14D1c8B0CbbB9", role: "OTC Buyer 2", share: 500 },
      { address: "0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6", role: "Main Distributor", share: 2500 },
      { address: "0x62c62b5Bc31cA7F04910d6Be28d74E07D82b4A5", role: "LP Wallet 1", share: 500 },
      { address: "0x5013Ae54fBaEC83106afA6cD26C06Ba64D2f718d", role: "LP Wallet 2", share: 500 },
      { address: "0x62850718f02f8f5874c0ADf156876eF01Ae8bE8C", role: "LP Wallet 3", share: 500 },
      { address: "0x8Af139af51Fc53DD7575e331Fbb039Cf029e2DF", role: "Governance Wallet", share: 300 },
      { address: "0xFE60C780Ba081a03F211d7eadD4ABcd34B60f78F", role: "Reward Collector", share: 200 }
    ];
    
    // Extract arrays for the contract call
    const wallets = walletRoles.map(w => w.address);
    const roles = walletRoles.map(w => w.role);
    const shares = walletRoles.map(w => w.share);
    
    tx = await roleRouter.setRoles(wallets, roles, shares);
    await tx.wait();
    console.log("✅ Default roles set in RoleRouter");
    console.log("");
    
    // Save deployment info to a file
    const deploymentInfo = {
      network: network.name,
      swfToken: swfToken.address,
      basketIndex: basketIndex.address,
      roleRouter: roleRouter.address,
      soloMethodEngine: soloMethodEngine.address,
      modularEngine: modularEngine.address,
      mainDistributor: mainDistributor,
      treasury: treasury,
      deploymentTime: new Date().toISOString(),
      deployer: deployer.address
    };
    
    fs.writeFileSync(
      'modular-system-deployment.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("Deployment information saved to modular-system-deployment.json");
    console.log("");
    
    console.log("===============================");
    console.log("Next steps:");
    console.log("1. Update your .env file with these addresses:");
    console.log(`   SWF_CONTRACT_ADDRESS=${swfToken.address}`);
    console.log(`   BASKET_INDEX_ADDRESS=${basketIndex.address}`);
    console.log(`   ROLE_ROUTER_ADDRESS=${roleRouter.address}`);
    console.log(`   SOLO_METHOD_ENGINE_ADDRESS=${soloMethodEngine.address}`);
    console.log(`   MODULAR_ENGINE_ADDRESS=${modularEngine.address}`);
    console.log("2. Run tests to verify functionality:");
    console.log("   npx hardhat run scripts/testModularSystem.js --network <network>");
    console.log("===============================");
    
    console.log("✅ Deployment completed successfully!");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });