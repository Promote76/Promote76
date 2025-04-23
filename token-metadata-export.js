#!/usr/bin/env node
// Script to export SWF token metadata with SoloMethodEngine details to both JSON and HTML formats
// This can be used when IPFS uploads fail or for manual uploading to other platforms

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Create exports directory if it doesn't exist
const exportsDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir);
}

// Load the base token metadata 
let metadata;
try {
  metadata = JSON.parse(fs.readFileSync('./SovranWealthFund.token.json', 'utf8'));
} catch (error) {
  console.error('Error loading token metadata:', error.message);
  process.exit(1);
}

// Add SoloMethodEngine staking information to the metadata
const soloMethodEngineAddress = process.env.SOLO_METHOD_ENGINE_ADDRESS || "Enter your SoloMethodEngine address here";

// Update metadata with staking details
metadata.staking = {
  engine: "SoloMethodEngine",
  engineAddress: soloMethodEngineAddress,
  apr: "5%",
  minStake: "50 SWF",
  walletCount: 16,
  walletRoles: ["BUYER", "HOLDER", "STAKER", "LIQUIDITY", "TRACKER"],
  rewardPeriod: "30 days"
};

// Add staking-related attributes if they don't exist
const hasStakingAttribute = metadata.attributes.some(attr => attr.trait_type === "Staking");
if (!hasStakingAttribute) {
  metadata.attributes.push({
    trait_type: "Staking",
    value: "SoloMethodEngine (5% APR)"
  });
}

// Update timestamp
metadata.timestamp = new Date().toISOString();
metadata.lastUpdated = new Date().toISOString();

// Export to JSON file
const jsonOutputPath = path.join(exportsDir, 'SovranWealthFund-with-staking.json');
fs.writeFileSync(jsonOutputPath, JSON.stringify(metadata, null, 2));
console.log(`Token metadata exported to ${jsonOutputPath}`);

// Create HTML version for easy viewing and manual upload
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.name} (${metadata.symbol}) - Token Metadata</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #1a52bd;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    h2 {
      color: #2c67c9;
      margin-top: 30px;
    }
    .token-img {
      max-width: 150px;
      border-radius: 10px;
      display: block;
      margin: 20px 0;
      border: 1px solid #ddd;
    }
    .attributes {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin: 20px 0;
    }
    .attribute {
      background-color: #f0f4f8;
      border-radius: 5px;
      padding: 8px 12px;
      font-size: 14px;
    }
    .attribute span {
      font-weight: bold;
      color: #2c67c9;
    }
    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    .staking-info {
      background-color: #edf7ed;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 20px 0;
      border-radius: 0 5px 5px 0;
    }
    .address {
      font-family: monospace;
      background-color: #f5f5f5;
      padding: 3px 6px;
      border-radius: 3px;
      font-size: 14px;
      word-break: break-all;
    }
    .links a {
      display: inline-block;
      margin-right: 15px;
      color: #2c67c9;
      text-decoration: none;
    }
    .links a:hover {
      text-decoration: underline;
    }
    .note {
      background-color: #fff8e1;
      padding: 10px;
      border-radius: 5px;
      font-size: 14px;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      background-color: #2c67c9;
      color: white;
      padding: 8px 16px;
      border-radius: 5px;
      text-decoration: none;
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f0f4f8;
    }
  </style>
</head>
<body>
  <h1>${metadata.name} (${metadata.symbol})</h1>
  
  ${metadata.image ? `<img src="${metadata.image}" alt="${metadata.name} Logo" class="token-img">` : ''}
  
  <p>${metadata.description}</p>
  
  <h2>Token Information</h2>
  <table>
    <tr>
      <th>Name</th>
      <td>${metadata.name}</td>
    </tr>
    <tr>
      <th>Symbol</th>
      <td>${metadata.symbol}</td>
    </tr>
    <tr>
      <th>Decimals</th>
      <td>${metadata.decimals}</td>
    </tr>
    <tr>
      <th>Network</th>
      <td>${metadata.network || 'Polygon'}</td>
    </tr>
    <tr>
      <th>Contract Address</th>
      <td><span class="address">${metadata.contractAddress}</span></td>
    </tr>
  </table>
  
  <h2>Attributes</h2>
  <div class="attributes">
    ${metadata.attributes.map(attr => `
      <div class="attribute">
        <span>${attr.trait_type}:</span> ${attr.value}
      </div>
    `).join('')}
  </div>
  
  <div class="staking-info">
    <h2>Staking Information</h2>
    <p>This token supports staking through the SoloMethodEngine smart contract.</p>
    
    <table>
      <tr>
        <th>Staking Engine</th>
        <td>${metadata.staking.engine}</td>
      </tr>
      <tr>
        <th>Engine Address</th>
        <td><span class="address">${metadata.staking.engineAddress}</span></td>
      </tr>
      <tr>
        <th>Annual Reward Rate</th>
        <td>${metadata.staking.apr}</td>
      </tr>
      <tr>
        <th>Minimum Stake</th>
        <td>${metadata.staking.minStake}</td>
      </tr>
      <tr>
        <th>Reward Period</th>
        <td>${metadata.staking.rewardPeriod}</td>
      </tr>
    </table>
    
    <h3>SoloMethod 16-Wallet System</h3>
    <p>When staking, your tokens are distributed across 16 virtual wallets with 5 different roles:</p>
    <ul>
      ${metadata.staking.walletRoles.map(role => `<li><strong>${role}</strong></li>`).join('')}
    </ul>
  </div>
  
  <h2>Links</h2>
  <div class="links">
    ${metadata.links && metadata.links.etherscan ? 
      `<a href="${metadata.links.etherscan}" target="_blank">View on Polygonscan</a>` : ''}
    ${metadata.links && metadata.links.github ? 
      `<a href="${metadata.links.github}" target="_blank">GitHub Repository</a>` : ''}
    ${metadata.social && metadata.social.website ? 
      `<a href="${metadata.social.website}" target="_blank">Website</a>` : ''}
    ${metadata.social && metadata.social.twitter ? 
      `<a href="${metadata.social.twitter}" target="_blank">Twitter</a>` : ''}
  </div>
  
  <div class="note">
    <p><strong>Note:</strong> This HTML file was generated for easy viewing of token metadata. For integration with
    marketplaces or other platforms, use the JSON version.</p>
    <p>Last updated: ${new Date().toLocaleString()}</p>
  </div>
  
  <h2>Raw JSON Data</h2>
  <pre>${JSON.stringify(metadata, null, 2)}</pre>
  
  <a href="#" class="btn" onclick="copyToClipboard(); return false;">Copy JSON to Clipboard</a>
  
  <script>
    function copyToClipboard() {
      const json = ${JSON.stringify(JSON.stringify(metadata, null, 2))};
      navigator.clipboard.writeText(json).then(() => {
        alert('JSON copied to clipboard!');
      }, (err) => {
        console.error('Could not copy text: ', err);
      });
    }
  </script>
</body>
</html>
`;

// Export to HTML file
const htmlOutputPath = path.join(exportsDir, 'SovranWealthFund-with-staking.html');
fs.writeFileSync(htmlOutputPath, htmlContent);
console.log(`HTML visualization exported to ${htmlOutputPath}`);

console.log('\nExport Complete! ✅');
console.log('You can now:');
console.log('1. Upload the JSON file to IPFS manually');
console.log('2. Open the HTML file in any browser to view and share the token information');
console.log('3. Copy the JSON data directly from the HTML page using the provided button');