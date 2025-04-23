/**
 * Super Simple Static Server for SWF
 * 
 * This is the absolutely simplest possible Express server with no dependencies.
 */

const express = require('express');
const app = express();
const PORT = 5000;

// Serve a simple "Hello World" response
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SWF Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Sovran Wealth Fund</h1>
          <p>SWF token successfully deployed to Polygon mainnet.</p>
          <p>Contract address: 0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</p>
          <p>Total supply: 500,000 SWF</p>
          <hr>
          <p>Server time: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Super simple server running on http://0.0.0.0:${PORT}`);
});

// Keep the server alive
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions to prevent sudden crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Keep the server running despite errors
});