/**
 * SWF RPC Test Client
 * 
 * This is a minimal server that demonstrates proper JSON-RPC calls to the Hardhat node.
 */

const express = require('express');
const path = require('path');
// Use a different HTTP client that's CommonJS compatible
const https = require('https');
const http = require('http');
const app = express();
const PORT = process.env.PORT || 5000;

// Simple implementation of fetch for Node.js
function simpleFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request({
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Parse JSON bodies with validation
app.use(express.json({
  strict: true, // Throws on bad JSON
  verify: (req, res, buf) => {
    if (buf.length === 0) {
      throw new Error("Empty JSON body received.");
    }
  }
}));

// Serve the HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SWF RPC Test Client</title>
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
        .card {
          margin: 20px 0;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }
        pre {
          background: #1e293b;
          color: #f1f5f9;
          padding: 15px;
          border-radius: 6px;
          overflow-x: auto;
          font-size: 0.9em;
          white-space: pre-wrap;
        }
        button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1em;
          margin-right: 10px;
        }
        button:hover {
          background: #1d4ed8;
        }
        .success {
          background: #ecfdf5;
          border: 1px solid #10b981;
          color: #065f46;
          padding: 12px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .error {
          background: #fef2f2;
          border: 1px solid #ef4444;
          color: #b91c1c;
          padding: 12px;
          border-radius: 6px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>SWF RPC Test Client</h1>
        
        <div class="card">
          <h2>Test JSON-RPC Call</h2>
          <p>Click the buttons below to test different JSON-RPC methods:</p>
          
          <button id="getBlockNumber">Get Block Number</button>
          <button id="getAccounts">Get Accounts</button>
          <button id="getChainId">Get Chain ID</button>
          
          <div id="status"></div>
          <pre id="result">Results will appear here...</pre>
        </div>
      </div>

      <script>
        // Helper function to make JSON-RPC calls
        async function makeRpcCall(method, params = []) {
          const statusElement = document.getElementById('status');
          const resultElement = document.getElementById('result');
          
          statusElement.className = '';
          statusElement.textContent = 'Making request...';
          
          try {
            // Use our server-side proxy endpoint to avoid CORS issues
            const response = await fetch('/rpc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                method: method,
                params: params,
                id: Date.now()
              })
            });
            
            const result = await response.json();
            resultElement.textContent = JSON.stringify(result, null, 2);
            
            if (result.error) {
              statusElement.className = 'error';
              statusElement.textContent = \`Error: \${result.error.message}\`;
            } else {
              statusElement.className = 'success';
              statusElement.textContent = 'Request successful!';
            }
          } catch (error) {
            statusElement.className = 'error';
            statusElement.textContent = \`Error: \${error.message}\`;
            resultElement.textContent = error.stack || error.message;
          }
        }
        
        // Attach event listeners to buttons
        document.getElementById('getBlockNumber').addEventListener('click', () => {
          makeRpcCall('eth_blockNumber');
        });
        
        document.getElementById('getAccounts').addEventListener('click', () => {
          makeRpcCall('eth_accounts');
        });
        
        document.getElementById('getChainId').addEventListener('click', () => {
          makeRpcCall('eth_chainId');
        });
      </script>
    </body>
    </html>
  `);
});

// Proxy endpoint for JSON-RPC requests
app.post('/rpc', async (req, res) => {
  try {
    // Forward the request to the Hardhat node
    const response = await simpleFetch('http://localhost:8545', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body?.id || null,
      error: {
        code: -32603,
        message: 'Internal error',
        data: { message: error.message }
      }
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('OK');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`RPC Test Client running on http://0.0.0.0:${PORT}`);
});