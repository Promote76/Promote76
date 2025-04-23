# Sovran Wealth Fund (SWF) Token

## Overview

The Sovran Wealth Fund (SWF) is an ERC20 token built on the Polygon blockchain using ThirdWeb's smart contract libraries. It features role-based minting permissions, pausable functionality, and burning capabilities.

![Sovran Wealth Fund](generated-icon.png)

## Features

- **Role-Based Minting**: Only addresses with the MINTER_ROLE can create new tokens
- **Pausable Transfers**: The contract owner can pause and unpause token transfers
- **Burning Capability**: Token holders can burn their own tokens
- **Contract Metadata**: Customizable token name, symbol, and decimals
- **Standard ERC20 Compatibility**: Works with all ERC20-compatible wallets and exchanges

## Technical Details

- **Token Name**: Sovran Wealth Fund
- **Token Symbol**: SWF
- **Decimals**: 18
- **Initial Supply**: 0 (all tokens are minted post-deployment)
- **Network**: Polygon Amoy Testnet

## Contract Structure

The smart contract inherits from ThirdWeb's ERC20Base contract and implements:

- Role-based access control for minting permissions
- Pausable functionality for emergency situations
- Burning capability for token holders
- Metadata for the token name and symbol

## Project Structure

```
sovran-wealth-fund/
├── contracts/
│   └── SovranWealthFund.sol    # Main token contract
├── scripts/
│   ├── deploy.js               # Local deployment script
│   ├── deployAmoy.js           # Amoy testnet deployment script
│   ├── deployAmoyMinimal.js    # Gas-optimized Amoy deployment
│   ├── checkDeployment.js      # Check deployment status
│   ├── mint.js                 # Mint new tokens
│   ├── interact.js             # General contract interaction
│   └── test*.js                # Various test scripts
├── hardhat.config.js           # Hardhat configuration
├── .env                        # Environment variables (create this)
└── DEPLOYMENT_GUIDE.md         # Detailed deployment instructions
```

## Getting Started

### Prerequisites

- Node.js and npm
- Hardhat development environment
- Polygon Amoy testnet account with POL tokens

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your credentials:
   ```
   PRIVATE_KEY=your_wallet_private_key
   ALCHEMY_API_KEY=your_alchemy_api_key
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   ```

### Local Testing

Run a local Hardhat node:
```bash
npx hardhat node
```

Deploy to the local network:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Run tests:
```bash
npx hardhat run scripts/fullTest.js --network localhost
```

### Testnet Deployment

Deploy to Polygon Amoy testnet:
```bash
npx hardhat run scripts/deployAmoyMinimal.js --network amoy
```

Monitor deployment status:
```bash
npx hardhat run scripts/checkDeployment.js --network amoy
```

## Usage

After deployment, you can:

1. Mint new tokens (if you have the MINTER_ROLE)
2. Transfer tokens between accounts
3. Pause/unpause all transfers (if you're the owner)
4. Burn tokens

See the [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions on interacting with the contract.

## Security Features

- Role-based access control for minting permissions
- Only the contract owner can pause/unpause transfers
- Token holders can only burn their own tokens
- No backdoors or admin functions to manipulate balances

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [ThirdWeb](https://thirdweb.com/) for their robust smart contract libraries
- [OpenZeppelin](https://openzeppelin.com/) for security patterns and best practices
- [Hardhat](https://hardhat.org/) for the development environment
- [Polygon](https://polygon.technology/) for their scalable blockchain platform