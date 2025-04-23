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

The SoloMethodEngine offers a 5% APR (Annual Percentage Rate) on your staked tokens. Rewards are calculated based on:

- The amount of tokens you have staked
- The duration of your stake
- The 5% annual rate divided into 30-day periods

You can claim your rewards at any time, but they are also automatically claimed when you withdraw tokens.

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

To check your current staking status, pending rewards, and wallet breakdown:

```
node swf-staking-manager.js info
```

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

## Important Notes

1. **Gas Prices**: The staking manager automatically sets gas prices to at least 37.5 gwei to ensure transactions are processed on the Polygon network. Adjust this if needed.

2. **Minimum Stake**: You must stake at least 50 SWF tokens.

3. **Reward Calculation**: Rewards are calculated based on 30-day periods. You'll need to wait at least 30 days to see your first rewards.

4. **Contract Interaction**: When you stake tokens, they are transferred to the SoloMethodEngine contract. The contract tracks your staked balance and allows you to withdraw at any time.

5. **Minter Role**: The SoloMethodEngine must have the MINTER_ROLE on the SWF token to distribute rewards. This is configured during deployment.

## Troubleshooting

If you encounter issues:

1. **Transaction failures**: Check that you have enough MATIC for gas fees
2. **Approval errors**: Make sure you approved enough tokens before staking
3. **Connection issues**: Verify your RPC URL and network configuration
4. **Reward calculation**: Rewards only accumulate after at least one 30-day period

## Advanced: Interacting Directly with Contracts

Advanced users can interact directly with the contracts using web3 libraries or tools like Etherscan.

### Key Contract Functions

**SoloMethodEngine Contract:**

- `deposit(uint256 amount)`: Stake tokens
- `withdraw(uint256 amount)`: Withdraw tokens
- `claimRewards()`: Claim accumulated rewards
- `getTotalStaked(address user)`: Check your staked amount
- `getPendingRewards(address user)`: Check pending rewards
- `getWalletBreakdown(address user)`: View your 16-wallet distribution