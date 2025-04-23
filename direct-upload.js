require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Read the token metadata file
const metadata = JSON.parse(fs.readFileSync('./SovranWealthFund.token.json', 'utf8'));

// Function to directly upload to NFT.Storage API
async function uploadToNftStorage() {
  try {
    console.log('Preparing metadata for upload...');
    
    // Create the FormData equivalent for direct upload
    const fileData = Buffer.from(JSON.stringify(metadata, null, 2));
    
    console.log('Uploading to NFT.Storage...');
    const response = await axios.post('https://api.nft.storage/upload', fileData, {
      headers: {
        'Authorization': `Bearer ${process.env.WEB3_STORAGE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      const result = response.data;
      console.log('✅ Upload successful!');
      console.log('CID:', result.value.cid);
      console.log('Status:', result.ok ? 'Success' : 'Failed');
      
      // URLs to access the metadata
      const ipfsUrl = `https://${result.value.cid}.ipfs.nftstorage.link/`;
      console.log('IPFS URL:', ipfsUrl);
      
      // Save CID info to file
      const cidInfo = {
        cid: result.value.cid,
        timestamp: new Date().toISOString(),
        ipfsUrl: ipfsUrl,
      };
      
      fs.writeFileSync('nft-storage-cid.json', JSON.stringify(cidInfo, null, 2));
      console.log('CID information saved to nft-storage-cid.json');
      
      return result.value.cid;
    } else {
      throw new Error(`Upload failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error uploading to NFT.Storage:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
}

// Execute the upload
uploadToNftStorage()
  .then(cid => {
    if (!cid) {
      process.exit(1);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });