/**
 * Sovran Wealth Fund (SWF) - Main Server
 * 
 * This file serves as the entry point for the SWF token project API.
 */

const { startServer } = require('./server/api');

// Define a variable to hold the server instance
let server;

// Function to handle graceful shutdown
function shutdownGracefully() {
  console.log('Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force close after 5 seconds if it doesn't close naturally
    setTimeout(() => {
      console.error('Forcing server shutdown');
      process.exit(1);
    }, 5000);
  } else {
    process.exit(0);
  }
}

// Set up signal handlers
process.on('SIGTERM', shutdownGracefully);
process.on('SIGINT', shutdownGracefully);

// Start the API server
startServer()
  .then((serverInstance) => {
    server = serverInstance;
    console.log('Server started successfully');
  })
  .catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });