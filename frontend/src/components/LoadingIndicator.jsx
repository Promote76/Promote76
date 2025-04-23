import React from "react";

/**
 * Different types of loading indicators
 */
export const LOADING_TYPES = {
  SPINNER: "spinner",
  DOTS: "dots",
  PROGRESS: "progress",
  PULSE: "pulse",
  SKELETON: "skeleton"
};

/**
 * Different sizes for the loading indicators
 */
export const LOADING_SIZES = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large"
};

/**
 * LoadingIndicator component that displays different types of loading animations
 */
export default function LoadingIndicator({ 
  type = LOADING_TYPES.SPINNER, 
  size = LOADING_SIZES.MEDIUM,
  message = "",
  progress = 0, // 0-100 for progress type
  className = "",
  fullScreen = false,
  transparent = false
}) {
  // Determine size classes for different indicator types
  const getSizeClasses = () => {
    switch (size) {
      case LOADING_SIZES.SMALL:
        return {
          container: "h-6 w-6",
          spinner: "h-6 w-6",
          dots: "h-2 w-2",
          progress: "h-1.5",
          pulse: "h-6 w-6",
          skeleton: "h-4"
        };
      case LOADING_SIZES.LARGE:
        return {
          container: "h-16 w-16",
          spinner: "h-16 w-16",
          dots: "h-4 w-4",
          progress: "h-3",
          pulse: "h-16 w-16",
          skeleton: "h-8"
        };
      default: // MEDIUM
        return {
          container: "h-10 w-10",
          spinner: "h-10 w-10",
          dots: "h-3 w-3",
          progress: "h-2",
          pulse: "h-10 w-10",
          skeleton: "h-6"
        };
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  // Render appropriate loading indicator based on type
  const renderLoadingIndicator = () => {
    switch (type) {
      case LOADING_TYPES.SPINNER:
        return (
          <div className={`${sizeClasses.container} ${className}`}>
            <svg className={`animate-spin ${sizeClasses.spinner} text-blue-500`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        );
        
      case LOADING_TYPES.DOTS:
        return (
          <div className={`flex space-x-2 ${className}`}>
            <div className={`${sizeClasses.dots} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: "0ms" }}></div>
            <div className={`${sizeClasses.dots} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: "150ms" }}></div>
            <div className={`${sizeClasses.dots} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: "300ms" }}></div>
          </div>
        );
        
      case LOADING_TYPES.PROGRESS:
        return (
          <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
            <div 
              className={`${sizeClasses.progress} bg-blue-600 rounded-full transition-all duration-300 ease-in-out`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        );
        
      case LOADING_TYPES.PULSE:
        return (
          <div className={`${sizeClasses.pulse} bg-blue-500 rounded-full animate-pulse ${className}`}></div>
        );
        
      case LOADING_TYPES.SKELETON:
        return (
          <div className={`w-full ${sizeClasses.skeleton} bg-gray-300 rounded animate-pulse ${className}`}></div>
        );
        
      default:
        return (
          <div className={`${sizeClasses.container} ${className}`}>
            <svg className={`animate-spin ${sizeClasses.spinner} text-blue-500`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        );
    }
  };
  
  // If it's a full screen loader, render it with a backdrop
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${transparent ? 'bg-white bg-opacity-75' : 'bg-gray-900 bg-opacity-50'}`}>
        <div className="text-center">
          {renderLoadingIndicator()}
          {message && (
            <p className={`mt-4 font-medium ${transparent ? 'text-gray-600' : 'text-white'}`}>{message}</p>
          )}
        </div>
      </div>
    );
  }
  
  // Otherwise, render just the indicator with optional message
  return (
    <div className="flex flex-col items-center justify-center">
      {renderLoadingIndicator()}
      {message && (
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
}