/**
 * SWF Static HTML Server
 * 
 * This server simply serves static files from the html directory
 * with no API calls, no JSON parsing, and minimal code.
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the html directory
app.use(express.static(path.join(__dirname, 'html')));

// Root route - serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('OK');
});

// API endpoint for testing
app.get('/api/data', (req, res) => {
  // Send a simple valid JSON response
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({
    success: true,
    message: "API endpoint working correctly",
    timestamp: new Date().toISOString(),
    data: {
      tokenName: "Sovran Wealth Fund",
      symbol: "SWF",
      supply: 500000,
      network: "Polygon Mainnet"
    }
  }));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SWF Static HTML Server running on http://0.0.0.0:${PORT}`);
});