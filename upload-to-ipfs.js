const { Web3Storage, getFilesFromPath } = require('web3.storage');
const path = require('path');
const fs = require('fs');

// Path to the token metadata file
const metadataFilePath = path.join(__dirname, 'SovranWealthFund.token.json');

// We need a Web3.Storage API token
const apiToken = process.env.WEB3_STORAGE_API_TOKEN;

if (!apiToken) {
  console.error('Error: WEB3_STORAGE_API_TOKEN environment variable not set.');
  console.error('Please set your Web3.Storage API token before running this script.');
  console.error('You can get an API token at https://web3.storage/tokens/');
  process.exit(1);
}

if (!fs.existsSync(metadataFilePath)) {
  console.error(`Error: Metadata file not found at ${metadataFilePath}`);
  process.exit(1);
}

async function main() {
  try {
    console.log('Connecting to Web3.Storage...');
    const storage = new Web3Storage({ token: apiToken });
    
    console.log(`Preparing to upload ${metadataFilePath}...`);
    const files = await getFilesFromPath(metadataFilePath);
    
    console.log('Uploading token metadata to IPFS via Web3.Storage...');
    const cid = await storage.put(files);
    
    console.log('\n✅ Successfully uploaded to IPFS!');
    console.log(`Content ID (CID): ${cid}`);
    console.log(`\nYou can access your metadata at:`);
    console.log(`https://${cid}.ipfs.w3s.link/SovranWealthFund.token.json`);
    console.log(`https://w3s.link/ipfs/${cid}/SovranWealthFund.token.json`);
    
    // Save the CID to a file for future reference
    fs.writeFileSync('ipfs-cid.json', JSON.stringify({ 
      cid, 
      timestamp: new Date().toISOString(),
      metadataUrl: `https://${cid}.ipfs.w3s.link/SovranWealthFund.token.json`
    }, null, 2));
    
    console.log('\nCID information saved to ipfs-cid.json');
  } catch (error) {
    console.error('Error uploading to IPFS:', error.message);
    process.exit(1);
  }
}

main();