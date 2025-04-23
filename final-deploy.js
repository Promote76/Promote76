/**
 * SWF Final Deployment Server
 * 
 * This server has been stripped down to the absolute minimum
 * with no JSON functionality at all.
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Text-only response for health check
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.end('OK');
});

// Pure HTML for main page
app.get('/', (req, res) => {
  // Explicitly use end() with HTML string to avoid JSON parsing
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWF Token Dashboard</title>
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
      max-width: 700px;
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
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .card {
      margin: 20px 0;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    .card h2 {
      margin-top: 0;
      font-size: 1.4rem;
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
  </style>
</head>
<body>
  <div class="container">
    <h1>Sovran Wealth Fund</h1>
    
    <div class="success">
      Deployment Successful
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
  `);
});

// Fallback for any other route
app.use((req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.end('Sovran Wealth Fund API');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SWF Final Deployment server running on http://0.0.0.0:${PORT}`);
});