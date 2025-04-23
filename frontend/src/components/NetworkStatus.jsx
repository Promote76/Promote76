import React, { useState, useEffect } from "react";
import { SUPPORTED_NETWORKS } from "../lib/constants";

/**
 * NetworkStatus component displays information about the current blockchain network
 * and connection status with visual indicators
 */
export default function NetworkStatus({ 
  chainId, 
  connected, 
  rpcLatency = null, 
  blockHeight = null, 
  onSwitchNetwork 
}) {
  const [networkDetails, setNetworkDetails] = useState(null);
  const [latencyStatus, setLatencyStatus] = useState("unknown"); // "good", "medium", "poor", "unknown"
  
  // Update network details when chainId changes
  useEffect(() => {
    if (!chainId) {
      setNetworkDetails(null);
      return;
    }
    
    const network = SUPPORTED_NETWORKS[chainId];
    setNetworkDetails(network || {
      name: `Unknown Network (${chainId})`,
      chainName: "unknown",
      supported: false
    });
    
  }, [chainId]);
  
  // Update latency status based on rpcLatency
  useEffect(() => {
    if (rpcLatency === null) {
      setLatencyStatus("unknown");
    } else if (rpcLatency < 500) {
      setLatencyStatus("good");
    } else if (rpcLatency < 2000) {
      setLatencyStatus("medium");
    } else {
      setLatencyStatus("poor");
    }
  }, [rpcLatency]);
  
  // Determine connection status class
  const getConnectionStatusClass = () => {
    if (!connected) return "bg-red-500";
    return "bg-green-500";
  };
  
  // Determine network status class
  const getNetworkStatusClass = () => {
    if (!networkDetails) return "text-gray-400";
    if (networkDetails.supported) return "text-green-600";
    return "text-orange-500";
  };
  
  // Determine latency status class and label
  const getLatencyInfo = () => {
    switch (latencyStatus) {
      case "good":
        return { 
          class: "text-green-600", 
          label: "Good", 
          indicator: "bg-green-500" 
        };
      case "medium":
        return { 
          class: "text-yellow-600", 
          label: "Medium", 
          indicator: "bg-yellow-500" 
        };
      case "poor":
        return { 
          class: "text-red-600", 
          label: "Poor", 
          indicator: "bg-red-500" 
        };
      default:
        return { 
          class: "text-gray-500", 
          label: "Unknown", 
          indicator: "bg-gray-400" 
        };
    }
  };
  
  // If not connected, show minimal info
  if (!connected) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getConnectionStatusClass()}`}></div>
            <span className="ml-2 text-sm font-medium text-gray-500">Disconnected</span>
          </div>
          <button
            onClick={() => window.ethereum && window.ethereum.request({ method: 'eth_requestAccounts' })}
            className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Network Status</h3>
      
      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Connection:</div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${getConnectionStatusClass()}`}></div>
            <span className="ml-2 text-sm font-medium">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        
        {/* Network */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Network:</div>
          <div className="flex items-center">
            {networkDetails && (
              <span className={`text-sm font-medium ${getNetworkStatusClass()}`}>
                {networkDetails.name || `Chain ID: ${chainId}`}
              </span>
            )}
            
            {networkDetails && !networkDetails.supported && onSwitchNetwork && (
              <button
                onClick={() => onSwitchNetwork(137)} // Switch to Polygon Mainnet
                className="ml-2 text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
              >
                Switch
              </button>
            )}
          </div>
        </div>
        
        {/* RPC Latency */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Latency:</div>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${getLatencyInfo().indicator}`}></div>
            <span className={`ml-2 text-sm font-medium ${getLatencyInfo().class}`}>
              {rpcLatency !== null ? `${rpcLatency}ms (${getLatencyInfo().label})` : "Unknown"}
            </span>
          </div>
        </div>
        
        {/* Block Height */}
        {blockHeight !== null && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Block:</div>
            <div className="text-sm font-medium">
              #{blockHeight.toLocaleString()}
            </div>
          </div>
        )}
        
        {/* Gas Price (if available) */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          {networkDetails && networkDetails.supported && (
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {networkDetails.name === "Polygon Mainnet" 
                  ? "Learn more about Polygon" 
                  : "View explorer"}
              </div>
              <a
                href={networkDetails.blockExplorerUrls?.[0] || "https://polygonscan.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                {networkDetails.name === "Polygon Mainnet" ? "Polygon Docs →" : "Explorer →"}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}