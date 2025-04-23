# Sovran Wealth Fund (SWF) Token

A custom ERC20 token with permission-based minting capabilities designed to be deployed on the Polygon Mumbai testnet.

## Overview

The Sovran Wealth Fund (SWF) token is an ERC20 token built using Hardhat and thirdweb's smart contract libraries. The token features role-based access control for minting operations, allowing only authorized addresses to create new tokens.

## Features

- **Standard ERC20 Functionality**: Transfer, approve, and all standard ERC20 operations
- **Permission-Based Minting**: Only addresses with the MINTER_ROLE can mint new tokens
- **Role Management**: Grant and revoke roles to control who can mint tokens
- **Dual Admin Setup**: Both the deployer and a hardcoded address have minting permissions

## Technical Specifications

- **Name**: Sovran Wealth Fund
- **Symbol**: SWF
- **Decimals**: 18 (standard for ERC20 tokens)
- **Solidity Version**: 0.8.20
- **Framework**: Hardhat
- **Libraries**: thirdweb contracts (ERC20Base, PermissionsEnumerable)

## Project Structure

- `contracts/`: Contains the Solidity smart contract files
  - `SovranWealthFund.sol`: The main token contract
- `scripts/`: Contains deployment and interaction scripts
  - `deploy.js`: Script to deploy the token contract
  - `test.js`: Script to test the token functionality
  - `interact.js`: Script to interact with the deployed token
- `hardhat.config.js`: Hardhat configuration file

## Deployment

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Usage

After deploying the SWF token, you can:

1. **Mint Tokens**: Only addresses with the MINTER_ROLE can create new tokens
2. **Transfer Tokens**: Any token holder can transfer tokens to other addresses
3. **Manage Minting Permissions**: The admin can grant or revoke the MINTER_ROLE

## Security

- Role-based access control ensures only authorized addresses can mint new tokens
- Built on proven, audited libraries from thirdweb
- Follows Solidity best practices for secure token design

## Development

To set up the development environment:

1. Clone this repository
2. Install dependencies: `npm install`
3. Run tests on the local Hardhat network: `npx hardhat run scripts/test.js --network localhost`

## License

This project is licensed under the MIT License.