/**
 * Pure Static HTML Server for SWF
 * 
 * This server only serves the static HTML file with zero API dependencies.
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Route all requests to the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
});

// Start the server with robust error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pure static server running at http://0.0.0.0:${PORT}`);
  console.log(`Serving static HTML file with no API dependencies`);
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