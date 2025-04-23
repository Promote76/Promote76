/**
 * Final Solution Server for SWF
 * 
 * This server uses a simplified approach with no Express.js
 * to eliminate any middleware or framework-related issues.
 */

const http = require('http');
const fs = require('fs');

// Read the static HTML content
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

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0]; // Remove any query parameters
  
  if (url === '/' || url === '/index.html') {
    // Serve the main HTML
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  } else if (url === '/health') {
    // Simple health check endpoint
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    // Handle 404
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Page Not Found</h1>');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Pure HTTP Server running on http://0.0.0.0:${PORT}`);
});