# Sovran Wealth Fund (SWF) Token Guide

Congratulations on successfully deploying your SovranWealthFund (SWF) token to the Polygon mainnet! This guide will help you interact with your token and utilize its features.

## Token Information

- **Token Name:** Sovran Wealth Fund
- **Token Symbol:** SWF
- **Decimals:** 18
- **Contract Address:** `0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7`
- **Network:** Polygon Mainnet
- **Block Explorer:** [View on Polygonscan](https://polygonscan.com/address/0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7)

## Adding the Token to Your Wallet

### MetaMask

1. Open your MetaMask wallet and make sure you're connected to the Polygon mainnet
2. Scroll down and click "Import tokens"
3. Enter the contract address: `0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7`
4. The token symbol (SWF) and decimals (18) should auto-fill
5. Click "Add Custom Token" and then "Import Tokens"

## Token Features

Your SovranWealthFund token implements the following features:

### 1. Role-Based Minting

Only addresses with the `MINTER_ROLE` can mint new tokens. By default, this role is granted to:
- The deployer address (0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d)
- The Treasury address (0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d)

### 2. Pausable Functionality

The contract owner can pause and unpause all token transfers in emergency situations.

### 3. Burn Capability

Any token holder can burn (destroy) their own tokens.

## Interacting with Your Token

### Using Polygonscan

Since your contract is verified, you can interact with it directly through Polygonscan:

1. Go to your [contract page on Polygonscan](https://polygonscan.com/address/0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7#writeContract)
2. Click on the "Contract" tab
3. Select "Write Contract"
4. Connect your wallet (click "Connect to Web3")
5. You'll see all available functions you can call

### Minting New Tokens

To mint new tokens (requires `MINTER_ROLE`):

1. On Polygonscan, find the `mintTo` function
2. Enter the recipient address and amount (in wei, add 18 zeros after your desired amount)
3. Click "Write"
4. Confirm the transaction in your wallet

### Pausing the Contract

To pause all token transfers (only owner):

1. On Polygonscan, find the `pause` function
2. Click "Write"
3. Confirm the transaction in your wallet

### Unpausing the Contract

To unpause all token transfers (only owner):

1. On Polygonscan, find the `unpause` function
2. Click "Write"
3. Confirm the transaction in your wallet

### Burning Tokens

To burn your own tokens:

1. On Polygonscan, find the `burn` function
2. Enter the amount to burn (in wei, add 18 zeros after your desired amount)
3. Click "Write"
4. Confirm the transaction in your wallet

## Programmatic Interaction (JavaScript)

To interact with your token programmatically:

```javascript
// Using ethers.js
const { ethers } = require("ethers");

// Set up provider (using Alchemy or other service)
const provider = new ethers.providers.JsonRpcProvider(
  "https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
);

// Contract address
const contractAddress = "0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7";

// ABI - You can get the full ABI from Polygonscan
const abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function mintTo(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount) returns (bool)",
  "function pause() returns (bool)",
  "function unpause() returns (bool)"
];

// Connect to the contract
const contract = new ethers.Contract(contractAddress, abi, provider);

// For read operations
async function getTokenInfo() {
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const totalSupply = await contract.totalSupply();
  const balance = await contract.balanceOf("YOUR_ADDRESS");
  
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Total Supply: ${ethers.utils.formatEther(totalSupply)} ${symbol}`);
  console.log(`Balance: ${ethers.utils.formatEther(balance)} ${symbol}`);
}

// For write operations (requires a signer)
async function mintTokens() {
  // Set up signer with your private key
  const signer = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);
  
  // Connect signer to contract
  const tokenWithSigner = contract.connect(signer);
  
  // Mint tokens (assuming you have MINTER_ROLE)
  const recipient = "RECIPIENT_ADDRESS";
  const amount = ethers.utils.parseEther("1000"); // 1000 tokens
  
  const tx = await tokenWithSigner.mintTo(recipient, amount);
  await tx.wait();
  
  console.log(`Minted ${ethers.utils.formatEther(amount)} tokens to ${recipient}`);
}
```

## Security Recommendations

1. **Admin Key Management**: Ensure your private keys with administrative powers (owner, minter role) are securely stored
2. **Role Management**: Consider distributing roles to multiple addresses for better security
3. **Regular Auditing**: Monitor your token's transactions regularly for any suspicious activity
4. **Multi-sig Operations**: Consider implementing multi-signature requirements for sensitive operations

## Helpful Resources

- [Polygon Network Documentation](https://wiki.polygon.technology/)
- [Ethers.js Documentation](https://docs.ethers.io/v5/)
- [OpenZeppelin Documentation](https://docs.openzeppelin.com/contracts/4.x/)
- [ThirdWeb Documentation](https://portal.thirdweb.com/)