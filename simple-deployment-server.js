/**
 * Simple Deployment Server for SWF
 * 
 * This server uses Node.js's built-in http module with no dependencies.
 */

const http = require('http');

// Port to listen on
const PORT = process.env.PORT || 5000;

// The HTML content of our dashboard
const dashboardHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sovran Wealth Fund Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f8fa;
    }
    h1 {
      color: #2c3e50;
      text-align: center;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
      margin-bottom:
      30px;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .address {
      font-family: monospace;
      background: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      word-break: break-all;
    }
    .tag {
      display: inline-block;
      background: #3498db;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 5px;
    }
    .status {
      background: #2ecc71;
      color: white;
      text-align: center;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table td, table th {
      padding: 8px;
      border-bottom: 1px solid #ddd;
    }
    table th {
      text-align: left;
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  <h1>Sovran Wealth Fund (SWF)</h1>
  
  <div class="status">Deployment Status: Active ✓</div>
  
  <div class="card">
    <h2>Token Overview</h2>
    <table>
      <tr>
        <th>Name</th>
        <td>Sovran Wealth Fund</td>
      </tr>
      <tr>
        <th>Symbol</th>
        <td>SWF</td>
      </tr>
      <tr>
        <th>Total Supply</th>
        <td>500,000 SWF</td>
      </tr>
      <tr>
        <th>Network</th>
        <td>Polygon Mainnet (Chain ID: 137)</td>
      </tr>
    </table>
  </div>
  
  <div class="card">
    <h2>Contract Details</h2>
    <p><strong>Token Contract:</strong></p>
    <p class="address">0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</p>
    <p><strong>Deployment Transaction:</strong></p>
    <p class="address">0x0ac75e83b1ddb5261c96d6bf73deded44fe069b96bfec13a0a34ea1c84fcbf73</p>
  </div>
  
  <div class="card">
    <h2>Token Distribution</h2>
    <p><strong>Primary Recipient:</strong></p>
    <p class="address">0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6</p>
    <p><strong>Initial Mint:</strong> 500,000 SWF</p>
  </div>
  
  <div class="card">
    <h2>Staking Information</h2>
    <table>
      <tr>
        <th>Current APR</th>
        <td>15%</td>
      </tr>
      <tr>
        <th>APR Range</th>
        <td>10% - 30%</td>
      </tr>
      <tr>
        <th>Minimum Stake</th>
        <td>50 SWF</td>
      </tr>
      <tr>
        <th>Role Types</th>
        <td>
          <span class="tag">BUYER</span>
          <span class="tag">HOLDER</span>
          <span class="tag">STAKER</span>
          <span class="tag">LIQUIDITY</span>
          <span class="tag">TRACKER</span>
        </td>
      </tr>
    </table>
  </div>
  
  <div class="card">
    <h2>Project Architecture</h2>
    <ul>
      <li><strong>Token Contract:</strong> ERC20 with permissioned roles</li>
      <li><strong>Staking Engine:</strong> SoloMethodEngine with dynamic APR</li>
      <li><strong>Asset Backing:</strong> SWF Basket Vault for underlying assets</li>
      <li><strong>Distribution System:</strong> 17-wallet allocation setup</li>
      <li><strong>Database:</strong> PostgreSQL for transaction history</li>
    </ul>
  </div>
  
  <footer style="text-align: center; margin-top: 40px; color: #7f8c8d;">
    Sovran Wealth Fund &copy; 2025 | Last Updated: April 23, 2025
  </footer>
</body>
</html>
`;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Set response headers
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(dashboardHTML)
  });
  
  // Send the response
  res.end(dashboardHTML);
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple Deployment Server running on http://0.0.0.0:${PORT}`);
});