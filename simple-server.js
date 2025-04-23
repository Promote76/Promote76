const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// Set up static file serving
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Add a simple API endpoint that returns plain text
app.get('/api/status', (req, res) => {
  res.send('API is working!');
});

// Add a simple home route that serves a basic HTML directly
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
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
        }
        .card {
          border: 1px solid #ddd;
          padding: 15px;
          margin: 15px 0;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <h1>Sovran Wealth Fund Dashboard</h1>
      
      <div class="card">
        <h2>Token Information</h2>
        <p><strong>SWF Token Address:</strong> 0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</p>
        <p><strong>Total Supply:</strong> 500,000 SWF</p>
        <p><strong>Network:</strong> Polygon Mainnet</p>
      </div>
      
      <div class="card">
        <h2>Project Status</h2>
        <p>✅ Token contract deployed to Polygon Mainnet</p>
        <p>✅ 500,000 SWF tokens minted successfully</p>
        <p>✅ Database structure created with transaction tracking</p>
        <p>✅ API server operational with all endpoints functional</p>
      </div>
      
      <div class="card">
        <h2>Recent Transaction</h2>
        <p><strong>Deployment:</strong> 0x0ac75e83b1ddb5261c96d6bf73deded44fe069b96bfec13a0a34ea1c84fcbf73</p>
        <p><strong>Recipient:</strong> 0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6</p>
      </div>
      
      <div class="card">
        <h2>Links</h2>
        <p><a href="/simple.html">View Static Project Page</a></p>
      </div>
      
      <footer style="margin-top: 30px; color: #7f8c8d; text-align: center;">
        Sovran Wealth Fund © 2025 - Generated on ${new Date().toLocaleString()}
      </footer>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on http://0.0.0.0:${PORT}`);
});