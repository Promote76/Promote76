# Sovran Wealth Fund Frontend

This is the frontend interface for the Sovran Wealth Fund ecosystem. It allows users to interact with the SWF token, staking mechanism with dynamic APR, and the SWF Basket Vault.

## Features

- **Wallet Connection**: Connect to MetaMask or other Web3 wallets
- **Network Detection**: Automatic detection of the connected network with support for Polygon Mainnet
- **Vault Dashboard**: Deposit and withdraw SWF tokens to/from the SWF Basket Vault
- **Staking Dashboard**: Stake SWF tokens, withdraw staked tokens, and claim rewards
- **Real-time Stats**: View current APR, vault deposits, staking statistics, and estimated rewards

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- NPM or Yarn
- MetaMask or another Web3 wallet browser extension

### Installation

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Configure the environment variables (if needed):

Create a `.env` file in the frontend directory with the following variables:

```
REACT_APP_SWF_TOKEN_ADDRESS=0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7
REACT_APP_SWF_BASKET_VAULT_ADDRESS=0x883FaE02D319a5B7E67269bB21276B3e73DB43C9
REACT_APP_SOLO_METHOD_ENGINE_ADDRESS=0x8b7fD126e94A086B066bb3166Bb17834a09Ac73d
REACT_APP_DYNAMIC_APR_CONTROLLER_ADDRESS=0xFC49C9e14F5C40f0d91A248C6c8B77Cf8F55a748
```

3. Start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

- **src/components/**: React components
  - **ui/**: Basic UI components (Button, Input, Card)
  - **VaultDashboard.jsx**: Component for vault interactions
  - **StakingDashboard.jsx**: Component for staking interactions
- **src/lib/**: Utility libraries
  - **constants.js**: ABIs and contract addresses
  - **web3.js**: Web3 utility functions
- **src/pages/**: Page components
  - **Dashboard.jsx**: Main dashboard page that combines vault and staking functionality

## Interacting with Contracts

### Vault Interactions

- **Deposit SWF Tokens**: Approve the vault to spend your SWF tokens, then deposit them to receive SWF-BASKET tokens
- **Withdraw SWF Tokens**: Withdraw your deposited SWF tokens from the vault

### Staking Interactions

- **Stake SWF Tokens**: Approve the staking contract to spend your SWF tokens, then stake them to earn rewards
- **Withdraw Staked Tokens**: Withdraw your staked SWF tokens from the staking contract
- **Claim Rewards**: Claim your accumulated staking rewards

## The Dynamic APR System

The APR for staking rewards is dynamically adjusted based on the total amount of SWF tokens in the Basket Vault:

- **Low Vault Deposits** (< 10,000 SWF): Maximum APR (30%)
- **High Vault Deposits** (≥ 100,000 SWF): Minimum APR (10%)
- **Medium Vault Deposits**: APR is scaled linearly between the minimum and maximum

This mechanism creates a balanced incentive structure:
1. Early adopters are rewarded with higher APRs when vault deposits are low
2. As the ecosystem grows, APRs gradually decrease to ensure long-term sustainability

## Network Support

The application supports:
- Polygon Mainnet
- Polygon Mumbai Testnet (for development and testing)
- Local development environment (Hardhat local node)

## License

The Sovran Wealth Fund frontend is proprietary software.