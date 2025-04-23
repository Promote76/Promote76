/**
 * Robust Dashboard for SWF
 * 
 * This dashboard implements proper error handling for API responses
 * and includes safety checks before parsing JSON.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = 5000;

// API base URL for server-side requests
const API_SERVER_URL = 'http://0.0.0.0:5001/api';

// Create frontend/public directory if it doesn't exist
const publicDir = path.join(__dirname, 'frontend/public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Helper function to truncate addresses
function truncateAddress(address) {
  if (!address) return 'N/A';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper function to format wei values
function formatWei(wei) {
  try {
    if (!wei) return '0';
    // Convert to ether (divide by 10^18)
    const ether = BigInt(wei) / BigInt(10 ** 18);
    return ether.toLocaleString();
  } catch (error) {
    console.error('Error formatting wei:', error);
    return '0';
  }
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Safe API request function with proper error handling
async function safeApiRequest(endpoint) {
  try {
    console.log(`Fetching ${endpoint}...`);
    const response = await axios.get(`${API_SERVER_URL}/${endpoint}`);
    
    // Verify we got a proper response with data
    if (response.status !== 200) {
      console.warn(`Non-200 status code (${response.status}) for ${endpoint}`);
      return [];
    }
    
    // Check if response data exists and is valid
    if (!response.data) {
      console.warn(`Empty response data for ${endpoint}`);
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    // Return empty array as fallback
    return [];
  }
}

// Generate static dashboard HTML
async function generateDashboard() {
  try {
    console.log('Generating robust dashboard...');
    
    // Check API health
    let apiStatus = 'Disconnected';
    try {
      const healthData = await safeApiRequest('health');
      if (healthData && healthData.status === 'OK') {
        apiStatus = 'Connected';
      }
    } catch (error) {
      console.error('Health check failed:', error.message);
    }
    
    // Fetch data from API with safe error handling
    const vaults = await safeApiRequest('vaults');
    const roles = await safeApiRequest('roles');
    const transactions = await safeApiRequest('transactions/address/0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6');
    
    // Generate unique roles (keeping only highest ID for each role name)
    const uniqueRoles = {};
    if (roles && roles.length > 0) {
      roles.forEach(role => {
        const key = role.role_name;
        if (!uniqueRoles[key] || uniqueRoles[key].id < role.id) {
          uniqueRoles[key] = role;
        }
      });
    }
    
    // Generate vaults HTML
    let vaultsHTML = '';
    if (vaults && vaults.length > 0) {
      vaults.forEach(vault => {
        vaultsHTML += `
          <div class="card">
            <h3>${vault.name || 'Unknown Vault'}</h3>
            <div class="info-grid">
              <div class="info-label">Current APR:</div>
              <div class="info-value">${vault.current_apr || 0}%</div>
              
              <div class="info-label">Min/Max APR:</div>
              <div class="info-value">${vault.min_apr || 0}% - ${vault.max_apr || 0}%</div>
              
              <div class="info-label">Total Deposit:</div>
              <div class="info-value">${formatWei(vault.total_deposit)} SWF</div>
              
              <div class="info-label">Last Updated:</div>
              <div class="info-value">${formatDate(vault.last_updated)}</div>
            </div>
          </div>
        `;
      });
    } else {
      vaultsHTML = '<div class="card"><p>No vaults found or API connection error.</p></div>';
    }
    
    // Generate roles HTML
    let rolesHTML = '';
    if (uniqueRoles && Object.keys(uniqueRoles).length > 0) {
      Object.values(uniqueRoles).forEach(role => {
        rolesHTML += `
          <div class="role-item">
            <div class="role-info">
              <h3>${role.role_name || 'Unknown Role'}</h3>
              <p>${role.description || 'No description'}</p>
            </div>
            <div class="role-allocation">
              <div class="allocation-percentage">${role.allocation_percentage || 0}%</div>
              <div class="wallet-address" title="${role.wallet_address || ''}">${truncateAddress(role.wallet_address)}</div>
            </div>
          </div>
        `;
      });
    } else {
      rolesHTML = '<p>No role allocations found or API connection error.</p>';
    }
    
    // Generate transactions HTML
    let transactionsHTML = '';
    if (transactions && transactions.length > 0) {
      transactions.forEach(tx => {
        transactionsHTML += `
          <div class="transaction-item">
            <div class="transaction-header">
              <span class="transaction-type ${tx.transaction_type || 'unknown'}">${tx.transaction_type || 'unknown'}</span>
              <span class="transaction-status ${tx.status || 'unknown'}">${tx.status || 'unknown'}</span>
            </div>
            <div class="transaction-details">
              <div class="transaction-hash" title="${tx.tx_hash || ''}">${truncateAddress(tx.tx_hash)}</div>
              <div class="transaction-amount">${formatWei(tx.amount)} SWF</div>
            </div>
            <div class="transaction-addresses">
              <div>From: <span title="${tx.from_address || ''}">${truncateAddress(tx.from_address)}</span></div>
              <div>To: <span title="${tx.to_address || ''}">${truncateAddress(tx.to_address)}</span></div>
            </div>
            <div class="transaction-date">${formatDate(tx.timestamp)}</div>
          </div>
        `;
      });
    } else {
      transactionsHTML = '<p>No transactions found or API connection error.</p>';
    }
    
    // Generate complete HTML
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWF Robust Dashboard</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f7fa;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    .api-status {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
    }
    .api-status.connected {
      background-color: #d1fae5;
      color: #059669;
    }
    .api-status.disconnected {
      background-color: #fee2e2;
      color: #ef4444;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border: 1px solid #eee;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .section {
      margin-bottom: 40px;
    }
    h1, h2, h3 {
      margin-top: 0;
      color: #1e3a8a;
    }
    h1 {
      font-size: 2.2rem;
    }
    h2 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .info-label {
      color: #6b7280;
      font-size: 0.9rem;
    }
    .info-value {
      color: #111827;
      font-weight: bold;
    }
    .role-item {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      margin-bottom: 10px;
      background-color: white;
      border-radius: 8px;
      border: 1px solid #eee;
    }
    .role-allocation {
      text-align: right;
    }
    .allocation-percentage {
      font-size: 1.2rem;
      font-weight: bold;
      color: #2563eb;
    }
    .wallet-address {
      color: #6b7280;
      font-size: 0.9rem;
      margin-top: 5px;
    }
    .transaction-item {
      padding: 15px;
      margin-bottom: 10px;
      background-color: white;
      border-radius: 8px;
      border: 1px solid #eee;
    }
    .transaction-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .transaction-type {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      background-color: #e0e7ff;
      color: #4f46e5;
    }
    .transaction-type.mint {
      background-color: #d1fae5;
      color: #059669;
    }
    .transaction-status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .transaction-status.confirmed {
      background-color: #d1fae5;
      color: #059669;
    }
    .transaction-status.pending {
      background-color: #fef3c7;
      color: #d97706;
    }
    .transaction-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .transaction-hash {
      font-family: monospace;
      color: #4b5563;
    }
    .transaction-amount {
      font-weight: bold;
      color: #2563eb;
    }
    .transaction-addresses {
      display: flex;
      justify-content: space-between;
      color: #6b7280;
      font-size: 0.9rem;
      margin-bottom: 10px;
    }
    .transaction-date {
      text-align: right;
      color: #6b7280;
      font-size: 0.8rem;
    }
    .token-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 30px;
      margin-bottom: 30px;
      background-color: #f8fafc;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .token-address {
      font-family: monospace;
      background-color: #f1f5f9;
      padding: 8px 16px;
      border-radius: 4px;
      margin: 10px 0;
      border: 1px solid #e2e8f0;
    }
    .token-supply {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2563eb;
      margin: 10px 0;
    }
    .token-network {
      background-color: #e0e7ff;
      color: #4f46e5;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: bold;
    }
    footer {
      margin-top: 50px;
      text-align: center;
      color: #6b7280;
      font-size: 0.9rem;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .notice {
      background-color: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Sovran Wealth Fund</h1>
      <div class="api-status ${apiStatus.toLowerCase()}">${apiStatus}</div>
    </header>
    
    <div class="token-info">
      <h2>SWF Token</h2>
      <div class="token-address">0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</div>
      <div class="token-supply">500,000 SWF</div>
      <div class="token-network">Polygon Mainnet</div>
    </div>
    
    <div class="section">
      <h2>Vaults</h2>
      <div class="cards-grid">
        ${vaultsHTML}
      </div>
    </div>
    
    <div class="section">
      <h2>Role Allocations</h2>
      ${rolesHTML}
    </div>
    
    <div class="section">
      <h2>Recent Transactions</h2>
      ${transactionsHTML}
    </div>
    
    <footer>
      <p>Sovran Wealth Fund &copy; 2025 - Data refreshed on: ${new Date().toLocaleString()}</p>
      <p>This dashboard implements robust error handling to prevent JSON parsing issues.</p>
    </footer>
  </div>
</body>
</html>`;
    
    // Write the HTML to a file
    fs.writeFileSync(path.join(publicDir, 'robust-dashboard.html'), html);
    console.log('Robust dashboard generated successfully');
    return true;
  } catch (error) {
    console.error('Error generating dashboard:', error);
    // Create a fallback dashboard
    createFallbackDashboard(error);
    return false;
  }
}

// Create a fallback dashboard in case of errors
function createFallbackDashboard(error) {
  try {
    console.log('Creating fallback dashboard due to error...');
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWF Dashboard - Fallback Mode</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f7fa;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h1, h2 {
      color: #1e3a8a;
    }
    .card {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border: 1px solid #eee;
    }
    .error-message {
      background-color: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 15px;
      color: #b91c1c;
      font-family: monospace;
      white-space: pre-wrap;
      overflow-x: auto;
    }
    .info-item {
      margin-bottom: 8px;
    }
    .label {
      font-weight: bold;
      color: #4b5563;
    }
    .address {
      font-family: monospace;
      background-color: #f1f5f9;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 10px 15px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 10px;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    footer {
      margin-top: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 0.9rem;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sovran Wealth Fund - Fallback Dashboard</h1>
    
    <div class="card">
      <h2>API Connection Issue</h2>
      <p>The dashboard is currently running in fallback mode due to an API connection issue. This is a static view with basic information.</p>
      <div class="error-message">${error ? error.toString() : 'Unknown error'}</div>
      <a href="/" class="button">Retry Connection</a>
    </div>
    
    <div class="card">
      <h2>Token Information</h2>
      <div class="info-item">
        <span class="label">Token Name:</span> Sovran Wealth Fund
      </div>
      <div class="info-item">
        <span class="label">Symbol:</span> SWF
      </div>
      <div class="info-item">
        <span class="label">Contract Address:</span>
        <div class="address">0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7</div>
      </div>
      <div class="info-item">
        <span class="label">Total Supply:</span> 500,000 SWF
      </div>
      <div class="info-item">
        <span class="label">Network:</span> Polygon Mainnet
      </div>
    </div>
    
    <div class="card">
      <h2>Project Status</h2>
      <ul>
        <li>Token contract successfully deployed to Polygon mainnet</li>
        <li>500,000 SWF tokens minted to recipient wallet</li>
        <li>Dynamic APR system configured (range: 10-30%)</li>
        <li>16 virtual wallets per user with 5 different role types</li>
        <li>Minting transaction: 0x0ac75e83b1ddb5261c96d6bf73deded44fe069b96bfec13a0a34ea1c84fcbf73</li>
      </ul>
    </div>
    
    <footer>
      <p>Sovran Wealth Fund &copy; 2025 - Fallback dashboard generated on: ${new Date().toLocaleString()}</p>
      <p>Please check API connection and try again later.</p>
    </footer>
  </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(publicDir, 'fallback-dashboard.html'), html);
    console.log('Fallback dashboard created successfully');
  } catch (fallbackError) {
    console.error('Error creating fallback dashboard:', fallbackError);
  }
}

// Routes
app.get('/', async (req, res) => {
  try {
    // Generate a fresh dashboard
    const success = await generateDashboard();
    
    // Redirect to the appropriate dashboard
    if (success) {
      res.redirect('/robust-dashboard.html');
    } else {
      res.redirect('/fallback-dashboard.html');
    }
  } catch (error) {
    console.error('Error handling root route:', error);
    res.status(500).send('Server error - please try again later');
  }
});

// Simple API status endpoint that doesn't depend on the main API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    dashboard: 'Robust SWF Dashboard',
    timestamp: new Date().toISOString()
  });
});

// Set up static file serving
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Robust dashboard server running on http://0.0.0.0:${PORT}`);
  
  // Generate the initial dashboard on startup
  generateDashboard()
    .then(success => {
      if (success) {
        console.log('Initial dashboard generated successfully');
      } else {
        console.log('Using fallback dashboard due to generation errors');
      }
    })
    .catch(err => {
      console.error('Error during initial dashboard generation:', err);
    });
});