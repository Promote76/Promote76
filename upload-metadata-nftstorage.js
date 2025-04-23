// upload-metadata-nftstorage.js - Upload SWF token metadata to NFT.Storage
require('dotenv').config();
const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');

// Load token metadata
const metadata = JSON.parse(fs.readFileSync('./SovranWealthFund.token.json', 'utf8'));

async function uploadToNFTStorage() {
  try {
    // Check if we have the API key
    if (!process.env.NFT_STORAGE_API_KEY) {
      throw new Error('NFT_STORAGE_API_KEY not found in environment variables');
    }
    
    console.log('Creating NFT.Storage client...');
    const client = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });
    
    // Create a File object from the metadata
    const buffer = Buffer.from(JSON.stringify(metadata, null, 2));
    const file = new File([buffer], 'SovranWealthFund.token.json', { type: 'application/json' });
    
    console.log(`Uploading token metadata for ${metadata.name} (${metadata.symbol}) to NFT.Storage...`);
    console.log(`Contract Address: ${metadata.contractAddress}`);
    
    // Store the file
    const cid = await client.storeBlob(file);
    
    console.log('\n✅ Upload successful!');
    console.log('----------------------------------------');
    console.log(`IPFS CID: ${cid}`);
    console.log(`Gateway URL: https://${cid}.ipfs.nftstorage.link`);
    console.log(`Direct access: https://nftstorage.link/ipfs/${cid}`);
    console.log('----------------------------------------\n');
    
    // Save the CID information
    const cidInfo = {
      service: 'NFT.Storage',
      cid: cid,
      urls: {
        ipfs: `ipfs://${cid}`,
        gateway: `https://${cid}.ipfs.nftstorage.link`,
        direct: `https://nftstorage.link/ipfs/${cid}`
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
uploadToNFTStorage()
  .then(() => console.log('Metadata upload process complete.'))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });