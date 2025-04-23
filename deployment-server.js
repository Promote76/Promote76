/**
 * SWF Deployment Server
 * 
 * A dedicated server file for Replit deployment with no dependencies on other services.
 * This server directly serves the pure-dashboard.html file.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve the pure-dashboard.html file at the root route
app.get('/', (req, res) => {
  try {
    const dashboardPath = path.join(__dirname, 'pure-dashboard.html');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    res.send(dashboardContent);
    console.log('Successfully served pure-dashboard.html');
  } catch (error) {
    console.error('Error serving dashboard:', error);
    res.status(500).send(`
      <h1>SWF Dashboard Error</h1>
      <p>Could not load the dashboard. Please try again later.</p>
      <p>Error: ${error.message}</p>
    `);
  }
});

// Health check endpoint for Replit deployment
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SWF Deployment server running on http://0.0.0.0:${PORT}`);
});