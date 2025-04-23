require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 35000000000, // 35 gwei
      timeout: 1200000 // 20 minutes
    },
    mumbai: {
      url: process.env.ALCHEMY_API_KEY 
        ? `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        : "https://polygon-mumbai-bor.publicnode.com", // Public fallback RPC
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 35000000000, // 35 gwei
      timeout: 1200000 // 20 minutes
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      timeout: 300000
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};
