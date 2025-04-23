# Sovran Wealth Fund (SWF) Deployment Guide

This guide provides instructions for deploying the Sovran Wealth Fund token to the Polygon network (both Mainnet and Amoy testnet) and interacting with it after deployment.

## Prerequisites

- Node.js and npm installed
- Hardhat development environment set up
- MetaMask wallet configured with:
  - For testnet: Polygon Amoy testnet and small amount of Amoy POL tokens (0.5 POL minimum)
  - For mainnet: Polygon mainnet and sufficient MATIC tokens (at least 1 MATIC recommended)

## Environment Setup

1. Create a `.env` file in the project root with the following contents:

```
PRIVATE_KEY=your_wallet_private_key
ALCHEMY_API_KEY=your_alchemy_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

2. Install dependencies:

```bash
npm install
```

## Deployment Options

### Standard Deployment (Requires ~0.5 POL)

```bash
npx hardhat run scripts/deployAmoy.js --network amoy
```

### Minimal Gas Deployment Options

#### Option 1: Optimized Original Contract (Requires ~0.11 POL)

```bash
npx hardhat run scripts/deployAmoyMinimal.js --network amoy
```

#### Option 2: Ultra-Optimized Contract (Requires ~0.09 POL)

```bash
npx hardhat run scripts/deployAmoyUltra.js --network amoy
```

#### Option 3: Minimal Contract Version (Requires ~0.07 POL)

This uses a simplified contract with core functionality but reduced gas costs:

```bash
npx hardhat run scripts/deployMinimalContract.js --network amoy
```

The deployment process may take several minutes on the Amoy testnet due to network congestion. Once completed, you'll receive a contract address.

## Polygon Mainnet Deployment

⚠️ **IMPORTANT**: Deploying to mainnet will use real MATIC tokens and cannot be undone. Make sure you fully understand the implications before proceeding.

### Prerequisites for Mainnet Deployment

- A wallet with sufficient MATIC tokens (at least 1 MATIC recommended)
- An Alchemy API key for reliable RPC access
- Your Polygonscan API key for contract verification

### Mainnet Deployment Options

#### Option 1: Full Contract Deployment

This deploys the complete SovranWealthFund contract to Polygon mainnet:

```bash
npx hardhat run scripts/deployMainnet.js --network polygon
```

#### Option 2: Minimal Contract Deployment

This deploys the minimal version of the contract to save on gas costs:

```bash
npx hardhat run scripts/deployMainnetMinimal.js --network polygon
```

### Mainnet Contract Verification

After successful deployment, verify your contract on Polygonscan:

```bash
npx hardhat verify --network polygon YOUR_CONTRACT_ADDRESS
```

Replace `YOUR_CONTRACT_ADDRESS` with your actual deployed contract address.

### Gas Optimization for Mainnet

The mainnet deployment scripts automatically:
1. Check current network gas prices
2. Use a slightly higher gas price (10% premium) for faster inclusion
3. Estimate deployment costs before executing
4. Save all deployment details to a JSON file for reference

## Checking Deployment Status

If your deployment transaction is taking a long time to complete, you can check its status:

1. Add your transaction hash(es) to the `TX_HASHES` array in `scripts/checkDeployment.js`
2. Run the check script:

```bash
npx hardhat run scripts/checkDeployment.js --network amoy
```

This will show the status of your transactions and, if successful, display information about the deployed contract.

## Contract Verification

After successful deployment, verify your contract on PolygonScan:

```bash
npx hardhat verify --network amoy YOUR_CONTRACT_ADDRESS
```

Replace `YOUR_CONTRACT_ADDRESS` with your actual deployed contract address.

## Token Features and Interaction

### Contract Types

This project includes two contract versions:

1. **Full Featured Contract (SovranWealthFund)** - Includes role-based access control, pausable functionality, and burn capabilities.
2. **Minimal Contract (SovranWealthFundMinimal)** - A simplified version with reduced gas costs but still maintains core functionality.

### Minting New Tokens

#### For the Full Contract:

Only addresses with the `MINTER_ROLE` can mint new tokens. The deployer address and the Treasury address (0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d) are granted this role by default.

```javascript
// Example minting script for full contract
async function main() {
  const [deployer] = await ethers.getSigners();
  const tokenAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with actual address
  const token = await ethers.getContractAt("SovranWealthFund", tokenAddress);
  
  const recipient = "RECIPIENT_ADDRESS"; // Address to receive tokens
  const amount = ethers.utils.parseEther("1000"); // 1000 tokens (with 18 decimals)
  
  const tx = await token.mintTo(recipient, amount);
  await tx.wait();
  console.log(`Minted ${ethers.utils.formatEther(amount)} tokens to ${recipient}`);
}
```

#### For the Minimal Contract:

Only the owner or Treasury address can mint tokens.

```javascript
// Example minting script for minimal contract
async function main() {
  const [deployer] = await ethers.getSigners();
  const tokenAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with actual address
  const token = await ethers.getContractAt("SovranWealthFundMinimal", tokenAddress);
  
  const recipient = "RECIPIENT_ADDRESS"; // Address to receive tokens
  const amount = ethers.utils.parseEther("1000"); // 1000 tokens (with 18 decimals)
  
  const tx = await token.mint(recipient, amount);
  await tx.wait();
  console.log(`Minted ${ethers.utils.formatEther(amount)} tokens to ${recipient}`);
}
```

Run with:
```bash
npx hardhat run scripts/mint.js --network amoy
```

### Pausing and Unpausing Transfers

**Note**: This feature is only available in the full contract version.

Only the contract owner can pause and unpause token transfers:

```javascript
// Pause transfers (SovranWealthFund contract only)
const tx = await token.pause();
await tx.wait();
console.log("Token transfers paused");

// Unpause transfers (SovranWealthFund contract only)
const tx = await token.unpause();
await tx.wait();
console.log("Token transfers unpaused");
```

### Burning Tokens

Any token holder can burn their own tokens in both contract versions:

```javascript
// Burning works the same for both contract versions
const amount = ethers.utils.parseEther("100"); // 100 tokens
const tx = await token.burn(amount);
await tx.wait();
console.log(`Burned ${ethers.utils.formatEther(amount)} tokens`);
```

### Checking Token Details

```javascript
const name = await token.name();
const symbol = await token.symbol();
const totalSupply = await token.totalSupply();
const balance = await token.balanceOf("ADDRESS_TO_CHECK");

console.log(`Name: ${name}`);
console.log(`Symbol: ${symbol}`);
console.log(`Total Supply: ${ethers.utils.formatEther(totalSupply)}`);
console.log(`Balance: ${ethers.utils.formatEther(balance)}`);
```

## Troubleshooting

### Deployment Fails with "transaction underpriced"

The Amoy testnet requires a minimum gas price of 25 gwei. Update your deployment script's gas price:

```javascript
const gasPrice = ethers.utils.parseUnits("25", "gwei");
```

### Out of Gas Errors

If you encounter "out of gas" errors, increase the gas limit in your deployment script:

```javascript
const gasLimit = 5000000; // Increase as needed
```

### Failed Transactions

If your transaction fails, check your wallet's POL balance to ensure you have enough for gas fees. The Amoy testnet can be congested, so transactions may take longer than expected.

## Getting Testnet POL

You can request Amoy testnet POL from the official Polygon faucet: https://amoy.polygon.technology

## Contract Address and Details

After successful deployment, save your contract details:

- Contract Address: [Your contract address here]
- Transaction Hash: [Your deployment transaction hash here]
- Block Number: [Block number here]
- Network: Polygon Amoy Testnet

## Additional Resources

- [Polygon Amoy Documentation](https://wiki.polygon.technology/docs/amoy/)
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [ThirdWeb Contracts GitHub](https://github.com/thirdweb-dev/contracts)