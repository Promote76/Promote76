# Sovran Wealth Fund - Distribution Guide

This guide explains how to use the token distribution system for the Sovran Wealth Fund (SWF) project. The distribution system provides multiple ways to distribute tokens across 17 predefined wallets according to their assigned shares.

## Distribution Mechanisms

The SWF project offers three distribution mechanisms:

1. **Manual Distribution**: Run the distribution script manually when needed
2. **Scheduled Distribution**: Set up a recurring schedule for automatic distribution (e.g., weekly)
3. **Stake-Triggered Distribution**: Automatically distribute when staking activity reaches a threshold

## Wallet Configuration

The distribution system is configured with 17 wallets, each with a defined role and share percentage:

| Role | Address | Share |
|------|---------|-------|
| Main Distributor | 0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6 | 15% |
| Treasury | 0x26A8401287cE33CC4aeb5a106cd6D282a9C2f51d | 20% |
| Service Wallet | 0x7456BB1ab2FBb40B67807563595Cb6c9698d9aA1 | 5% |
| OTC Buyer 1 | 0x7E9A4698788d582F3B99364071f539841693201 | 5% |
| Dividend Holder 1 | 0x50f7022033Ce4b1c025D7bFE56d0C27020Ae2Fe3 | 5% |
| Dividend Holder 2 | 0xEb02b2bC1CEb07F0B9bb78A8467CeB090A4643Fc | 5% |
| Dividend Holder 3 | 0x3cCC9DEB6121aB5733a9F5715Dc92f4a40ED872A | 5% |
| Dividend Holder 4 | 0x750a4dbc335D9de258D9d8297C002c4E002FdE34 | 5% |
| OTC Buyer 2 | 0x613afBE121004958cE6000CB2B14D1c8B0CbbB9 | 5% |
| Liquidity Manager | 0x2A5269E92C48829fdF21D8892c23E894B11D15e3 | 5% |
| OTC Buyer 3 | 0xE6a77F0B7Fe41fe01661b8BD82aaDF95DBAA5E79 | 5% |
| OTC Buyer 4 | 0xCeDdb7dF2F6f1e1caC7AC767337A38Ab1D85e1eD | 5% |
| LP Wallet 1 | 0x62c62b5Bc31cA7F04910d6Be28d74E07D82b4A5 | 3% |
| LP Wallet 2 | 0x5013Ae54fBaEC83106afA6cD26C06Ba64D2f718d | 3% |
| LP Wallet 3 | 0x62850718f02f8f5874c0ADf156876eF01Ae8bE8C | 3% |
| Governance Wallet | 0x8Af139af51Fc53DD7575e331Fbb039Cf029e2DF | 3% |
| Reward Collector | 0xFE60C780Ba081a03F211d7eadD4ABcd34B60f78F | 3% |

The total shares add up to 100% (10,000 basis points), and tokens are distributed proportionally.

## Prerequisites

Before using the distribution system:

1. Ensure you have the required environment variables in your `.env` file:
   ```
   PRIVATE_KEY=your_private_key
   ALCHEMY_API_KEY=your_alchemy_api_key
   SWF_TOKEN_ADDRESS=0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7
   SOLO_METHOD_ENGINE_ADDRESS=your_staking_contract_address
   ```

2. Make sure your wallet has:
   - SWF tokens to distribute
   - MATIC for gas fees

## Option 1: Manual Distribution

To run a one-time distribution of all SWF tokens in your wallet:

```bash
npx hardhat run scripts/distribute.js --network polygon
```

This will:
1. Take all SWF tokens from the wallet associated with your private key
2. Distribute them across the 17 predefined wallets according to their shares
3. Log the distribution details to `logs/payouts.json`

## Option 2: Scheduled Distribution (Weekly)

To set up a weekly automatic distribution:

```bash
node scripts/schedule-distribution.js
```

This starts a long-running process that:
1. Runs the distribution every Sunday at 00:00 UTC
2. Logs all activities to `logs/distribution-cron.log`

For production use, we recommend using PM2 to keep the scheduler running:

```bash
npm install -g pm2
pm2 start scripts/schedule-distribution.js --name "swf-weekly-distribution"
```

To modify the schedule, edit the `cronPattern` variable in `scripts/schedule-distribution.js`:
- `0 0 * * 0`: Weekly on Sunday at midnight
- `0 0 1 * *`: Monthly on the 1st day
- `0 12 * * 1-5`: Weekdays at noon
- `0 0 */7 * *`: Every 7 days

## Option 3: Stake-Triggered Distribution

To set up distribution based on staking activity:

```bash
node scripts/stake-triggered-distribution.js
```

This starts a long-running process that:
1. Monitors all staking events on the SoloMethodEngineV2 contract
2. Accumulates the total amount staked since the last distribution
3. Triggers a distribution when:
   - At least 5,000 SWF has been staked since the last distribution
   - At least 24 hours have passed since the last distribution

For production use, use PM2:

```bash
pm2 start scripts/stake-triggered-distribution.js --name "swf-stake-triggered"
```

To modify the threshold and timing, edit the `CONFIG` object in `scripts/stake-triggered-distribution.js`.

## Logging and Monitoring

All distribution methods provide detailed logging:

- **Manual Distribution**: Creates/updates `logs/payouts.json` with all transaction details
- **Scheduled Distribution**: Logs to `logs/distribution-cron.log`
- **Stake-Triggered Distribution**: Logs to `logs/stake-triggered-distribution.log` and maintains state in `logs/distribution-state.json`

## Security Considerations

1. **Private Key Security**: Store your private key securely; consider using a hardware wallet or secure environment variables
2. **Gas Fees**: Ensure your wallet has enough MATIC for multiple transactions (17 transfers)
3. **Monitoring**: Regularly check the logs to verify distributions are occurring as expected
4. **Error Handling**: All scripts include error handling and logging to help diagnose issues

## Customizing the Distribution

To modify the wallet list or share percentages:

1. Edit the `WALLET_ROLES` array in `scripts/distribute.js`
2. Ensure the total of all shares equals 10,000 basis points (100%)
3. Test the changes on a testnet before deploying to mainnet

## Conclusion

The SWF distribution system provides flexible options for distributing tokens according to your preferred cadence. Whether you need manual control, a regular schedule, or activity-based distribution, you can choose the approach that best fits your project's needs.