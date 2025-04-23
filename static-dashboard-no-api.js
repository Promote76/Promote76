/**
 * Static Dashboard Server for SWF (No API Calls)
 * 
 * This server serves a dashboard with hardcoded data and no API calls.
 */

const express = require('express');
const app = express();
const PORT = 5000;

// Static mock data instead of API calls
const mockData = {
  token: {
    name: "Sovran Wealth Fund",
    symbol: "SWF",
    address: "0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7",
    totalSupply: "500000",
    network: "Polygon Mainnet",
    deploymentTx: "0x0ac75e83b1ddb5261c96d6bf73deded44fe069b96bfec13a0a34ea1c84fcbf73",
    recipientWallet: "0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6"
  },
  roles: [
    { name: "Treasury", percentage: "20.00", address: "0x26a8401287ce33cc4AEb5a106cD6D282a9c2f51D" },
    { name: "Staking", percentage: "30.00", address: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db" },
    { name: "Development", percentage: "15.00", address: "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB" },
    { name: "Marketing", percentage: "10.00", address: "0x617F2E2fD72FD9D5503197092aC168c91465E7f2" },
    { name: "Community", percentage: "10.00", address: "0x17F6AD8Ef982297579C203069C1DbfFE4348c372" },
    { name: "Team", percentage: "10.00", address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955" },
    { name: "Reserve", percentage: "5.00", address: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f" }
  ],
  vault: {
    minApr: "10.00",
    maxApr: "30.00",
    currentApr: "15.00",
    totalDeposit: "0"
  }
};

// HTML Generation function that uses the mock data instead of API calls
function generateDashboardHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SWF Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        header {
            text-align: center;
            margin-bottom: 30px;
        }
        h1 {
            color: #2563eb;
            font-size: 2.2rem;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 1.1rem;
            margin-top: 0;
        }
        .card {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
        }
        .token-info {
            text-align: center;
            margin-bottom: 30px;
        }
        .address {
            font-family: monospace;
            background-color: #f1f5f9;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            word-break: break-all;
            margin: 15px 0;
            font-size: 0.9em;
        }
        .token-supply {
            font-size: 2.5rem;
            font-weight: bold;
            color: #2563eb;
            margin: 15px 0;
        }
        .token-network {
            display: inline-block;
            background-color: #e0e7ff;
            color: #4f46e5;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: bold;
        }
        .status-list {
            list-style-type: none;
            padding: 0;
        }
        .status-item {
            padding: 12px 0 12px 36px;
            position: relative;
            border-bottom: 1px solid #e5e7eb;
        }
        .status-item:last-child {
            border-bottom: none;
        }
        .status-item:before {
            content: "✓";
            position: absolute;
            left: 5px;
            color: #10b981;
            font-weight: bold;
        }
        .transaction {
            margin: 20px 0;
        }
        .label {
            font-weight: 600;
            color: #4b5563;
            display: block;
            margin-bottom: 5px;
        }
        footer {
            text-align: center;
            margin-top: 40px;
            color: #6b7280;
            font-size: 0.9rem;
        }
        .role-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .role-card {
            background-color: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
        }
        .role-name {
            font-weight: 600;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .role-percentage {
            font-size: 1.2rem;
            font-weight: bold;
            color: #10b981;
            margin: 5px 0;
        }
        .role-address {
            font-family: monospace;
            font-size: 0.8em;
            color: #6b7280;
            word-break: break-all;
        }
        .warning-banner {
            background-color: #fffbeb;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 10px 15px;
            margin-bottom: 20px;
            color: #854d0e;
            font-size: 0.9rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${mockData.token.name}</h1>
            <p class="subtitle">Token Dashboard</p>
        </header>
        
        <div class="warning-banner">
            This is a static dashboard with no API calls to avoid JSON parsing errors.
        </div>
        
        <div class="token-info">
            <h2>SWF Token</h2>
            <div class="address">${mockData.token.address}</div>
            <div class="token-supply">${mockData.token.totalSupply} SWF</div>
            <div class="token-network">${mockData.token.network}</div>
        </div>
        
        <div class="card">
            <h2>Project Status</h2>
            <ul class="status-list">
                <li class="status-item">SWF token contract deployed to Polygon mainnet</li>
                <li class="status-item">500,000 SWF tokens minted to recipient wallet</li>
                <li class="status-item">PostgreSQL database created with all necessary tables</li>
                <li class="status-item">Dynamic APR system configured with 10-30% range</li>
                <li class="status-item">16 virtual wallets per user with 5 different role types</li>
            </ul>
        </div>
        
        <div class="card">
            <h2>Transaction Information</h2>
            <div class="transaction">
                <span class="label">Deployment Transaction:</span>
                <div class="address">${mockData.token.deploymentTx}</div>
            </div>
            <div class="transaction">
                <span class="label">Recipient Wallet:</span>
                <div class="address">${mockData.token.recipientWallet}</div>
            </div>
        </div>
        
        <div class="card">
            <h2>Role Allocations</h2>
            <div class="role-grid">
                ${mockData.roles.map(role => `
                    <div class="role-card">
                        <div class="role-name">${role.name}</div>
                        <div class="role-percentage">${role.percentage}%</div>
                        <div class="role-address">${role.address}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="card">
            <h2>Vault Information</h2>
            <div class="transaction">
                <span class="label">APR Range:</span>
                <div>${mockData.vault.minApr}% - ${mockData.vault.maxApr}%</div>
            </div>
            <div class="transaction">
                <span class="label">Current APR:</span>
                <div>${mockData.vault.currentApr}%</div>
            </div>
            <div class="transaction">
                <span class="label">Total Deposited:</span>
                <div>${mockData.vault.totalDeposit} SWF</div>
            </div>
        </div>
        
        <footer>
            <p>Sovran Wealth Fund &copy; 2025</p>
            <p>Last updated: April 23, 2025</p>
        </footer>
    </div>
    <script>
        // No API calls or fetch operations
        console.log('Dashboard loaded with static data');
    </script>
</body>
</html>
  `;
}

// Route to serve the static dashboard
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(generateDashboardHtml());
});

// Start the server with robust error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static dashboard (no API) running at http://0.0.0.0:${PORT}`);
  console.log(`Using hardcoded mock data instead of API calls`);
});

// Keep the server alive
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions to prevent sudden crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Keep the server running despite errors
});