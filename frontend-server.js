/**
 * Simple static file server for SWF frontend
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
});