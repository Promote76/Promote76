import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, CardContent } from "./ui/card";
import { formatBigNumber } from "../lib/web3";
import LoadingIndicator from "./LoadingIndicator";

/**
 * TokenMetrics component displays detailed information about the SWF token
 * including supply metrics, vault deposits, and staking statistics
 */
export default function TokenMetrics({
  swfToken,
  vault,
  stakingEngine,
  refreshInterval = 30000, // 30 seconds refresh interval
}) {
  const [metrics, setMetrics] = useState({
    totalSupply: null,
    circulatingSupply: null,
    vaultDeposits: null,
    totalStaked: null,
    stakingAPR: null,
    holders: null, // This would require an external API or subgraph query
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Format large numbers with commas
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined) return "—";
    
    // If it's already a string with commas, return it
    if (typeof value === "string" && value.includes(",")) return value;
    
    // If it's a BigNumber, format it
    if (ethers.BigNumber.isBigNumber(value)) {
      return parseFloat(formatBigNumber(value)).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    
    // Otherwise, format as a regular number
    return parseFloat(value).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };
  
  // Fetch metrics data
  const fetchMetrics = async () => {
    if (!swfToken || !vault || !stakingEngine) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data in parallel
      const [
        totalSupply,
        vaultDeposits,
        totalStaked,
        aprBasisPoints,
      ] = await Promise.all([
        swfToken.totalSupply(),
        vault.totalDeposited(),
        stakingEngine.totalStaked(),
        stakingEngine.aprBasisPoints(),
      ]);
      
      // Calculate circulating supply (total - staked - in vault)
      const circulatingSupply = totalSupply.sub(totalStaked).sub(vaultDeposits);
      
      // Convert APR from basis points to percentage
      const stakingAPR = aprBasisPoints.toNumber() / 100;
      
      setMetrics({
        totalSupply,
        circulatingSupply,
        vaultDeposits,
        totalStaked,
        stakingAPR,
        holders: "—", // Would require external API
      });
    } catch (err) {
      console.error("Error fetching token metrics:", err);
      setError("Failed to load token metrics. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch and set up refresh interval
  useEffect(() => {
    fetchMetrics();
    
    // Set up refresh interval
    const intervalId = setInterval(fetchMetrics, refreshInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [swfToken, vault, stakingEngine, refreshInterval]);
  
  // Calculate percentages
  const calculatePercentage = (value, total) => {
    if (!value || !total) return "—";
    
    try {
      const percentage = value.mul(100).div(total).toNumber();
      return `${percentage}%`;
    } catch (err) {
      return "—";
    }
  };
  
  if (loading && !metrics.totalSupply) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-4">SWF Token Metrics</h2>
          <div className="flex justify-center py-6">
            <LoadingIndicator message="Loading metrics..." />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">SWF Token Metrics</h2>
          <div className="bg-red-50 p-3 rounded text-red-600 text-sm">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">SWF Token Metrics</h2>
          {loading && (
            <div className="text-xs text-gray-500 flex items-center">
              <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Refreshing</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Total Supply */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-700 font-medium">Total Supply</div>
            <div className="text-xl font-bold text-blue-900 mt-1">
              {formatNumber(metrics.totalSupply)} SWF
            </div>
          </div>
          
          {/* Circulating Supply */}
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-700 font-medium">Circulating Supply</div>
            <div className="text-xl font-bold text-green-900 mt-1">
              {formatNumber(metrics.circulatingSupply)} SWF
            </div>
            <div className="text-xs text-green-600 mt-1">
              {calculatePercentage(metrics.circulatingSupply, metrics.totalSupply)} of Total Supply
            </div>
          </div>
          
          {/* Vault Deposits */}
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-purple-700 font-medium">Vault Deposits</div>
            <div className="text-xl font-bold text-purple-900 mt-1">
              {formatNumber(metrics.vaultDeposits)} SWF
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {calculatePercentage(metrics.vaultDeposits, metrics.totalSupply)} of Total Supply
            </div>
          </div>
          
          {/* Staked */}
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm text-orange-700 font-medium">Total Staked</div>
            <div className="text-xl font-bold text-orange-900 mt-1">
              {formatNumber(metrics.totalStaked)} SWF
            </div>
            <div className="text-xs text-orange-600 mt-1">
              {calculatePercentage(metrics.totalStaked, metrics.totalSupply)} of Total Supply
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          {/* Staking APR */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">Current Staking APR</div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {metrics.stakingAPR !== null ? `${metrics.stakingAPR}%` : "—"}
            </div>
          </div>
          
          {/* Holders Count */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">Token Holders</div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {metrics.holders}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Data from Polygonscan
            </div>
          </div>
        </div>
        
        {/* Supply Distribution Visualization */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Token Distribution</h3>
          <div className="h-4 rounded-full overflow-hidden bg-gray-200">
            {metrics.totalSupply && (
              <>
                {/* Staked portion */}
                <div 
                  className="h-full bg-orange-500 float-left" 
                  style={{ 
                    width: `${metrics.totalStaked?.mul(100).div(metrics.totalSupply).toNumber() || 0}%` 
                  }}
                ></div>
                
                {/* Vault deposits portion */}
                <div 
                  className="h-full bg-purple-500 float-left" 
                  style={{ 
                    width: `${metrics.vaultDeposits?.mul(100).div(metrics.totalSupply).toNumber() || 0}%` 
                  }}
                ></div>
                
                {/* Circulating portion */}
                <div 
                  className="h-full bg-green-500 float-left" 
                  style={{ 
                    width: `${metrics.circulatingSupply?.mul(100).div(metrics.totalSupply).toNumber() || 0}%` 
                  }}
                ></div>
              </>
            )}
          </div>
          
          <div className="flex justify-between mt-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
              <span>Staked</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
              <span>In Vault</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Circulating</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}