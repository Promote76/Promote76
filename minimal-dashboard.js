/**
 * Minimal Dashboard Server for SWF
 * 
 * This is the absolute minimum Express server that serves a 
 * fully static HTML string with no API dependencies or dynamic content.
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Root endpoint with static content
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SWF Minimal Dashboard</title>
      <style>
        body {
          font-family: sans-serif;
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
        h1 {
          color: #2563eb;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
        }
        .banner {
          background: #fef3c7;
          padding: 10px;
          text-align: center;
          border-radius: 5px;
          margin-bottom: 20px;
          border: 1px solid #fbbf24;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Sovran Wealth Fund</h1>
        
        <div class="banner">
          This is a minimal dashboard with no JavaScript or API dependencies
        </div>
        
        <p>SWF Token successfully deployed to Polygon Mainnet.</p>
        <p>Token Contract: 0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</p>
        <p>Total Supply: 500,000 SWF</p>
        
        <p>SWF project system health: ✅ Operational</p>
      </div>
    </body>
    </html>
  `);
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    time: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal SWF dashboard running on http://0.0.0.0:${PORT}`);
});