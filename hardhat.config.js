// Import required plugins
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

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
      url: "https://polygon-mumbai.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // Public Infura endpoint
      chainId: 80001, // Mumbai chain ID
      // Get the private key from environment variables for security
      accounts: [process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000"],
      timeout: 60000, // Increase timeout to 60 seconds
      gasMultiplier: 1.5 // Increase gas by 50% to avoid underpriced transactions
    },
    // Polygon Amoy testnet configuration
    amoy: {
      url: "https://rpc-amoy.polygon.technology", // Public Amoy RPC endpoint
      chainId: 80002, // Amoy chain ID
      accounts: [process.env.PRIVATE_KEY], // Private key from .env file
      timeout: 120000, // Increase timeout to 120 seconds
      gasMultiplier: 2 // Increase gas by 100% to avoid underpriced transactions
    },
    // Hardhat local network for testing
    hardhat: {
      chainId: 31337,
      gasPrice: 20000000000,
      gas: 12000000
    },
    // Local node network configuration
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  
  // Compiler settings
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  
  // Etherscan verification configuration
  etherscan: {
    apiKey: {
      // For Polygon networks (Mumbai and Amoy)
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      amoy: process.env.POLYGONSCAN_API_KEY
    },
    customChains: [
      {
        network: "amoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com/"
        }
      }
    ]
  }
};
