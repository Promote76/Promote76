// This script is used to bypass the Tailwind CSS issues
// and render a simplified version of the app
console.log("Starting basic app without Tailwind CSS...");

import('./index.js').catch(e => {
  console.error("Error loading basic app:", e);
});