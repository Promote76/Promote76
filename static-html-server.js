/**
 * Static HTML Server for SWF
 * 
 * This is a simple Express server that serves a static HTML file
 * without any dynamic data fetching or JSON parsing.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 5000;

// Create the static HTML file
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sovran Wealth Fund</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 {
      color: #0a3d62;
    }
    h1 {
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      background-color: #f9f9f9;
    }
    .info {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .info-item {
      flex: 1;
      min-width: 200px;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .address {
      font-family: monospace;
      background-color: #eee;
      padding: 5px;
      border-radius: 4px;
      word-break: break-all;
      font-size: 0.9em;
    }
    .success {
      color: #27ae60;
      font-weight: bold;
    }
    .network {
      display: inline-block;
      background-color: #e3f2fd;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
      color: #1565c0;
    }
    footer {
      margin-top: 40px;
      border-top: 1px solid #ddd;
      padding-top: 10px;
      color: #777;
      font-size: 0.9em;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Sovran Wealth Fund Dashboard</h1>
  
  <div class="card">
    <h2>SWF Token</h2>
    <div class="info">
      <div class="info-item">
        <p><span class="label">Contract Address:</span></p>
        <p class="address">0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</p>
      </div>
      <div class="info-item">
        <p><span class="label">Total Supply:</span> 500,000 SWF</p>
        <p><span class="label">Network:</span> <span class="network">Polygon Mainnet</span></p>
        <p><span class="label">Status:</span> <span class="success">Deployed Successfully</span></p>
      </div>
    </div>
  </div>
  
  <div class="card">
    <h2>Project Status</h2>
    <ul>
      <li><span class="success">✓</span> SWF token contract deployed to Polygon mainnet</li>
      <li><span class="success">✓</span> 500,000 SWF tokens minted to recipient wallet</li>
      <li><span class="success">✓</span> PostgreSQL database created with necessary tables</li>
      <li><span class="success">✓</span> API server running with all endpoints operational</li>
      <li><span class="success">✓</span> Smart contract functions verified on Polygonscan</li>
    </ul>
  </div>
  
  <div class="card">
    <h2>Transaction Information</h2>
    <p><span class="label">Deployment Transaction:</span></p>
    <p class="address">0x0ac75e83b1ddb5261c96d6bf73deded44fe069b96bfec13a0a34ea1c84fcbf73</p>
    <p><span class="label">Recipient Wallet:</span></p>
    <p class="address">0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6</p>
  </div>
  
  <div class="card">
    <h2>Dynamic APR Staking System</h2>
    <div class="info">
      <div class="info-item">
        <p><span class="label">APR Range:</span> 10% - 30%</p>
        <p><span class="label">Current APR:</span> 15%</p>
        <p><span class="label">Minimum Stake:</span> 50 SWF</p>
      </div>
      <div class="info-item">
        <p><span class="label">Engine:</span> SoloMethodEngine</p>
        <p><span class="label">Virtual Wallets:</span> 16 per user</p>
        <p><span class="label">Role Types:</span> 5 different roles</p>
      </div>
    </div>
  </div>
  
  <div class="card">
    <h2>Database Schema</h2>
    <p>The project uses a PostgreSQL database with the following tables:</p>
    <ul>
      <li><strong>users</strong> - Basic user information</li>
      <li><strong>transactions</strong> - Transaction history records</li>
      <li><strong>staking</strong> - Records of token staking activities</li>
      <li><strong>vaults</strong> - Token vaults that influence APR rates</li>
      <li><strong>role_allocations</strong> - Token distribution allocation percentages</li>
    </ul>
  </div>
  
  <footer>
    Sovran Wealth Fund &copy; 2025 - Last updated: April 23, 2025
  </footer>
</body>
</html>`;

// Write the HTML to a file
fs.writeFileSync(path.join(__dirname, 'frontend/public/dashboard.html'), html);

// Set up static file serving
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Redirect root to dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard.html');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static HTML server running on http://0.0.0.0:${PORT}`);
});