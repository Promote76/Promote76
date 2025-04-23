// Import required plugins
require("@nomiclabs/hardhat-ethers");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  // Specify Solidity version
  solidity: "0.8.20",
  
  // Configure networks
  networks: {
    // Polygon Mumbai testnet configuration
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      // Get the private key from environment variables for security
      accounts: [process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000"]
    }
  },
  
  // Compiler settings
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
