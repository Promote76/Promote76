// token-metadata-export.js - Simple metadata exporter for Sovran Wealth Fund token
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Load token metadata
const metadata = JSON.parse(fs.readFileSync('./SovranWealthFund.token.json', 'utf8'));

// Update timestamp to current time
metadata.timestamp = new Date().toISOString();

// Create exports directory if it doesn't exist
const exportsDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir);
}

// Export as JSON
const jsonFilePath = path.join(exportsDir, 'SovranWealthFund.token.json');
fs.writeFileSync(jsonFilePath, JSON.stringify(metadata, null, 2));

// Export as HTML for easy viewing
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.name} (${metadata.symbol}) - Token Metadata</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    .token-image {
      max-width: 200px;
      border-radius: 10px;
      display: block;
      margin: 20px 0;
    }
    .metadata-section {
      margin-bottom: 30px;
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }
    .attributes {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .attribute {
      background-color: #e9ecef;
      padding: 10px;
      border-radius: 5px;
      flex: 1 1 200px;
    }
    .attribute h4 {
      margin: 0 0 5px 0;
      color: #495057;
    }
    .attribute p {
      margin: 0;
      font-weight: bold;
    }
    .links {
      margin-top: 20px;
    }
    .links a {
      display: inline-block;
      margin-right: 15px;
      text-decoration: none;
      color: #0066cc;
    }
    .contract-address {
      font-family: monospace;
      background-color: #e9ecef;
      padding: 5px 10px;
      border-radius: 3px;
      word-break: break-all;
    }
    .timestamp {
      color: #6c757d;
      font-size: 0.9em;
      margin-top: 30px;
      text-align: right;
    }
  </style>
</head>
<body>
  <h1>${metadata.name} (${metadata.symbol})</h1>
  
  <div class="metadata-section">
    <img src="${metadata.image}" alt="${metadata.name} Logo" class="token-image">
    <p>${metadata.description}</p>
    <p><strong>Decimals:</strong> ${metadata.decimals}</p>
    <p><strong>Network:</strong> ${metadata.network}</p>
    <p><strong>Contract Address:</strong> <span class="contract-address">${metadata.contractAddress}</span></p>
  </div>
  
  <div class="metadata-section">
    <h2>Attributes</h2>
    <div class="attributes">
      ${metadata.attributes.map(attr => `
        <div class="attribute">
          <h4>${attr.trait_type}</h4>
          <p>${attr.value}</p>
        </div>
      `).join('')}
    </div>
  </div>
  
  <div class="metadata-section">
    <h2>Links</h2>
    <div class="links">
      ${metadata.links.etherscan ? `<a href="${metadata.links.etherscan}" target="_blank">View on Polygonscan</a>` : ''}
      ${metadata.links.github ? `<a href="${metadata.links.github}" target="_blank">GitHub Repository</a>` : ''}
    </div>
  </div>
  
  ${metadata.social && Object.values(metadata.social).some(v => v) ? `
  <div class="metadata-section">
    <h2>Social</h2>
    <div class="links">
      ${metadata.social.website ? `<a href="${metadata.social.website}" target="_blank">Website</a>` : ''}
      ${metadata.social.twitter ? `<a href="${metadata.social.twitter}" target="_blank">Twitter</a>` : ''}
      ${metadata.social.telegram ? `<a href="${metadata.social.telegram}" target="_blank">Telegram</a>` : ''}
      ${metadata.social.discord ? `<a href="${metadata.social.discord}" target="_blank">Discord</a>` : ''}
    </div>
  </div>
  ` : ''}
  
  <p class="timestamp">Last Updated: ${metadata.timestamp}</p>
</body>
</html>
`;

const htmlFilePath = path.join(exportsDir, 'SovranWealthFund.token.html');
fs.writeFileSync(htmlFilePath, htmlContent);

// Create a manual upload guide
const uploadGuideContent = `# Sovran Wealth Fund Token Metadata Upload Guide

This guide helps you manually upload your token metadata to decentralized storage systems like IPFS.

## Files Ready for Upload

The following files have been prepared in the 'exports' directory:

1. \`SovranWealthFund.token.json\` - The token metadata in JSON format
2. \`SovranWealthFund.token.html\` - A HTML representation of the token metadata for easy viewing

## Manual Upload Options

### Option 1: Pinata (Recommended)

1. Go to [Pinata](https://www.pinata.cloud/) and create a free account
2. Click "Upload" and select the \`SovranWealthFund.token.json\` file from the 'exports' directory
3. Once uploaded, you'll receive a CID (Content Identifier)
4. Your metadata will be accessible at:
   - IPFS URI: ipfs://{CID}
   - Gateway URL: https://gateway.pinata.cloud/ipfs/{CID}

### Option 2: NFT.Storage Web Interface

1. Go to [NFT.Storage](https://nft.storage/) and create an account
2. Use the web interface to upload the \`SovranWealthFund.token.json\` file
3. Once uploaded, you'll receive a CID
4. Your metadata will be accessible at:
   - IPFS URI: ipfs://{CID}
   - Gateway URL: https://{CID}.ipfs.nftstorage.link

### Option 3: Web3.Storage Web Interface

1. Go to [Web3.Storage](https://web3.storage/) and create an account
2. Use the web interface to upload the \`SovranWealthFund.token.json\` file
3. Once uploaded, you'll receive a CID
4. Your metadata will be accessible at:
   - IPFS URI: ipfs://{CID}
   - Gateway URL: https://{CID}.ipfs.dweb.link

## After Uploading

After successfully uploading the file, you should:

1. Save the CID and IPFS URI for future reference
2. Test accessing the file through a public gateway to ensure it's properly uploaded
3. Consider submitting the CID to additional IPFS pinning services for redundancy

Remember that IPFS is content-addressed, so the same file will always have the same CID regardless of where it's uploaded.
`;

const uploadGuidePath = path.join(exportsDir, 'UPLOAD_GUIDE.md');
fs.writeFileSync(uploadGuidePath, uploadGuideContent);

// Print output
console.log('✅ Token metadata exported successfully!');
console.log(`JSON file: ${jsonFilePath}`);
console.log(`HTML file: ${htmlFilePath}`);
console.log(`Upload guide: ${uploadGuidePath}`);
console.log('\nFollow the instructions in the upload guide to manually upload to IPFS.');