/**
 * Pure Static Server for SWF
 * 
 * This server directly serves a completely static HTML file with
 * no dependencies or external calls.
 */

const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 5000;

// Helper function to read the HTML file content once on startup
let htmlContent;
try {
  htmlContent = fs.readFileSync('./pure-static.html', 'utf8');
  console.log('Successfully loaded pure-static.html');
} catch (err) {
  console.error('Error loading static HTML file:', err.message);
  htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Error Loading Content</title>
    </head>
    <body>
      <h1>Error: Could not load static content</h1>
      <p>${err.message}</p>
    </body>
    </html>
  `;
}

// Root route - serve the static HTML content directly
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(htmlContent);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('OK');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pure Static Server running on http://0.0.0.0:${PORT}`);
});