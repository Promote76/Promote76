import React from "react";

export function Card({ className, ...props }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={`p-6 ${className}`} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={`p-6 border-b border-gray-200 ${className}`} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={`p-6 border-t border-gray-200 ${className}`} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={`text-sm text-gray-500 ${className}`} {...props} />;
}