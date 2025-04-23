/**
 * Static Dashboard Generator for SWF
 * 
 * This script generates a static HTML dashboard by pre-fetching data from the API
 * and embedding it directly in the HTML. This approach eliminates JavaScript errors
 * in the browser.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();
const PORT = 5000;

// API base URL
const API_BASE_URL = 'http://0.0.0.0:5001/api';

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

// Generate static dashboard HTML
async function generateDashboard() {
  try {
    console.log('Generating static dashboard...');
    
    // Fetch data from API
    let vaults = [];
    let roles = [];
    let transactions = [];
    let apiStatus = 'Disconnected';
    
    try {
      console.log('Fetching API health...');
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      if (healthResponse.data.status === 'OK') {
        apiStatus = 'Connected';
        
        // Fetch vaults
        console.log('Fetching vaults...');
        const vaultsResponse = await axios.get(`${API_BASE_URL}/vaults`);
        vaults = vaultsResponse.data;
        
        // Fetch roles
        console.log('Fetching roles...');
        const rolesResponse = await axios.get(`${API_BASE_URL}/roles`);
        roles = rolesResponse.data;
        
        // Fetch transactions for a known address
        console.log('Fetching transactions...');
        const txResponse = await axios.get(`${API_BASE_URL}/transactions/address/0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6`);
        transactions = txResponse.data;
      }
    } catch (error) {
      console.error('Error fetching data from API:', error.message);
    }
    
    // Generate unique roles (keeping only highest ID for each role name)
    const uniqueRoles = {};
    if (roles.length > 0) {
      roles.forEach(role => {
        const key = role.role_name;
        if (!uniqueRoles[key] || uniqueRoles[key].id < role.id) {
          uniqueRoles[key] = role;
        }
      });
    }
    
    // Generate vaults HTML
    let vaultsHTML = '';
    if (vaults.length > 0) {
      vaults.forEach(vault => {
        vaultsHTML += `
          <div class="card">
            <h3>${vault.name}</h3>
            <div class="info-grid">
              <div class="info-label">Current APR:</div>
              <div class="info-value">${vault.current_apr}%</div>
              
              <div class="info-label">Min/Max APR:</div>
              <div class="info-value">${vault.min_apr}% - ${vault.max_apr}%</div>
              
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
    if (Object.keys(uniqueRoles).length > 0) {
      Object.values(uniqueRoles).forEach(role => {
        rolesHTML += `
          <div class="role-item">
            <div class="role-info">
              <h3>${role.role_name}</h3>
              <p>${role.description || 'No description'}</p>
            </div>
            <div class="role-allocation">
              <div class="allocation-percentage">${role.allocation_percentage}%</div>
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
    if (transactions.length > 0) {
      transactions.forEach(tx => {
        transactionsHTML += `
          <div class="transaction-item">
            <div class="transaction-header">
              <span class="transaction-type ${tx.transaction_type}">${tx.transaction_type}</span>
              <span class="transaction-status ${tx.status}">${tx.status}</span>
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
  <title>SWF Static Dashboard</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #f8f9fa;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .api-status {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
    }
    .api-status.connected {
      background-color: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    .api-status.disconnected {
      background-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }
    .card {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
      color: #f8f9fa;
    }
    h1 {
      font-size: 2.2rem;
    }
    h2 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .info-label {
      color: #9ca3af;
      font-size: 0.9rem;
    }
    .info-value {
      color: #f8f9fa;
      font-weight: bold;
    }
    .role-item {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      margin-bottom: 10px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }
    .role-allocation {
      text-align: right;
    }
    .allocation-percentage {
      font-size: 1.2rem;
      font-weight: bold;
      color: #60a5fa;
    }
    .wallet-address {
      color: #9ca3af;
      font-size: 0.9rem;
      margin-top: 5px;
    }
    .transaction-item {
      padding: 15px;
      margin-bottom: 10px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
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
      background-color: rgba(79, 70, 229, 0.2);
      color: #818cf8;
    }
    .transaction-type.mint {
      background-color: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    .transaction-status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .transaction-status.confirmed {
      background-color: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }
    .transaction-status.pending {
      background-color: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
    .transaction-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .transaction-hash {
      font-family: monospace;
      color: #d1d5db;
    }
    .transaction-amount {
      font-weight: bold;
      color: #60a5fa;
    }
    .transaction-addresses {
      display: flex;
      justify-content: space-between;
      color: #9ca3af;
      font-size: 0.9rem;
      margin-bottom: 10px;
    }
    .transaction-date {
      text-align: right;
      color: #9ca3af;
      font-size: 0.8rem;
    }
    .token-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 30px;
      margin-bottom: 30px;
      background-color: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      text-align: center;
    }
    .token-address {
      font-family: monospace;
      background-color: rgba(0, 0, 0, 0.2);
      padding: 8px 16px;
      border-radius: 4px;
      margin: 10px 0;
    }
    .token-supply {
      font-size: 2.5rem;
      font-weight: bold;
      color: #60a5fa;
      margin: 10px 0;
    }
    .token-network {
      background-color: rgba(79, 70, 229, 0.2);
      color: #818cf8;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.9rem;
      font-weight: bold;
    }
    footer {
      margin-top: 50px;
      text-align: center;
      color: #9ca3af;
      font-size: 0.9rem;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
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
    </footer>
  </div>
</body>
</html>`;
    
    // Write the HTML to a file
    fs.writeFileSync(path.join(__dirname, 'frontend/public/static-dashboard.html'), html);
    console.log('Static dashboard generated successfully');
    return true;
  } catch (error) {
    console.error('Error generating dashboard:', error);
    return false;
  }
}

// Generate dashboard on server start
generateDashboard().then(success => {
  if (success) {
    console.log('Dashboard is ready to be served');
  } else {
    console.error('Failed to generate dashboard');
  }
});

// Set up the Express server
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
});