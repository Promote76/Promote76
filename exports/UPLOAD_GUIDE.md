# Sovran Wealth Fund Token Metadata Upload Guide

This guide helps you manually upload your token metadata to decentralized storage systems like IPFS.

## Files Ready for Upload

The following files have been prepared in the 'exports' directory:

1. `SovranWealthFund.token.json` - The token metadata in JSON format
2. `SovranWealthFund.token.html` - A HTML representation of the token metadata for easy viewing

## Manual Upload Options

### Option 1: Pinata (Recommended)

1. Go to [Pinata](https://www.pinata.cloud/) and create a free account
2. Click "Upload" and select the `SovranWealthFund.token.json` file from the 'exports' directory
3. Once uploaded, you'll receive a CID (Content Identifier)
4. Your metadata will be accessible at:
   - IPFS URI: ipfs://{CID}
   - Gateway URL: https://gateway.pinata.cloud/ipfs/{CID}

### Option 2: NFT.Storage Web Interface

1. Go to [NFT.Storage](https://nft.storage/) and create an account
2. Use the web interface to upload the `SovranWealthFund.token.json` file
3. Once uploaded, you'll receive a CID
4. Your metadata will be accessible at:
   - IPFS URI: ipfs://{CID}
   - Gateway URL: https://{CID}.ipfs.nftstorage.link

### Option 3: Web3.Storage Web Interface

1. Go to [Web3.Storage](https://web3.storage/) and create an account
2. Use the web interface to upload the `SovranWealthFund.token.json` file
3. Once uploaded, you'll receive a CID
4. Your metadata will be accessible at:
   - IPFS URI: ipfs://{CID}
   - Gateway URL: https://{CID}.ipfs.dweb.link

## After Uploading

After successfully uploading the file, you should:

1. Save the CID and IPFS URI for future reference
2. Test accessing the file through a public gateway to ensure it's properly uploaded
3. Consider submitting the CID to additional IPFS pinning services for redundancy

Remember that IPFS is content-addressed, so the same file will always have the same CID regardless of where it's uploaded.
