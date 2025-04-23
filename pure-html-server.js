/**
 * Pure HTML Server for SWF
 * 
 * This server serves a completely static HTML file with no JavaScript at all.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Path to the static HTML file
const HTML_FILE_PATH = path.join(__dirname, 'pure-dashboard.html');

// Serve the static HTML file
app.get('/', (req, res) => {
  fs.readFile(HTML_FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      return res.status(500).send('Error loading dashboard');
    }
    res.set('Content-Type', 'text/html');
    res.send(data);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('OK');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pure HTML server running at http://0.0.0.0:${PORT}`);
  console.log(`Serving static HTML file from ${HTML_FILE_PATH}`);
});