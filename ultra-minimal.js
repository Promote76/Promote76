/**
 * Ultra Minimal Dashboard for SWF
 * 
 * This is the absolute minimum Express server with no dependencies
 * on any external APIs, JSON parsing, or blockchain interaction.
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Ultra simple HTML with no JS at all
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>SWF Dashboard</title>
  <style>
    body { font-family: sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #4a90e2; }
    .container { max-width: 800px; margin: 0 auto; }
    .card { background: #f7f7f7; padding: 20px; margin-bottom: 20px; border-radius: 5px; }
    .address { font-family: monospace; word-break: break-all; background: #eee; padding: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sovran Wealth Fund (SWF)</h1>
    
    <div class="card">
      <h2>Token Information</h2>
      <p><strong>Name:</strong> Sovran Wealth Fund</p>
      <p><strong>Symbol:</strong> SWF</p>
      <p><strong>Supply:</strong> 500,000 SWF</p>
      <p><strong>Network:</strong> Polygon Mainnet</p>
      <p><strong>Contract Address:</strong></p>
      <p class="address">0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</p>
    </div>
    
    <div class="card">
      <h2>Transaction Details</h2>
      <p><strong>Deployment TX:</strong></p>
      <p class="address">0x0ac75e83b1ddb5261c96d6bf73deded44fe069b96bfec13a0a34ea1c84fcbf73</p>
      <p><strong>Recipient:</strong></p>
      <p class="address">0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6</p>
    </div>
  </div>
</body>
</html>
`;

// Route for the dashboard
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Health check
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('OK');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ultra Minimal SWF Dashboard running on http://0.0.0.0:${PORT}`);
});