/**
 * Final Fixed Dashboard for SWF
 * 
 * This simplified dashboard implementation focuses on providing a minimal
 * interface with proper JSON-RPC handling for the Hardhat node.
 */

const express = require('express');
const http = require('http');
const app = express();
const PORT = process.env.PORT || 5000;

// Utility function to make an RPC call to the Hardhat node
function makeRpcCall(method, params = []) {
  return new Promise((resolve, reject) => {
    // Prepare the JSON-RPC request payload
    const requestData = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: Date.now()
    });
    
    // Configure the request options
    const options = {
      hostname: 'localhost',
      port: 8545,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestData)
      }
    };
    
    // Make the request
    const req = http.request(options, (res) => {
      let data = '';
      
      // Collect the response data
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // Process the response when complete
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          console.error('Error parsing response:', error.message);
          console.error('Raw response:', data);
          reject(new Error(`Failed to parse JSON response: ${error.message}`));
        }
      });
    });
    
    // Handle request errors
    req.on('error', (error) => {
      console.error('Request error:', error.message);
      reject(error);
    });
    
    // Send the request data
    req.write(requestData);
    req.end();
  });
}

// Serve the main HTML page
app.get('/', async (req, res) => {
  try {
    // Fetch blockchain data before rendering the page
    const [blockResult, accountsResult, chainIdResult] = await Promise.all([
      makeRpcCall('eth_blockNumber'),
      makeRpcCall('eth_accounts'),
      makeRpcCall('eth_chainId')
    ]);
    
    // Extract the data from responses
    const blockNumber = blockResult.result ? parseInt(blockResult.result, 16) : 'Unknown';
    const accounts = accountsResult.result || [];
    const chainId = chainIdResult.result ? parseInt(chainIdResult.result, 16) : 'Unknown';
    
    // Render HTML with the fetched data
    res.send(`
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
            Connected to Blockchain ✓
          </div>
          
          <div class="card">
            <h2>Blockchain Data</h2>
            <p><strong>Current Block:</strong> ${blockNumber}</p>
            <p><strong>Chain ID:</strong> ${chainId}</p>
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
            <h2>Available Accounts</h2>
            <ul class="accounts-list">
              ${accounts.slice(0, 5).map((addr, i) => `<li>${i+1}. ${addr}</li>`).join('')}
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
    `);
  } catch (error) {
    // Render error page
    console.error('Error rendering page:', error.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SWF Dashboard | Error</title>
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
          h1 {
            color: #e53e3e;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
          }
          .error-box {
            background: #fef2f2;
            border: 1px solid #ef4444;
            color: #b91c1c;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .error-details {
            font-family: monospace;
            background: #1e293b;
            color: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Dashboard Error</h1>
          
          <div class="error-box">
            <p>We encountered an error connecting to the blockchain:</p>
          </div>
          
          <div class="error-details">${error.message}</div>
          
          <p>Please check that the Hardhat node is running and try again.</p>
        </div>
      </body>
      </html>
    `);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('OK');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Final Fixed Dashboard running on http://0.0.0.0:${PORT}`);
});