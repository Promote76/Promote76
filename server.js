/**
 * Sovran Wealth Fund (SWF) - Main Server
 * 
 * This file serves as the entry point for the SWF token project API.
 * It provides a proxy to the Hardhat node and serves the frontend.
 * 
 * This version uses a minimal Express approach to avoid path-to-regexp issues.
 */

const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Constants
const HARDHAT_RPC = 'http://localhost:8545';
const PORT = process.env.PORT || 5000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('OK');
});

// RPC proxy endpoint
app.post('/rpc', (req, res) => {
  const requestData = JSON.stringify(req.body);
  
  // Configure the request options for the Hardhat node
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
  
  // Create the request to the Hardhat node
  const request = http.request(options, (response) => {
    let data = '';
    
    // Collect the response data
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    // Process the complete response
    response.on('end', () => {
      try {
        // Try to parse the JSON response
        const jsonResponse = JSON.parse(data);
        res.json(jsonResponse);
      } catch (error) {
        console.error('Error parsing JSON response:', error.message);
        console.error('Raw response:', data);
        res.status(500).json({ 
          error: 'Failed to parse JSON response', 
          details: error.message,
          raw: data 
        });
      }
    });
  });
  
  // Handle request errors
  request.on('error', (error) => {
    console.error('Request error:', error.message);
    res.status(500).json({ 
      error: 'RPC request failed', 
      details: error.message 
    });
  });
  
  // Send the request data
  request.write(requestData);
  request.end();
});

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simplified fallback - send index.html for any other request
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SWF Server running on http://0.0.0.0:${PORT}`);
});