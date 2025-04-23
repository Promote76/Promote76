import { ethers } from "ethers";
import { 
  SWF_TOKEN_ABI,
  SWF_BASKET_VAULT_ABI,
  SOLO_METHOD_ENGINE_ABI,
  DYNAMIC_APR_CONTROLLER_ABI,
  SUPPORTED_NETWORKS,
  getContractAddresses
} from "./constants";

/**
 * Get a provider for the user's wallet
 * @returns {ethers.providers.Web3Provider | null} The web3 provider or null if not available
 */
export function getProvider() {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  return null;
}

/**
 * Connect to the user's wallet
 * @returns {Promise<{accounts: string[], chainId: number, provider: ethers.providers.Web3Provider} | null>}
 */
export async function connectWallet() {
  try {
    const provider = getProvider();
    if (!provider) {
      throw new Error("No Ethereum wallet found. Please install MetaMask or another Ethereum wallet.");
    }
    
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const chainId = parseInt(await window.ethereum.request({ method: "eth_chainId" }), 16);
    
    return { accounts, chainId, provider };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    throw error;
  }
}

/**
 * Switch to a specific network
 * @param {number} chainId The chain ID to switch to
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function switchNetwork(chainId) {
  if (!window.ethereum) return false;
  
  const network = SUPPORTED_NETWORKS[chainId];
  if (!network) return false;
  
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
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
        console.error("Error adding network:", addError);
        return false;
      }
    }
    console.error("Error switching network:", switchError);
    return false;
  }
}

/**
 * Get contract instances for the Sovran Wealth Fund ecosystem
 * @param {ethers.providers.Web3Provider} provider The web3 provider
 * @param {number} chainId The current chain ID
 * @returns {Object} Object containing contract instances
 */
export function getContracts(provider, chainId) {
  const signer = provider.getSigner();
  const addresses = getContractAddresses(chainId);
  
  return {
    swfToken: new ethers.Contract(addresses.swfToken, SWF_TOKEN_ABI, signer),
    vault: new ethers.Contract(addresses.vault, SWF_BASKET_VAULT_ABI, signer),
    stakingEngine: new ethers.Contract(addresses.stakingEngine, SOLO_METHOD_ENGINE_ABI, signer),
    aprController: new ethers.Contract(addresses.aprController, DYNAMIC_APR_CONTROLLER_ABI, signer),
  };
}

/**
 * Format a big number to a readable string with specified decimals
 * @param {ethers.BigNumber} value The value to format
 * @param {number} decimals The number of decimals to use (default: 18)
 * @returns {string} The formatted value
 */
export function formatBigNumber(value, decimals = 18) {
  return ethers.utils.formatUnits(value, decimals);
}

/**
 * Parse a string to a big number with specified decimals
 * @param {string} value The value to parse
 * @param {number} decimals The number of decimals to use (default: 18)
 * @returns {ethers.BigNumber} The parsed value
 */
export function parseBigNumber(value, decimals = 18) {
  return ethers.utils.parseUnits(value, decimals);
}

/**
 * Truncate an Ethereum address for display
 * @param {string} address The address to truncate
 * @returns {string} The truncated address
 */
export function truncateAddress(address) {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Get transaction URL for the block explorer
 * @param {string} txHash The transaction hash
 * @param {number} chainId The chain ID
 * @returns {string} The URL to the block explorer
 */
export function getTransactionUrl(txHash, chainId) {
  const network = SUPPORTED_NETWORKS[chainId];
  if (!network || !network.blockExplorerUrls || !network.blockExplorerUrls[0]) {
    return "";
  }
  return `${network.blockExplorerUrls[0]}tx/${txHash}`;
}

/**
 * Get address URL for the block explorer
 * @param {string} address The address
 * @param {number} chainId The chain ID
 * @returns {string} The URL to the block explorer
 */
export function getAddressUrl(address, chainId) {
  const network = SUPPORTED_NETWORKS[chainId];
  if (!network || !network.blockExplorerUrls || !network.blockExplorerUrls[0]) {
    return "";
  }
  return `${network.blockExplorerUrls[0]}address/${address}`;
}