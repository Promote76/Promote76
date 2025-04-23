import React from "react";

/**
 * Error types that can occur during blockchain interactions
 */
export const ERROR_TYPES = {
  WALLET_CONNECTION: "wallet_connection",
  INSUFFICIENT_FUNDS: "insufficient_funds",
  TRANSACTION_REJECTED: "transaction_rejected",
  CONTRACT_ERROR: "contract_error",
  NETWORK_ERROR: "network_error",
  APPROVAL_ERROR: "approval_error",
  UNKNOWN_ERROR: "unknown_error"
};

/**
 * Maps error messages from various sources to standardized error types
 * @param {string} errorMessage The raw error message
 * @returns {string} Standardized error type
 */
export function mapErrorType(errorMessage) {
  const message = errorMessage.toLowerCase();
  
  if (message.includes("insufficient funds") || message.includes("not enough funds")) {
    return ERROR_TYPES.INSUFFICIENT_FUNDS;
  }
  
  if (message.includes("user rejected") || message.includes("user denied")) {
    return ERROR_TYPES.TRANSACTION_REJECTED;
  }
  
  if (message.includes("network") || message.includes("connection") || message.includes("disconnected")) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  
  if (message.includes("allowance") || message.includes("approve")) {
    return ERROR_TYPES.APPROVAL_ERROR;
  }
  
  if (message.includes("wallet") || message.includes("account") || message.includes("connect")) {
    return ERROR_TYPES.WALLET_CONNECTION;
  }
  
  if (message.includes("execution reverted") || message.includes("call exception")) {
    return ERROR_TYPES.CONTRACT_ERROR;
  }
  
  return ERROR_TYPES.UNKNOWN_ERROR;
}

/**
 * Component to display detailed error messages with potential solutions
 */
export default function ErrorHandler({ error, onRetry, className = "" }) {
  if (!error) return null;
  
  // Get error type
  const errorType = typeof error === "string" 
    ? mapErrorType(error) 
    : mapErrorType(error.message || "Unknown error");
  
  // Get error heading and message based on type
  const getErrorDetails = () => {
    switch (errorType) {
      case ERROR_TYPES.WALLET_CONNECTION:
        return {
          heading: "Wallet Connection Issue",
          message: "There was a problem connecting to your wallet.",
          solutions: [
            "Make sure your wallet (MetaMask, etc.) is unlocked",
            "Try refreshing the page",
            "Ensure you have granted this site permission to connect to your wallet"
          ]
        };
        
      case ERROR_TYPES.INSUFFICIENT_FUNDS:
        return {
          heading: "Insufficient Funds",
          message: "You don't have enough funds to complete this transaction.",
          solutions: [
            "Make sure you have enough MATIC to pay for gas fees",
            "Ensure you have enough SWF tokens for this transaction",
            "Try using a smaller amount for this transaction"
          ]
        };
        
      case ERROR_TYPES.TRANSACTION_REJECTED:
        return {
          heading: "Transaction Rejected",
          message: "You rejected the transaction in your wallet.",
          solutions: [
            "Try again and approve the transaction in your wallet"
          ]
        };
        
      case ERROR_TYPES.CONTRACT_ERROR:
        return {
          heading: "Contract Error",
          message: "The smart contract couldn't process this transaction.",
          solutions: [
            "Verify you're using a valid amount for this transaction",
            "Check if you have the required permissions for this action",
            "The contract may have a limit or requirement that wasn't met"
          ]
        };
        
      case ERROR_TYPES.NETWORK_ERROR:
        return {
          heading: "Network Error",
          message: "There was a problem with the network connection.",
          solutions: [
            "Check your internet connection",
            "The Polygon network might be congested, try again later",
            "Switch to a different RPC provider in your wallet settings"
          ]
        };
        
      case ERROR_TYPES.APPROVAL_ERROR:
        return {
          heading: "Token Approval Error",
          message: "There was a problem approving tokens for this transaction.",
          solutions: [
            "Try approving the transaction again",
            "Ensure you have enough MATIC to pay for approval gas fees",
            "Check if the token contract allows this operation"
          ]
        };
        
      default:
        return {
          heading: "Unexpected Error",
          message: typeof error === "string" ? error : error.message || "An unknown error occurred",
          solutions: [
            "Try refreshing the page",
            "Check your wallet and network connection",
            "If the problem persists, contact support"
          ]
        };
    }
  };
  
  const { heading, message, solutions } = getErrorDetails();
  
  return (
    <div className={`bg-red-50 border-l-4 border-red-400 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {heading}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
            {solutions.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Suggested solutions:</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {solutions.map((solution, index) => (
                    <li key={index}>{solution}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}