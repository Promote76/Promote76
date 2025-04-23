import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { formatBigNumber, parseBigNumber } from "../lib/web3";

export default function APRVisualization({ 
  aprController, 
  currentVaultDeposits,
  currentAPR,
  lowThreshold = 10000, // 10,000 SWF
  highThreshold = 100000, // 100,000 SWF
  minAPR = 10, // 10%
  maxAPR = 30, // 30%
}) {
  const [depositAmount, setDepositAmount] = useState("");
  const [simulatedAPR, setSimulatedAPR] = useState(null);
  const [depositLevels, setDepositLevels] = useState([]);
  const [error, setError] = useState("");

  // Initialize deposit levels for visualization
  useEffect(() => {
    const levels = [];
    const step = (highThreshold - lowThreshold) / 5;
    
    for (let i = 0; i <= 6; i++) {
      const deposit = i === 0 ? 0 : i === 6 ? highThreshold * 1.2 : lowThreshold + (i - 1) * step;
      const apr = calculateAPR(deposit);
      levels.push({ deposit, apr });
    }
    
    setDepositLevels(levels);
  }, [lowThreshold, highThreshold, minAPR, maxAPR]);

  // Calculate APR based on deposit amount
  const calculateAPR = (depositAmount) => {
    if (depositAmount <= lowThreshold) {
      return maxAPR;
    } else if (depositAmount >= highThreshold) {
      return minAPR;
    } else {
      // Linear interpolation between max and min APR
      const depositRange = highThreshold - lowThreshold;
      const aprRange = maxAPR - minAPR;
      const depositRatio = (depositAmount - lowThreshold) / depositRange;
      return maxAPR - (depositRatio * aprRange);
    }
  };

  // Simulate APR using the contract if available
  const simulateAPRWithContract = async () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) < 0) {
      setError("Please enter a valid deposit amount");
      return;
    }

    try {
      setError("");
      
      if (aprController) {
        // Use contract to simulate APR
        const amt = parseBigNumber(depositAmount);
        const aprBasisPoints = await aprController.simulateAPRForDeposit(amt);
        setSimulatedAPR(aprBasisPoints.toNumber() / 100); // Convert basis points to percentage
      } else {
        // Use local calculation if contract not available
        setSimulatedAPR(calculateAPR(parseFloat(depositAmount)));
      }
    } catch (err) {
      console.error("Error simulating APR:", err);
      setError("Failed to simulate APR");
    }
  };

  // Format large numbers with commas
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get color for APR visualization
  const getAPRColor = (apr) => {
    const ratio = (apr - minAPR) / (maxAPR - minAPR);
    if (ratio > 0.7) return "bg-green-500";
    if (ratio > 0.4) return "bg-green-400";
    if (ratio > 0.2) return "bg-yellow-400";
    return "bg-yellow-300";
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Dynamic APR Simulator</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <p className="text-sm text-gray-600 mb-2">
            The APR for staking rewards adjusts based on total vault deposits. 
            Higher deposits = lower APR.
          </p>
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Low Deposits (&lt;{formatNumber(lowThreshold)} SWF)</span>
              <span>High Deposits (&gt;{formatNumber(highThreshold)} SWF)</span>
            </div>
            <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden relative">
              <div className="grid grid-cols-3 h-full w-full absolute">
                <div className="border-r border-gray-300 h-full"></div>
                <div className="border-r border-gray-300 h-full"></div>
              </div>
              
              {/* Current APR indicator */}
              {currentAPR && (
                <div 
                  className="absolute h-full w-2 bg-blue-600 top-0 transform -translate-x-1/2"
                  style={{ 
                    left: `${Math.max(0, Math.min(100, ((currentAPR - minAPR) / (maxAPR - minAPR)) * 100))}%` 
                  }}
                >
                  <div className="w-4 h-4 rounded-full bg-blue-600 absolute -top-1 -left-1"></div>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs font-medium mt-1">
              <span className="text-green-600">{maxAPR}% APR</span>
              <span className="text-yellow-600">{minAPR}% APR</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Simulate APR for Different Deposit Levels</h3>
          <div className="space-y-2">
            {depositLevels.map((level, index) => (
              <div key={index} className="flex items-center">
                <div className="w-32 text-xs">{formatNumber(Math.round(level.deposit))} SWF</div>
                <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getAPRColor(level.apr)}`} 
                    style={{ width: `${((level.apr - minAPR) / (maxAPR - minAPR)) * 100}%` }}
                  ></div>
                </div>
                <div className="w-16 text-right text-xs font-medium">{level.apr.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Simulate Your Own Scenario</h3>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Deposit amount in SWF"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              type="number"
              min="0"
              className="flex-1"
            />
            <Button onClick={simulateAPRWithContract}>
              Simulate
            </Button>
          </div>
          
          {simulatedAPR !== null && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Simulated APR:</span> {simulatedAPR.toFixed(2)}%
              </p>
              {parseFloat(depositAmount) > parseFloat(currentVaultDeposits || 0) && (
                <p className="text-xs text-gray-600 mt-1">
                  This would {simulatedAPR < currentAPR ? "decrease" : "increase"} the current APR of {currentAPR}%
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}