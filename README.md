# Sovran Wealth Fund (SWF) Token

## Overview

The Sovran Wealth Fund (SWF) is an ERC20 token built on the Polygon blockchain using ThirdWeb's smart contract libraries. It features role-based minting permissions, pausable functionality, burning capabilities, and an advanced staking system through the SoloMethodEngine.

![Sovran Wealth Fund](generated-icon.png)

## Features

- **Role-Based Minting**: Only addresses with the MINTER_ROLE can create new tokens
- **Pausable Transfers**: The contract owner can pause and unpause token transfers
- **Burning Capability**: Token holders can burn their own tokens
- **Contract Metadata**: Customizable token name, symbol, and decimals
- **Standard ERC20 Compatibility**: Works with all ERC20-compatible wallets and exchanges
- **SoloMethodEngine Staking**: Stake tokens for 5% APR rewards with 16-wallet distribution

## Technical Details

### SWF Token
- **Token Name**: Sovran Wealth Fund
- **Token Symbol**: SWF
- **Decimals**: 18
- **Initial Supply**: 0 (all tokens are minted post-deployment)
- **Network**: Polygon Mainnet
- **Contract Address**: [0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7](https://polygonscan.com/address/0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7)

### SoloMethodEngine
- **Reward Rate**: 5% APR
- **Reward Period**: 30 days
- **Minimum Stake**: 50 SWF
- **Wallet Count**: 16 virtual wallets per user
- **Wallet Roles**: BUYER, HOLDER, STAKER, LIQUIDITY, TRACKER

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
│   ├── SovranWealthFund.sol          # Main token contract
│   └── SovranWealthEngine.sol        # Staking contract with SoloMethodEngine
├── scripts/
│   ├── deploy.js                     # Local deployment script
│   ├── deployMainnet.js              # Polygon mainnet deployment script
│   ├── deployAmoy*.js                # Amoy testnet deployment scripts
│   ├── deployMainnetMinimal.js       # Gas-optimized mainnet deployment
│   ├── deploySoloMethodEngine.js     # Staking engine deployment
│   ├── checkDeployment.js            # Check deployment status
│   ├── mint.js                       # Mint new tokens
│   ├── interact.js                   # General contract interaction
│   ├── testSoloMethodEngineLocal.js  # Test staking functionality
│   └── test*.js                      # Various test scripts
├── swf-token-manager.js              # CLI tool for token management
├── swf-staking-manager.js            # CLI tool for staking operations
├── token-metadata-export.js          # Generate token metadata files
├── exports/                          # Directory for exported metadata
├── hardhat.config.js                 # Hardhat configuration
├── .env                              # Environment variables (create this)
├── DEPLOYMENT_GUIDE.md               # Detailed deployment instructions
├── SWF_TOKEN_MANAGEMENT_GUIDE.md     # Token management guide
└── SWF_STAKING_GUIDE.md              # Staking guide
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

### Token Operations

After SWF token deployment, you can:

1. Mint new tokens (if you have the MINTER_ROLE)
2. Transfer tokens between accounts
3. Pause/unpause all transfers (if you're the owner)
4. Burn tokens

See the [SWF Token Management Guide](SWF_TOKEN_MANAGEMENT_GUIDE.md) for detailed instructions on token operations.

### Staking Operations

After SoloMethodEngine deployment, you can:

1. Approve token spending by the staking contract
2. Stake SWF tokens (minimum 50 SWF)
3. View your staking status and wallet distribution
4. Claim rewards after 30 days (5% APR)
5. Withdraw staked tokens at any time

Use the `swf-staking-manager.js` tool or follow the [SWF Staking Guide](SWF_STAKING_GUIDE.md) for step-by-step instructions.

## Security Features

### Token Security
- Role-based access control for minting permissions
- Only the contract owner can pause/unpause transfers
- Token holders can only burn their own tokens
- No backdoors or admin functions to manipulate balances

### Staking Security
- Minimum 50 SWF staking requirement prevents dust attacks
- Permission-based reward minting prevents unauthorized rewards
- Staked tokens remain safely held in the SoloMethodEngine contract
- Robust withdrawal mechanism with automatic rewards claiming
- No time lock on withdrawals, allowing users to exit at any time

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [ThirdWeb](https://thirdweb.com/) for their robust smart contract libraries
- [OpenZeppelin](https://openzeppelin.com/) for security patterns and best practices
- [Hardhat](https://hardhat.org/) for the development environment
- [Polygon](https://polygon.technology/) for their scalable blockchain platform