// direct-ipfs-upload.js - Directly upload token metadata to IPFS services
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Load token metadata
const metadata = JSON.parse(fs.readFileSync('./SovranWealthFund.token.json', 'utf8'));

// Updated timestamp
metadata.timestamp = new Date().toISOString();

// Save updated metadata
fs.writeFileSync('./SovranWealthFund.token.json', JSON.stringify(metadata, null, 2));

async function uploadViaNFTStorage() {
  try {
    if (!process.env.NFT_STORAGE_API_KEY) {
      console.log('⚠️ NFT_STORAGE_API_KEY not found in environment variables');
      return null;
    }
    
    console.log('Uploading to NFT.Storage...');
    
    const response = await axios.post(
      'https://api.nft.storage/upload',
      fs.readFileSync('./SovranWealthFund.token.json'),
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NFT_STORAGE_API_KEY}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    if (response.data && response.data.ok && response.data.value && response.data.value.cid) {
      const cid = response.data.value.cid;
      
      console.log('\n✅ NFT.Storage upload successful!');
      console.log('----------------------------------------');
      console.log(`IPFS CID: ${cid}`);
      console.log(`Gateway URL: https://${cid}.ipfs.nftstorage.link`);
      console.log(`Direct access: https://nftstorage.link/ipfs/${cid}`);
      console.log('----------------------------------------\n');
      
      return {
        service: 'NFT.Storage',
        cid: cid,
        urls: {
          ipfs: `ipfs://${cid}`,
          gateway: `https://${cid}.ipfs.nftstorage.link`,
          direct: `https://nftstorage.link/ipfs/${cid}`
        }
      };
    } else {
      console.log('❌ Failed to get a valid response from NFT.Storage');
      return null;
    }
  } catch (error) {
    console.error('❌ NFT.Storage upload error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return null;
  }
}

async function uploadViaWeb3Storage() {
  try {
    if (!process.env.WEB3_STORAGE_API_TOKEN) {
      console.log('⚠️ WEB3_STORAGE_API_TOKEN not found in environment variables');
      return null;
    }
    
    console.log('Uploading to Web3.Storage...');
    
    // Use the Web3.Storage client instead
    console.log('⚠️ Web3.Storage direct API upload is currently disabled in this script');
    console.log('   Use simple-web3-upload.js to upload via the Web3.Storage client instead');
    return null;
  } catch (error) {
    console.error('❌ Web3.Storage upload error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return null;
  }
}

async function main() {
  console.log(`Uploading token metadata for ${metadata.name} (${metadata.symbol})...`);
  console.log(`Contract Address: ${metadata.contractAddress}`);
  
  // Try both upload methods and collect results
  const results = {
    timestamp: new Date().toISOString(),
    uploads: {}
  };
  
  const nftStorageResult = await uploadViaNFTStorage();
  if (nftStorageResult) {
    results.uploads.nftStorage = nftStorageResult;
  }
  
  /* Commenting out Web3.Storage for now as it's slow and timing out
  const web3StorageResult = await uploadViaWeb3Storage();
  if (web3StorageResult) {
    results.uploads.web3Storage = web3StorageResult;
  }
  */
  
  // Save the results
  const hasResults = Object.keys(results.uploads).length > 0;
  if (hasResults) {
    fs.writeFileSync('token-metadata-location.json', JSON.stringify(results, null, 2));
    console.log('Upload results saved to token-metadata-location.json');
  } else {
    console.log('⚠️ All upload attempts failed. Check the errors above.');
  }
}

// Execute the upload
main()
  .then(() => console.log('Metadata upload process complete.'))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });