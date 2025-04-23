// updated-token-upload.js - Using the new Web3.Storage API
require('dotenv').config();
const { createClient } = require('@web3-storage/w3up-client');
const fs = require('fs');

// Load token metadata
const metadata = JSON.parse(fs.readFileSync('./SovranWealthFund.token.json', 'utf8'));

async function uploadTokenMetadata() {
  try {
    console.log('Preparing to upload with new Web3.Storage API...');
    
    // Create a client using the authentication token from environment
    const client = await createClient();
    
    // Create a buffer from the metadata
    const buffer = Buffer.from(JSON.stringify(metadata, null, 2));
    const blob = new Blob([buffer], { type: 'application/json' });
    
    console.log('Uploading token metadata to IPFS...');
    
    // Upload the file to w3up
    const uploadResult = await client.uploadFile(blob);
    const cid = uploadResult.cid;
    
    console.log('Upload complete!');
    console.log('Content ID (CID):', cid);
    console.log('URL:', `https://${cid}.ipfs.w3s.link/SovranWealthFund.token.json`);
    
    // Save the CID information
    const cidInfo = {
      cid: cid.toString(),
      url: `https://${cid}.ipfs.w3s.link/SovranWealthFund.token.json`,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('token-cid.json', JSON.stringify(cidInfo, null, 2));
    console.log('CID saved to token-cid.json');
    
    return cid;
  } catch (error) {
    console.error('Error uploading file:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

// Execute the upload
uploadTokenMetadata()
  .then(() => console.log('Done!'))
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });