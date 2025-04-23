/**
 * SWF Minimal Server
 * 
 * Absolutely minimal server with no dependencies except Express
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <html>
      <head>
        <title>SWF Token</title>
        <style>
          body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: navy; }
        </style>
      </head>
      <body>
        <h1>Sovran Wealth Fund</h1>
        <p>Token Address: 0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</p>
        <p>Network: Polygon Mainnet</p>
        <p>Total Supply: 500,000 SWF</p>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.end('OK');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SWF Minimal Server running on http://0.0.0.0:${PORT}`);
});