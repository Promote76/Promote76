# Sovran Wealth Fund (SWF) Token Management Guide

This comprehensive guide explains how to manage your Sovran Wealth Fund (SWF) token on the Polygon mainnet. The token features role-based minting, pausable transactions, and token burning capabilities.

## Token Details

- **Name**: Sovran Wealth Fund
- **Symbol**: SWF  
- **Decimals**: 18
- **Contract Address**: `0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7`
- **Network**: Polygon Mainnet
- **Block Explorer**: [View on Polygonscan](https://polygonscan.com/address/0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7)

## Prerequisites

Before using the management tools, ensure you have:

1. Node.js and npm installed
2. Access to your wallet private key (stored in .env file)
3. MATIC tokens for gas fees on Polygon mainnet

## Token Management Tools

### 1. Basic Usage: swf-token-manager.js

This script provides comprehensive management of your SWF token, including:

- Viewing token information
- Checking balances
- Minting new tokens
- Pausing/unpausing token transfers
- Managing minter roles

#### Commands:

**View Token Information**
```
node swf-token-manager.js info
```

**Check Token Balance**
```
node swf-token-manager.js balance <wallet-address>
```

**Mint Tokens**
```
node swf-token-manager.js mint <recipient-address> <amount>
```
Example: `node swf-token-manager.js mint 0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d 1000`

**Toggle Pause State**
```
node swf-token-manager.js pause
```

**Grant Minter Role**
```
node swf-token-manager.js grant-minter <wallet-address>
```

**Revoke Minter Role**
```
node swf-token-manager.js revoke-minter <wallet-address>
```

### 2. Simple Minting: mint.js

For quick token minting, you can use the simplified mint.js script:

```
node mint.js <recipient-address> <amount>
```

Example: `node mint.js 0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d 500`

## Token Features Explained

### Role-Based Access Control

The SWF token implements a role-based permission system for minting:

- **DEFAULT_ADMIN_ROLE**: Has authority to grant and revoke all other roles
- **MINTER_ROLE**: Can mint new tokens to any address

By default, the deployer wallet has both roles. Additional addresses can be granted the MINTER_ROLE using the `grant-minter` command.

### Pausable Transfers

The token includes a pause mechanism that can temporarily halt all transfers. This feature is controlled by the owner and can be useful in case of:

- Security incidents
- Contract upgrades
- Regulatory compliance

Use the `pause` command to toggle this state (pause if running, unpause if paused).

### Token Burning

SWF allows token holders to burn their own tokens, permanently removing them from circulation. This is handled directly by the contract.

## Gas Price Management

The management scripts automatically calculate optimal gas prices for Polygon mainnet:
- Uses the current network gas price and applies a 1.5x multiplier
- Ensures a minimum of 30 gwei to prevent transaction failures
- Sets appropriate gas limits for each transaction type

## IPFS Metadata

The token metadata is available in the `exports` directory:

- **JSON File**: Contains the token's full metadata in JSON format
- **HTML File**: A human-readable representation of the token data
- **Upload Guide**: Instructions for uploading to decentralized storage

To upload this metadata to IPFS, follow the guide in `exports/UPLOAD_GUIDE.md`.

## Troubleshooting

### Transaction Failures

If transactions fail, check:

1. **Gas Price**: Polygon mainnet can sometimes require higher gas prices during congestion
2. **MATIC Balance**: Ensure your wallet has sufficient MATIC for gas fees
3. **Nonce Issues**: If you have pending transactions, they might need to complete first

### Permission Errors

If you encounter "missing role" errors:

1. Check that your wallet address has the required role using:
   ```
   node swf-token-manager.js info
   ```
2. Request the role from the contract admin if needed

## Security Best Practices

1. **Private Key Safety**: Never share your private key or .env file
2. **Limited Minting Rights**: Only grant MINTER_ROLE to trusted addresses
3. **Regular Audits**: Periodically check token balances and transaction history
4. **Backup**: Keep secure backups of your wallet private keys

## Further Development

For advanced contract interactions, you can explore the scripts in the `scripts` directory, including:

- Airdrop functionality
- Balance checking
- Complete test suites

---

For any questions or support, please reach out to the project administrators.