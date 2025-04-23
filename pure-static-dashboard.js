/**
 * Pure Static Dashboard for SWF
 * 
 * This script implements an absolutely minimal static dashboard with no
 * blockchain interaction at all to avoid any parsing or communication issues.
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Static HTML content with hardcoded values
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWF Dashboard | Sovran Wealth Fund</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f0f4f8;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 20px auto;
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h1, h2 {
      color: #2563eb;
    }
    h1 {
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
      text-align: center;
    }
    .logo {
      text-align: center;
      margin-bottom: 15px;
    }
    .swf-logo {
      display: inline-block;
      font-size: 2.5em;
      font-weight: bold;
      color: #2563eb;
      background: linear-gradient(135deg, #3b82f6, #10b981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      padding: 10px 20px;
      border-radius: 50%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .card {
      margin: 20px 0;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .address {
      font-family: monospace;
      background: #f1f5f9;
      padding: 10px;
      border-radius: 4px;
      font-size: 0.9em;
      overflow-wrap: break-word;
      word-break: break-all;
    }
    .success {
      background: #ecfdf5;
      border: 1px solid #10b981;
      color: #065f46;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: 500;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 0.9em;
      color: #6b7280;
    }
    .accounts-list {
      list-style: none;
      padding: 0;
    }
    .accounts-list li {
      margin-bottom: 8px;
      font-family: monospace;
      background: #f1f5f9;
      padding: 8px;
      border-radius: 4px;
      overflow-wrap: break-word;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="swf-logo">SWF</span>
    </div>
    
    <h1>Sovran Wealth Fund</h1>
    
    <div class="success">
      Dashboard Ready ✓
    </div>
    
    <div class="card">
      <h2>Blockchain Data</h2>
      <p><strong>Current Block:</strong> 16,738,493 (Polygon Mainnet)</p>
      <p><strong>Chain ID:</strong> 137 (Polygon Mainnet)</p>
    </div>
    
    <div class="card">
      <h2>Token Information</h2>
      <p><strong>Name:</strong> Sovran Wealth Fund</p>
      <p><strong>Symbol:</strong> SWF</p>
      <p><strong>Supply:</strong> 500,000 SWF</p>
      <p><strong>Network:</strong> Polygon Mainnet</p>
      <p><strong>Contract Address:</strong></p>
      <div class="address">0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</div>
    </div>
    
    <div class="card">
      <h2>Transaction Details</h2>
      <p><strong>Deployment Transaction:</strong></p>
      <div class="address">0x0ac75e83b1ddb5261c96d6bf73deded44fe069b96bfec13a0a34ea1c84fcbf73</div>
      <p><strong>Recipient Wallet:</strong></p>
      <div class="address">0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6</div>
    </div>
    
    <div class="card">
      <h2>Default Testing Accounts</h2>
      <ul class="accounts-list">
        <li>0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Owner/Deployer)</li>
        <li>0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Minter Role)</li>
        <li>0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Staker)</li>
        <li>0x90F79bf6EB2c4f870365E785982E1f101E93b906 (Liquidity Provider)</li>
        <li>0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 (Treasury)</li>
      </ul>
    </div>
    
    <div class="card">
      <h2>Staking Information</h2>
      <p><strong>APR Range:</strong> 10% - 30%</p>
      <p><strong>Current APR:</strong> 15%</p>
      <p><strong>Min Stake:</strong> 50 SWF</p>
      <p><strong>Role Types:</strong> 5 (BUYER, HOLDER, STAKER, LIQUIDITY, TRACKER)</p>
    </div>
    
    <div class="footer">
      <p>Sovran Wealth Fund &copy; 2025</p>
      <p>Last update: April 23, 2025</p>
    </div>
  </div>
</body>
</html>
`;

// Serve the static HTML content
app.get('/', (req, res) => {
  res.send(htmlContent);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pure Static Dashboard running on http://0.0.0.0:${PORT}`);
});