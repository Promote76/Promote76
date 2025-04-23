# Sovran Wealth Fund (SWF) Deployment Guide

This guide provides instructions for deploying the Sovran Wealth Fund token to the Polygon Amoy testnet and interacting with it after deployment.

## Prerequisites

- Node.js and npm installed
- Hardhat development environment set up
- MetaMask wallet with Polygon Amoy testnet configured
- Small amount of Amoy POL tokens for gas (0.5 POL minimum)

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

### Minimal Gas Deployment (Requires ~0.11 POL)

```bash
npx hardhat run scripts/deployAmoyMinimal.js --network amoy
```

The deployment process may take several minutes on the Amoy testnet due to network congestion. Once completed, you'll receive a contract address.

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

### Minting New Tokens

Only addresses with the `MINTER_ROLE` can mint new tokens. The deployer address and the Treasury address (0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d) are granted this role by default.

```javascript
// Example minting script (scripts/mint.js)
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

Run with:
```bash
npx hardhat run scripts/mint.js --network amoy
```

### Pausing and Unpausing Transfers

Only the contract owner can pause and unpause token transfers:

```javascript
// Pause transfers
const tx = await token.pause();
await tx.wait();
console.log("Token transfers paused");

// Unpause transfers
const tx = await token.unpause();
await tx.wait();
console.log("Token transfers unpaused");
```

### Burning Tokens

Any token holder can burn their own tokens:

```javascript
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