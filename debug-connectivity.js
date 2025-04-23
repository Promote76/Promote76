/**
 * SWF Connectivity Debug Script
 * 
 * This script tests connections to both blockchain RPCs and local servers
 * to help diagnose connectivity issues.
 */

const fetch = require("node-fetch");

// Test endpoints
const polygonRPC = "https://polygon-rpc.com"; // Public Polygon RPC
const hardhatRPC = "http://localhost:8545"; // Local Hardhat node
const localAPI = "http://localhost:5001"; // Local API server
const deploymentServer = "http://localhost:5000"; // Deployment server

async function testRPC(name, url) {
  console.log(`Testing ${name} connection...`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
    });

    const text = await res.text();
    console.log(`Raw response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
    
    try {
      const data = JSON.parse(text);
      if (data.result) {
        console.log(`✅ ${name} is working: Latest Block =`, parseInt(data.result, 16));
      } else {
        console.log(`❌ ${name} returned invalid response:`, data);
      }
    } catch (parseErr) {
      console.log(`❌ ${name} returned non-JSON response:`, parseErr.message);
    }
  } catch (err) {
    console.log(`❌ ${name} connection failed:`, err.message);
  }
}

async function testServer(name, url, endpoint = '') {
  console.log(`Testing ${name} connection...`);
  try {
    const fullUrl = `${url}${endpoint}`;
    console.log(`Requesting: ${fullUrl}`);
    
    const res = await fetch(fullUrl);
    const contentType = res.headers.get('content-type');
    console.log(`Content-Type: ${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const text = await res.text();
        console.log(`Raw response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        
        const data = JSON.parse(text);
        console.log(`✅ ${name} returned valid JSON:`, typeof data === 'object' ? 'Object' : data);
      } catch (parseErr) {
        console.log(`❌ ${name} returned invalid JSON:`, parseErr.message);
      }
    } else {
      const text = await res.text();
      console.log(`✅ ${name} responded with text (first 100 chars):`);
      console.log(text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    }
  } catch (err) {
    console.log(`❌ ${name} connection failed:`, err.message);
  }
}

async function runTests() {
  console.log("=== SWF Connectivity Diagnostics ===");
  console.log("Testing at:", new Date().toISOString());
  console.log("===================================");
  
  // Test RPC endpoints
  await testRPC("Polygon RPC", polygonRPC);
  console.log("-----------------------------------");
  await testRPC("Local Hardhat Node", hardhatRPC);
  console.log("-----------------------------------");
  
  // Test server endpoints
  await testServer("SWF API Server", localAPI, "/health");
  console.log("-----------------------------------");
  await testServer("Deployment Server", deploymentServer);
  console.log("-----------------------------------");
  await testServer("Deployment Server Health", deploymentServer, "/health");
  
  console.log("===================================");
  console.log("Diagnostics complete");
}

runTests();