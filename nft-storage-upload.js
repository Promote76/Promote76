require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Path to metadata file
const metadataPath = path.join(__dirname, 'SovranWealthFund.token.json');

// Function to upload metadata to NFT.Storage
async function uploadMetadata() {
  try {
    console.log('Reading token metadata...');
    const metadata = fs.readFileSync(metadataPath, 'utf8');
    
    console.log('Preparing to upload to NFT.Storage...');
    const response = await axios.post('https://api.nft.storage/upload', metadata, {
      headers: {
        'Authorization': `Bearer ${process.env.WEB3_STORAGE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('\n✅ Upload successful!');
      console.log('CID:', response.data.value.cid);
      
      // Save the CID information
      const cidInfo = {
        cid: response.data.value.cid,
        url: `https://${response.data.value.cid}.ipfs.nftstorage.link/`,
        gateway_url: `https://nftstorage.link/ipfs/${response.data.value.cid}`,
        timestamp: new Date().toISOString()
      };
      
      fs.writeFileSync('nft-storage-cid.json', JSON.stringify(cidInfo, null, 2));
      console.log('\nToken metadata available at:');
      console.log(`https://${response.data.value.cid}.ipfs.nftstorage.link/`);
      console.log(`https://nftstorage.link/ipfs/${response.data.value.cid}`);
      console.log('\nMetadata CID saved to nft-storage-cid.json');
    } else {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error uploading metadata:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Execute the upload
uploadMetadata().catch(console.error);