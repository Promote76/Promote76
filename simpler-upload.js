const { Web3Storage } = require('web3.storage');
const fs = require('fs');

// Load the token metadata
const metadata = fs.readFileSync('SovranWealthFund.token.json', 'utf8');
const parsedMetadata = JSON.parse(metadata);

// Web3.Storage token
const token = process.env.WEB3_STORAGE_API_TOKEN;

// Helper function to create a File object
function makeFileObject(name, content) {
  return new File([content], name, { type: 'application/json' });
}

async function storeMetadata() {
  // Create a client instance
  const client = new Web3Storage({ token });
  
  // Create a File from the metadata
  const metadataFile = makeFileObject('SovranWealthFund.token.json', JSON.stringify(parsedMetadata, null, 2));
  
  console.log('Uploading token metadata to IPFS...');
  // Upload the file
  const cid = await client.put([metadataFile], { wrapWithDirectory: true });
  
  console.log('Upload complete!');
  console.log('Content Identifier (CID):', cid);
  console.log('Metadata URL:', `https://${cid}.ipfs.w3s.link/SovranWealthFund.token.json`);
  
  // Save CID to file
  fs.writeFileSync('token-cid.json', JSON.stringify({
    cid: cid,
    url: `https://${cid}.ipfs.w3s.link/SovranWealthFund.token.json`,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  console.log('CID saved to token-cid.json');
}

storeMetadata().catch(err => {
  console.error('Error uploading file:', err);
  process.exit(1);
});