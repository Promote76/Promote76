require('dotenv').config();
const { Web3Storage } = require('web3.storage');
const fs = require('fs');

// Token metadata
const metadata = JSON.parse(fs.readFileSync('./SovranWealthFund.token.json', 'utf8'));

// Create a storage client
function getStorage() {
  return new Web3Storage({ token: process.env.WEB3_STORAGE_API_TOKEN });
}

// Create a File object from our metadata
function makeFileFromMetadata() {
  const buffer = Buffer.from(JSON.stringify(metadata, null, 2));
  return new File([buffer], 'SovranWealthFund.token.json', { type: 'application/json' });
}

// Upload the file
async function uploadTokenMetadata() {
  try {
    const client = getStorage();
    const file = makeFileFromMetadata();
    
    console.log('Uploading token metadata to IPFS...');
    const cid = await client.put([file], { wrapWithDirectory: false });
    
    console.log('Upload complete!');
    console.log('Content ID (CID):', cid);
    console.log('URL:', `https://${cid}.ipfs.w3s.link`);
    
    // Save the CID information
    const cidInfo = {
      cid: cid,
      url: `https://${cid}.ipfs.w3s.link`,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('token-cid.json', JSON.stringify(cidInfo, null, 2));
    console.log('CID saved to token-cid.json');
    
    return cid;
  } catch (error) {
    console.error('Error uploading file:', error.message);
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