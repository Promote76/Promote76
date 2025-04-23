# Sovran Wealth Fund Token (SWF)

## Deployment Instructions

1. Set your private key in the `.env` file.
2. Run deployment to Polygon Mainnet:

```bash
npx hardhat run scripts/deploy.js --network polygon
```

3. Verify the contract:

```bash
npx hardhat verify --network polygon <DEPLOYED_CONTRACT_ADDRESS> "0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6" "0x26A8401287cE33CC4aeb5a106cd6D282a9C2f51d"
```