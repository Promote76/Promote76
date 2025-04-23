# Sovran Wealth Fund Frontend Deployment Guide

This guide provides step-by-step instructions for deploying the Sovran Wealth Fund frontend application.

## Development Environment Setup

1. **Install Dependencies**

```bash
cd frontend
npm install
```

2. **Configure Environment Variables**

Create a `.env` file in the frontend directory with the contract addresses:

```
REACT_APP_SWF_TOKEN_ADDRESS=0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7
REACT_APP_SWF_BASKET_VAULT_ADDRESS=0x883FaE02D319a5B7E67269bB21276B3e73DB43C9
REACT_APP_SOLO_METHOD_ENGINE_ADDRESS=0x8b7fD126e94A086B066bb3166Bb17834a09Ac73d
REACT_APP_DYNAMIC_APR_CONTROLLER_ADDRESS=0xFC49C9e14F5C40f0d91A248C6c8B77Cf8F55a748
```

3. **Start the Development Server**

```bash
npm start
```

Or use the provided script:

```bash
./start-frontend.sh
```

The application will be available at http://localhost:3000.

## Testing Against Different Networks

### Local Development (Hardhat)

1. Start a local Hardhat node:

```bash
npx hardhat node
```

2. Deploy the contracts to the local node:

```bash
npx hardhat run scripts/deployDynamicSystem.js --network localhost
```

3. Update the contract addresses in the `.env` file with the local addresses.

### Polygon Mumbai Testnet

1. Ensure you have test MATIC in your wallet (from a Mumbai faucet).
2. Deploy the contracts to Mumbai:

```bash
npx hardhat run scripts/deployDynamicSystem.js --network mumbai
```

3. Update the contract addresses in the `.env` file with the Mumbai addresses.

### Polygon Mainnet

For mainnet, use the verified deployed contract addresses.

## Production Deployment

### Building for Production

Create an optimized production build:

```bash
cd frontend
npm run build
```

This creates a `build` directory with the production-ready files.

### Deployment Options

#### Option 1: Static Hosting (Netlify, Vercel, GitHub Pages)

1. Create a production build as described above.
2. Upload the contents of the `build` directory to your static hosting provider.
3. Configure environment variables in your hosting provider's dashboard.

#### Option 2: Traditional Web Server (Nginx, Apache)

1. Create a production build as described above.
2. Copy the contents of the `build` directory to your web server's public directory.
3. Configure your web server to serve the application and handle client-side routing.

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Post-Deployment Steps

### Verification

1. Test wallet connection functionality
2. Verify contract interactions (deposit, withdraw, stake, claim)
3. Test on different browsers and devices
4. Check network switching behavior

### Monitoring

Consider setting up:
- Error tracking (e.g., Sentry)
- Analytics (e.g., Google Analytics)
- Uptime monitoring (e.g., UptimeRobot)

## Maintenance

### Updates

To update the application:

1. Make changes to the codebase
2. Test thoroughly in a development environment
3. Create a new production build
4. Deploy the new build following the steps above

### Contract Address Updates

If contract addresses change:
1. Update the addresses in the environment variables
2. Rebuild and redeploy the application

## Troubleshooting

### Common Issues

1. **Wallet Connection Problems**
   - Ensure MetaMask or other wallet is installed and unlocked
   - Check console for connection errors

2. **Contract Interaction Failures**
   - Verify the contract addresses in the environment variables
   - Check that the user has sufficient token balance and network currency (MATIC)
   - Verify ABI compatibility with deployed contracts

3. **Network Issues**
   - Ensure the user is connected to a supported network
   - Check RPC endpoint availability

4. **UI Rendering Problems**
   - Clear browser cache
   - Update to the latest version of the application
   - Check browser console for JavaScript errors