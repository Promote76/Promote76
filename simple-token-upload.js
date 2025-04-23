require('dotenv').config();
const { NFTStorage } = require('nft.storage');
const fs = require('fs');

// Token metadata
const metadata = JSON.parse(fs.readFileSync('./SovranWealthFund.token.json', 'utf8'));

// Update metadata with SoloMethodEngine staking information
metadata.staking = {
  engine: "SoloMethodEngine",
  apr: "5%",
  minStake: "50 SWF",
  walletCount: 16,
  walletRoles: ["BUYER", "HOLDER", "STAKER", "LIQUIDITY", "TRACKER"]
};

// Add staking-related attributes if they don't exist
const hasStakingAttribute = metadata.attributes.some(attr => attr.trait_type === "Staking");
if (!hasStakingAttribute) {
  metadata.attributes.push({
    trait_type: "Staking",
    value: "SoloMethodEngine (5% APR)"
  });
}

// Create a storage client
function getStorage() {
  return new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });
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
    
    console.log('Uploading token metadata to IPFS via NFT.Storage...');
    
    // Store the file
    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const cid = await client.storeBlob(blob);
    
    console.log('Upload complete!');
    console.log('Content ID (CID):', cid);
    console.log('URL:', `https://${cid}.ipfs.nftstorage.link`);
    console.log('IPFS URL:', `ipfs://${cid}`);
    
    // Save the CID information
    const cidInfo = {
      cid: cid,
      url: `https://${cid}.ipfs.nftstorage.link`,
      ipfsUrl: `ipfs://${cid}`,
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