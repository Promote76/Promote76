import { useEffect, useState } from "react";
import { getTransactionUrl } from "../lib/web3";

export default function TransactionModal({ 
  isOpen, 
  onClose,
  type, // 'confirm', 'pending', 'success', 'error'
  title,
  message,
  txHash,
  chainId,
  onConfirm,
  onViewTx
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle modal visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [isOpen]);
  
  if (!isOpen && !isVisible) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'confirm':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'pending':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="animate-spin h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isOpen ? 'sm:scale-100' : 'sm:scale-95'}`}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="text-center mb-4">
                  {getIcon()}
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mt-3" id="modal-title">
                    {title}
                  </h3>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-500 text-center mb-4">
                    {message}
                  </p>
                  
                  {txHash && (
                    <div className="text-sm text-center">
                      <div className="text-gray-500 mb-1">Transaction Hash:</div>
                      <a 
                        href={getTransactionUrl(txHash, chainId)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-words"
                        onClick={(e) => {
                          e.preventDefault();
                          if (onViewTx) onViewTx();
                          window.open(getTransactionUrl(txHash, chainId), '_blank');
                        }}
                      >
                        {txHash}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {type === 'confirm' && onConfirm && (
              <button 
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onConfirm}
              >
                Confirm
              </button>
            )}
            
            {type === 'pending' && (
              <div className="w-full text-center text-sm text-gray-500">
                Please wait while the transaction is being processed...
              </div>
            )}
            
            {(type === 'success' || type === 'error') && (
              <button 
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${type === 'success' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                onClick={onClose}
              >
                {type === 'success' ? 'Done' : 'Close'}
              </button>
            )}
            
            {type !== 'pending' && (
              <button 
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                {type === 'confirm' ? 'Cancel' : 'Close'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}