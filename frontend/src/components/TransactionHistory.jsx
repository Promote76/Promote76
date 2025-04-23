import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { getTransactionUrl } from "../lib/web3";
import { SUPPORTED_NETWORKS } from "../lib/constants";

// Transaction types
export const TX_TYPES = {
  DEPOSIT: "Deposit",
  WITHDRAW: "Withdraw",
  STAKE: "Stake",
  UNSTAKE: "Unstake",
  CLAIM_REWARDS: "Claim Rewards"
};

export default function TransactionHistory({ transactions = [], chainId }) {
  const [sortedTransactions, setSortedTransactions] = useState([]);
  
  // Sort transactions by timestamp (newest first)
  useEffect(() => {
    const sorted = [...transactions].sort((a, b) => b.timestamp - a.timestamp);
    setSortedTransactions(sorted);
  }, [transactions]);

  // Function to format timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Function to get transaction type badge class
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case TX_TYPES.DEPOSIT:
        return "bg-blue-100 text-blue-800";
      case TX_TYPES.WITHDRAW:
        return "bg-orange-100 text-orange-800";
      case TX_TYPES.STAKE:
        return "bg-green-100 text-green-800";
      case TX_TYPES.UNSTAKE:
        return "bg-yellow-100 text-yellow-800";
      case TX_TYPES.CLAIM_REWARDS:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to truncate transaction hash
  const truncateHash = (hash) => {
    if (!hash) return "";
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // If no transactions, show a message
  if (sortedTransactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Transaction History</h2>
          <p className="text-gray-500 text-center py-6">No transactions found. Your activity will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Transaction History</h2>
        <div className="space-y-3 max-h-96 overflow-auto pr-2">
          {sortedTransactions.map((tx, index) => (
            <div 
              key={tx.hash || index} 
              className="p-3 bg-white shadow-sm border border-gray-100 rounded-md hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeBadgeClass(tx.type)}`}>
                    {tx.type}
                  </span>
                  <div className="mt-1 text-sm font-medium">{tx.description}</div>
                </div>
                <div className="text-xs text-gray-500">{formatDate(tx.timestamp)}</div>
              </div>
              {tx.hash && (
                <div className="mt-2 text-xs text-gray-500">
                  <span>TX: </span>
                  <a 
                    href={getTransactionUrl(tx.hash, chainId)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {truncateHash(tx.hash)}
                  </a>
                </div>
              )}
              {tx.amount && (
                <div className="mt-1 text-sm font-semibold">
                  {tx.type === TX_TYPES.DEPOSIT || tx.type === TX_TYPES.STAKE 
                    ? "-" : tx.type === TX_TYPES.CLAIM_REWARDS 
                    ? "+" : ""}{tx.amount} SWF
                </div>
              )}
              {tx.status && (
                <div className="mt-1">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    tx.status === "success" 
                      ? "bg-green-100 text-green-800" 
                      : tx.status === "pending" 
                      ? "bg-yellow-100 text-yellow-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {tx.status === "success" 
                      ? "Success" 
                      : tx.status === "pending" 
                      ? "Pending" 
                      : "Failed"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}