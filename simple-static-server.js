/**
 * Simple Static Server for SWF
 * 
 * This is the simplest possible Express server that serves a static HTML file.
 * It has zero API dependencies and no JSON parsing.
 */

const express = require('express');
const app = express();
const PORT = 5000;

// Serve a simple static HTML with no API dependencies
app.get('/', (req, res) => {
  res.send(`
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
          background: #f5f7fa;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1, h2 {
          color: #1e3a8a;
        }
        h1 {
          font-size: 2rem;
          margin-top: 0;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border: 1px solid #eee;
        }
        .info-item {
          margin-bottom: 8px;
        }
        .label {
          font-weight: bold;
          color: #4b5563;
        }
        .address {
          font-family: monospace;
          background-color: #f1f5f9;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          word-break: break-all;
          font-size: 0.9em;
        }
        .status-item {
          margin-bottom: 10px;
          padding-left: 25px;
          position: relative;
        }
        .status-item:before {
          content: "✅";
          position: absolute;
          left: 0;
        }
        footer {
          margin-top: 30px;
          text-align: center;
          color: #6b7280;
          font-size: 0.9rem;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .token-info {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          border: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }
        .token-supply {
          font-size: 2.5rem;
          font-weight: bold;
          color: #2563eb;
          margin: 10px 0;
        }
        .token-network {
          display: inline-block;
          background-color: #e0e7ff;
          color: #4f46e5;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: bold;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Sovran Wealth Fund Dashboard</h1>
        
        <div class="token-info">
          <h2>SWF Token</h2>
          <div class="address">0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</div>
          <div class="token-supply">500,000 SWF</div>
          <div class="token-network">Polygon Mainnet</div>
        </div>
        
        <div class="card">
          <h2>Project Status</h2>
          <div class="status-item">SWF token contract deployed to Polygon mainnet</div>
          <div class="status-item">500,000 SWF tokens minted to recipient wallet</div>
          <div class="status-item">PostgreSQL database created with all necessary tables</div>
          <div class="status-item">Dynamic APR system configured with 10-30% range</div>
          <div class="status-item">16 virtual wallets per user with 5 different role types</div>
        </div>
        
        <div class="card">
          <h2>SoloMethodEngine Staking</h2>
          <div class="info-item">
            <span class="label">APR Range:</span> 10% - 30%
          </div>
          <div class="info-item">
            <span class="label">Current APR:</span> 15%
          </div>
          <div class="info-item">
            <span class="label">Minimum Stake:</span> 50 SWF
          </div>
          <div class="info-item">
            <span class="label">Role Types:</span> BUYER, HOLDER, STAKER, LIQUIDITY, TRACKER
          </div>
        </div>
        
        <div class="card">
          <h2>Transaction Information</h2>
          <div class="info-item">
            <span class="label">Deployment Transaction:</span>
            <div class="address">0x0ac75e83b1ddb5261c96d6bf73deded44fe069b96bfec13a0a34ea1c84fcbf73</div>
          </div>
          <div class="info-item">
            <span class="label">Recipient Wallet:</span>
            <div class="address">0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6</div>
          </div>
        </div>
        
        <footer>
          <p>Sovran Wealth Fund &copy; 2025 - Last updated: ${new Date().toLocaleString()}</p>
          <p>Static dashboard - No API dependencies</p>
        </footer>
      </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple static server running on http://0.0.0.0:${PORT}`);
});