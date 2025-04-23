# Sovran Wealth Fund (SWF) Token Deployment Guide

This guide provides instructions for deploying the Sovran Wealth Fund ERC20 token to the Polygon Mumbai testnet or other networks.

## Prerequisites

- Node.js and npm installed
- A wallet with some MATIC for Mumbai testnet (get from a faucet like https://mumbaifaucet.com/)
- Private key of the deployment wallet
- RPC endpoint for the target network (e.g., from Infura, Alchemy, or a public endpoint)

## Setup Environment

1. Clone this repository or download the files
2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PRIVATE_KEY=your_private_key_here
   ALCHEMY_API_KEY=your_alchemy_api_key_here (if using Alchemy)
   ```

## Contract Details

The `SovranWealthFund` token has the following features:
- Name: Sovran Wealth Fund
- Symbol: SWF
- Decimals: 18 (default for ERC20)
- Permission-based minting through role-based access control
- MINTER_ROLE hash: `0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6`
- Minting is restricted to addresses with the MINTER_ROLE
- Initial minters:
  - The deployer of the contract (msg.sender)
  - The hardcoded address: `0x2A5269E92C48829fdF21D8892c23E894B11D15e3`

## Deployment Steps

### 1. Configure the target network

Adjust the network configuration in `hardhat.config.js` as needed. For example, to use Alchemy for Mumbai:

```javascript
mumbai: {
  url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  chainId: 80001,
  accounts: [process.env.PRIVATE_KEY],
  timeout: 60000,
  gasMultiplier: 1.5
}
```

Or to use a public RPC endpoint:

```javascript
mumbai: {
  url: "https://rpc-mumbai.maticvigil.com",
  chainId: 80001,
  accounts: [process.env.PRIVATE_KEY],
  timeout: 60000,
  gasMultiplier: 1.5
}
```

### 2. Deploy the contract

Run the deployment script for your target network:

```bash
npx hardhat run scripts/deploy.js --network mumbai
```

### 3. Verify the contract (optional)

For Polygon Mumbai, you can verify your contract on PolygonScan by using Hardhat's verify plugin.

First, install the plugin:

```bash
npm install --save-dev @nomiclabs/hardhat-etherscan
```

Update `hardhat.config.js` to include the plugin and your PolygonScan API key:

```javascript
require("@nomiclabs/hardhat-etherscan");

// In the module.exports object:
etherscan: {
  apiKey: {
    polygonMumbai: "YOUR_POLYGONSCAN_API_KEY"
  }
}
```

Then run:

```bash
npx hardhat verify --network mumbai YOUR_DEPLOYED_CONTRACT_ADDRESS
```

## Using the Deployed Token

### Adding Minting Permissions

To add a new address to the list of minters, you need to call the `grantRole` function with the MINTER_ROLE and the address:

```javascript
// In a script or hardhat console
const sovranToken = await ethers.getContractAt("SovranWealthFund", "YOUR_DEPLOYED_CONTRACT_ADDRESS");
const MINTER_ROLE = await sovranToken.MINTER_ROLE();
await sovranToken.grantRole(MINTER_ROLE, "NEW_MINTER_ADDRESS");
```

### Minting Tokens

To mint new tokens, call the `mint` function:

```javascript
// In a script or hardhat console
const sovranToken = await ethers.getContractAt("SovranWealthFund", "YOUR_DEPLOYED_CONTRACT_ADDRESS");
const amount = ethers.utils.parseEther("1000"); // 1000 tokens
await sovranToken.mint("RECIPIENT_ADDRESS", amount);
```

### Checking Balances

To check a user's balance:

```javascript
// In a script or hardhat console
const sovranToken = await ethers.getContractAt("SovranWealthFund", "YOUR_DEPLOYED_CONTRACT_ADDRESS");
const balance = await sovranToken.balanceOf("USER_ADDRESS");
console.log(`Balance: ${ethers.utils.formatEther(balance)} SWF`);
```

## Contract Architecture

The Sovran Wealth Fund token extends two main thirdweb contracts:

1. `ERC20Base`: Provides standard ERC20 token functionality
2. `PermissionsEnumerable`: Provides role-based access control

The key functionality is:
- Permission-based minting through the `MINTER_ROLE`
- Default admin role is assigned to the deployer
- Minting is restricted to addresses with the `MINTER_ROLE`

## Security Considerations

- Private keys should never be shared or committed to version control
- Consider using a hardware wallet or secure key management system for production deployments
- Always test thoroughly on testnets before deploying to mainnet
- Consider getting a security audit before deploying to mainnet with real value