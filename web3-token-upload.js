require('dotenv').config();
const { Web3Storage } = require('web3.storage');
const fs = require('fs');

// Token metadata
const metadata = JSON.parse(fs.readFileSync('./SovranWealthFund.token.json', 'utf8'));

// Update metadata with SoloMethodEngine staking information
metadata.staking = {
  engine: "SoloMethodEngine",
  apr: "25%",  // Updated from 5% to 25%
  minStake: "50 SWF",
  walletCount: 16,
  walletRoles: ["BUYER", "HOLDER", "STAKER", "LIQUIDITY", "TRACKER"]
};

// Add staking-related attributes if they don't exist
const hasStakingAttribute = metadata.attributes.some(attr => attr.trait_type === "Staking");
if (!hasStakingAttribute) {
  metadata.attributes.push({
    trait_type: "Staking",
    value: "SoloMethodEngine (25% APR)"  // Updated from 5% to 25%
  });
}

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
    
    console.log('Uploading token metadata to IPFS via Web3.Storage...');
    
    // Store the file
    const files = [file];
    const cid = await client.put(files);
    
    console.log('Upload complete!');
    console.log('Content ID (CID):', cid);
    console.log('URL:', `https://${cid}.ipfs.dweb.link/SovranWealthFund.token.json`);
    console.log('IPFS URL:', `ipfs://${cid}/SovranWealthFund.token.json`);
    
    // Save the CID information
    const cidInfo = {
      cid: cid,
      url: `https://${cid}.ipfs.dweb.link/SovranWealthFund.token.json`,
      ipfsUrl: `ipfs://${cid}/SovranWealthFund.token.json`,
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