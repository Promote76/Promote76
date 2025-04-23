import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import EnhancedDashboard from "./pages/EnhancedDashboard";

export default function App() {
  // Toggle between regular and enhanced dashboard
  const [useEnhancedUI, setUseEnhancedUI] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* UI Version Toggle (for development purposes) */}
      <div className="fixed top-0 right-0 m-2 z-50 bg-gray-50 bg-opacity-80 p-2 rounded shadow">
        <button 
          onClick={() => setUseEnhancedUI(!useEnhancedUI)}
          className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800"
        >
          {useEnhancedUI ? "Switch to Basic UI" : "Switch to Enhanced UI"}
        </button>
      </div>
      
      {/* Render either the basic or enhanced dashboard */}
      {useEnhancedUI ? <EnhancedDashboard /> : <Dashboard />}
    </div>
  );
}