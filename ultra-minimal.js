/**
 * Ultra Minimal Dashboard for SWF
 * 
 * This is the absolute minimum Express server with no dependencies
 * on any external APIs, JSON parsing, or blockchain interaction.
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Root route with completely static HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWF Ultra Minimal</title>
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
    h1 {
      color: #2563eb;
      margin-top: 0;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 10px;
    }
    .banner {
      background: #dbeafe;
      color: #1e40af;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      text-align: center;
      font-weight: 500;
    }
    .info-box {
      margin-top: 25px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
    }
    .address {
      font-family: monospace;
      background: #f1f5f9;
      padding: 8px;
      border-radius: 4px;
      font-size: 0.9em;
      margin: 10px 0;
      word-break: break-all;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 0.9em;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sovran Wealth Fund</h1>
    
    <div class="banner">
      Ultra Minimal Dashboard - Ready for Deployment
    </div>
    
    <p>
      The Sovran Wealth Fund (SWF) token has been successfully deployed to the Polygon Mainnet
      and is fully operational. This static dashboard provides basic information.
    </p>
    
    <div class="info-box">
      <h3>Token Information</h3>
      <p><strong>Name:</strong> Sovran Wealth Fund</p>
      <p><strong>Symbol:</strong> SWF</p>
      <p><strong>Total Supply:</strong> 500,000 SWF</p>
      <p><strong>Network:</strong> Polygon Mainnet</p>
      <p><strong>Contract Address:</strong></p>
      <div class="address">0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</div>
    </div>
    
    <div class="info-box">
      <h3>Deployment Details</h3>
      <p><strong>Deployment Date:</strong> April 23, 2025</p>
      <p><strong>Deployment Transaction:</strong></p>
      <div class="address">0x0ac75e83b1ddb5261c96d6bf73deded44fe069b96bfec13a0a34ea1c84fcbf73</div>
      <p><strong>Recipient Wallet:</strong></p>
      <div class="address">0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6</div>
    </div>
    
    <div class="footer">
      &copy; 2025 Sovran Wealth Fund - All Rights Reserved
    </div>
  </div>
</body>
</html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ultra Minimal SWF Dashboard running on http://0.0.0.0:${PORT}`);
});