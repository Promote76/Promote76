# Sovran Wealth Fund (SWF) Token Deployment Guide

This guide provides instructions for deploying the Sovran Wealth Fund ERC20 token to the Polygon Amoy testnet.

## Prerequisites

- Node.js and npm installed
- A wallet with some MATIC for Polygon Amoy testnet
- Private key of the deployment wallet
- Alchemy API key (optional, for better RPC endpoint)
- Polygonscan API key (for contract verification)

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
   POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
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
  - The Treasury wallet: `0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d`
- Pausable functionality (owner can pause all token transfers)
- Burn functionality (any token holder can burn their own tokens)

## Deployment Steps

### 1. Polygon Amoy Testnet Configuration

The project is already configured for Polygon Amoy testnet in `hardhat.config.js`:

```javascript
amoy: {
  url: "https://rpc-amoy.polygon.technology", // Amoy RPC endpoint
  chainId: 80002, // Amoy chain ID
  accounts: [process.env.PRIVATE_KEY], // Private key from .env file
  timeout: 60000, // Increase timeout to 60 seconds
  gasMultiplier: 1.5 // Increase gas by 50% to avoid underpriced transactions
}
```

### 2. Deploy the contract

Run the deployment script for the Amoy network:

```bash
npx hardhat run scripts/deploy.js --network amoy
```

### 3. Verify the contract on Polygonscan

The project is already configured for verification on Amoy Polygonscan:

```bash
npx hardhat verify --network amoy YOUR_DEPLOYED_CONTRACT_ADDRESS
```

Replace `YOUR_DEPLOYED_CONTRACT_ADDRESS` with the address printed in the console after deployment.

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