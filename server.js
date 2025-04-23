/**
 * Sovran Wealth Fund (SWF) - Main Server
 * 
 * This file serves as the entry point for the SWF token project API.
 * It provides a proxy to the Hardhat node and serves the frontend.
 * 
 * Using the simplest possible implementation with node-fetch v2.
 */

const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

// Create Express app
const app = express();
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Constants
const HARDHAT_RPC_URL = 'http://localhost:8545';
const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('OK');
});

// RPC proxy endpoint
app.post('/rpc', async (req, res) => {
  try {
    const response = await fetch(HARDHAT_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ 
      error: 'Proxy failed', 
      details: error.message 
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SWF Server running on http://0.0.0.0:${PORT}`);
});