// simple-web3-upload.js - Upload SWF token metadata to Web3.Storage
require('dotenv').config();
const { Web3Storage, File } = require('web3.storage');
const fs = require('fs');

// Load token metadata
const metadata = JSON.parse(fs.readFileSync('./SovranWealthFund.token.json', 'utf8'));

function makeFileObject() {
  // Convert the metadata object to a JSON string
  const metadataString = JSON.stringify(metadata, null, 2);
  
  // Create a File object from the metadata
  return new File([metadataString], 'SovranWealthFund.token.json', { type: 'application/json' });
}

async function storeMetadata() {
  try {
    // Check if we have the API key
    if (!process.env.WEB3_STORAGE_API_TOKEN) {
      throw new Error('WEB3_STORAGE_API_TOKEN not found in environment variables');
    }
    
    // Create a Web3Storage client
    console.log('Creating Web3Storage client...');
    const client = new Web3Storage({ token: process.env.WEB3_STORAGE_API_TOKEN });
    
    // Create the File object
    const tokenFile = makeFileObject();
    
    // Display upload information
    console.log(`Uploading token metadata for ${metadata.name} (${metadata.symbol}) to Web3.Storage...`);
    console.log(`Contract Address: ${metadata.contractAddress}`);
    
    // Upload the file
    console.log('Starting upload... (this may take a minute)');
    const cid = await client.put([tokenFile], {
      name: 'SovranWealthFund Token Metadata',
      wrapWithDirectory: false
    });
    
    console.log('\n✅ Upload successful!');
    console.log('----------------------------------------');
    console.log(`IPFS CID: ${cid}`);
    console.log(`Gateway URL: https://${cid}.ipfs.dweb.link`);
    console.log(`Gateway URL: https://w3s.link/ipfs/${cid}`);
    console.log('----------------------------------------\n');
    
    // Save the CID information to a file
    const cidInfo = {
      service: 'Web3.Storage',
      cid: cid,
      urls: {
        ipfs: `ipfs://${cid}`,
        gateway1: `https://${cid}.ipfs.dweb.link`,
        gateway2: `https://w3s.link/ipfs/${cid}`
      },
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('token-metadata-location.json', JSON.stringify(cidInfo, null, 2));
    console.log('CID information saved to token-metadata-location.json');
    
    return cid;
  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Execute the upload
storeMetadata()
  .then(() => console.log('Metadata upload process complete.'))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });