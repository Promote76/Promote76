# Sovran Wealth Fund (SWF) Staking Guide

This guide provides instructions for interacting with the SoloMethodEngine smart contract, which allows you to stake your SWF tokens and earn rewards.

## Overview

The SoloMethodEngine implements a unique staking mechanism where your tokens are distributed across 16 virtual wallets with 5 different roles:

1. **BUYER** - Represents tokens actively being used for purchases
2. **HOLDER** - Represents tokens held for long-term investment
3. **STAKER** - Represents tokens staked for rewards
4. **LIQUIDITY** - Represents tokens providing liquidity
5. **TRACKER** - Represents tokens tracking network activity

When you stake your tokens, they are automatically and evenly distributed across these 16 wallets. This balanced distribution ensures your tokens are represented in all aspects of the SWF ecosystem.

## Rewards

The SoloMethodEngine offers dynamic APR (Annual Percentage Rate) on your staked tokens, currently set at 25%. The APR can be adjusted by the admin based on market conditions. Rewards are calculated based on:

- The amount of tokens you have staked
- The duration of your stake
- The current APR (visible through the `getCurrentAPR()` function)
- Continuous compounding (reward calculation updates in real-time)

You can claim your rewards at any time, but they are also automatically updated when you withdraw tokens or make additional deposits.

## Prerequisites

Before staking your SWF tokens, you need:

1. SWF tokens in your wallet
2. A small amount of MATIC (Polygon) for gas fees
3. Environment setup with appropriate config values

## Setup

1. Create a `.env` file with the following information:

```
PRIVATE_KEY=your_wallet_private_key
SWF_CONTRACT_ADDRESS=0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7
SOLO_METHOD_ENGINE_ADDRESS=address_after_deployment
ALCHEMY_API_KEY=your_alchemy_api_key_optional
```

2. Make sure you have the required dependencies installed:

```
npm install ethers dotenv
```

## CLI Commands

The `swf-staking-manager.js` script provides a simple command-line interface for interacting with the staking contract.

### View Staking Information

To check your current staking status, APR rate, pending rewards, and wallet breakdown:

```
node swf-staking-manager.js info
```

This will display the current APR (Annual Percentage Rate), which is set to 25% by default but can be changed by the admin.

### Approve Token Spending

Before staking, you need to approve the SoloMethodEngine contract to spend your tokens:

```
node swf-staking-manager.js approve 100
```

This approves 100 SWF tokens to be used by the staking contract.

### Stake Tokens

To stake tokens (after approving):

```
node swf-staking-manager.js stake 100
```

This stakes 100 SWF tokens. The minimum staking amount is 50 SWF.

### Claim Rewards

To claim your accumulated rewards:

```
node swf-staking-manager.js claim
```

### Withdraw Tokens

To withdraw some or all of your staked tokens:

```
node swf-staking-manager.js withdraw 50
```

This withdraws 50 SWF tokens from your staking position. Any pending rewards will be automatically claimed during withdrawal.

### Set APR (Admin Only)

If you are the admin of the contract, you can adjust the APR (Annual Percentage Rate) for staking rewards:

```
node swf-staking-manager.js set-apr 20
```

This sets the APR to 20%. The APR can be set between 0.01% and 50% (5000 basis points maximum). This action can only be performed by the contract admin, which is set to the deployer address by default.

## Important Notes

1. **Gas Prices**: The staking manager automatically sets gas prices to at least 37.5 gwei to ensure transactions are processed on the Polygon network. Adjust this if needed.

2. **Minimum Stake**: You must stake at least 50 SWF tokens.

3. **Dynamic APR**: The staking contract now uses a dynamic APR system, initially set to 25%. The contract admin can adjust this rate between 0.01% and 50% to respond to market conditions.

4. **Reward Calculation**: Rewards are calculated continuously based on seconds elapsed since your last action (stake, claim, or withdraw). This provides more accurate reward compounding compared to the previous 30-day period system.

5. **Contract Interaction**: When you stake tokens, they are transferred to the SoloMethodEngine contract. The contract tracks your staked balance and allows you to withdraw at any time.

6. **Minter Role**: The SoloMethodEngine must have the MINTER_ROLE on the SWF token to distribute rewards. This is configured during deployment.

## Troubleshooting

If you encounter issues:

1. **Transaction failures**: Check that you have enough MATIC for gas fees
2. **Approval errors**: Make sure you approved enough tokens before staking
3. **Connection issues**: Verify your RPC URL and network configuration
4. **Reward calculation**: Rewards accumulate continuously but may be small initially
5. **APR setting errors**: Ensure you're the admin when trying to set APR
6. **Basis points confusion**: Remember 1% = 100 basis points, 25% = 2500 basis points

## Advanced: Interacting Directly with Contracts

Advanced users can interact directly with the contracts using web3 libraries or tools like Etherscan.

### Key Contract Functions

**SoloMethodEngine Contract:**

- `deposit(uint256 amount)`: Stake tokens
- `withdraw(uint256 amount)`: Withdraw tokens
- `claimRewards()`: Claim accumulated rewards
- `calculateRewards(address user)`: Calculate the user's current rewards
- `getTotalStaked(address user)`: Check your staked amount
- `getPendingRewards(address user)`: Check pending rewards
- `getWalletBreakdown(address user)`: View your 16-wallet distribution
- `getCurrentAPR()`: View the current APR setting in basis points (2500 = 25%)
- `setAPR(uint256 _newAprBps)`: Set a new APR (admin only, in basis points)
- `admin()`: Get the admin address of the contract