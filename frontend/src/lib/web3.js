import { ethers } from "ethers";
import { SUPPORTED_NETWORKS, SWF_TOKEN_ABI, SWF_BASKET_VAULT_ABI, SOLO_METHOD_ENGINE_ABI, DYNAMIC_APR_CONTROLLER_ABI } from "./constants";

/**
 * Get the Ethereum provider
 * @returns {ethers.providers.Web3Provider} The web3 provider
 */
export function getProvider() {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  return null;
}

/**
 * Connect to the wallet
 * @returns {Object} Object containing provider, accounts, and chainId
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet found. Please install MetaMask or another wallet.");
  }
  
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    
    // Get the connected chain ID
    const { chainId } = await provider.getNetwork();
    
    return {
      provider,
      accounts,
      chainId
    };
  } catch (error) {
    throw new Error(error.message || "Failed to connect to wallet");
  }
}

/**
 * Switch to a different network
 * @param {number} chainId The chain ID to switch to
 * @returns {boolean} Whether the switch was successful
 */
export async function switchNetwork(chainId) {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet found. Please install MetaMask or another wallet.");
  }
  
  const network = SUPPORTED_NETWORKS[chainId];
  if (!network) {
    throw new Error(`Network with chain ID ${chainId} not supported`);
  }
  
  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        // Add the network
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: network.blockExplorerUrls,
            },
          ],
        });
        
        return true;
      } catch (addError) {
        throw new Error(`Failed to add network: ${addError.message}`);
      }
    }
    
    throw new Error(`Failed to switch network: ${switchError.message}`);
  }
}

/**
 * Get contract instances
 * @param {ethers.providers.Web3Provider} provider The web3 provider
 * @param {number} chainId The chain ID
 * @returns {Object} Object containing contract instances
 */
export function getContracts(provider, chainId) {
  // Get contract addresses for the specified chain
  const chainKey = chainId === 137 ? "polygon" : chainId === 80001 ? "mumbai" : "development";
  const addresses = SUPPORTED_NETWORKS[chainId]?.chainName || "development";
  
  const signer = provider.getSigner();
  
  // Create contract instances
  const swfToken = new ethers.Contract(
    addresses.swfToken,
    SWF_TOKEN_ABI,
    signer
  );
  
  const vault = new ethers.Contract(
    addresses.vault,
    SWF_BASKET_VAULT_ABI,
    signer
  );
  
  const stakingEngine = new ethers.Contract(
    addresses.stakingEngine,
    SOLO_METHOD_ENGINE_ABI,
    signer
  );
  
  const aprController = new ethers.Contract(
    addresses.aprController,
    DYNAMIC_APR_CONTROLLER_ABI,
    signer
  );
  
  return {
    swfToken,
    vault,
    stakingEngine,
    aprController
  };
}

/**
 * Format a big number to a human readable string
 * @param {ethers.BigNumber} bigNumber The big number to format
 * @param {number} decimals The number of decimals in the token (default: 18)
 * @returns {string} The formatted string
 */
export function formatBigNumber(bigNumber, decimals = 18) {
  return ethers.utils.formatUnits(bigNumber, decimals);
}

/**
 * Parse a string to a big number
 * @param {string} value The string to parse
 * @param {number} decimals The number of decimals in the token (default: 18)
 * @returns {ethers.BigNumber} The parsed big number
 */
export function parseBigNumber(value, decimals = 18) {
  return ethers.utils.parseUnits(value.toString(), decimals);
}

/**
 * Truncate an Ethereum address for display
 * @param {string} address The Ethereum address to truncate
 * @returns {string} The truncated address
 */
export function truncateAddress(address) {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Get the block explorer URL for a transaction
 * @param {string} txHash The transaction hash
 * @param {number} chainId The chain ID
 * @returns {string} The block explorer URL
 */
export function getTransactionUrl(txHash, chainId) {
  const network = SUPPORTED_NETWORKS[chainId];
  if (!network || !network.blockExplorerUrls || network.blockExplorerUrls.length === 0) {
    return `https://polygonscan.com/tx/${txHash}`;
  }
  
  return `${network.blockExplorerUrls[0]}tx/${txHash}`;
}

/**
 * Get the block explorer URL for an address
 * @param {string} address The Ethereum address
 * @param {number} chainId The chain ID
 * @returns {string} The block explorer URL
 */
export function getAddressUrl(address, chainId) {
  const network = SUPPORTED_NETWORKS[chainId];
  if (!network || !network.blockExplorerUrls || network.blockExplorerUrls.length === 0) {
    return `https://polygonscan.com/address/${address}`;
  }
  
  return `${network.blockExplorerUrls[0]}address/${address}`;
}