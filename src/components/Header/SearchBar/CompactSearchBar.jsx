import React from "react";
import { Search } from "lucide-react";
import houseLogo from "../../../assets/logo/house.png";

function CompactSearchBar({ compactSearchRef, searchPillWidth }) {
  return (
    <div 
      ref={compactSearchRef}
      className="transition-all duration-300 ease-out"
      style={{ 
        width: searchPillWidth,
        maxWidth: '400px'
      }}
    >
      <button className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg h-16 hover:shadow-xl transition-all duration-200 w-full border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* First section - Anywhere */}
        <div className="flex items-center justify-center flex-1 py-3 px-4 border-r border-gray-200 dark:border-gray-700 min-w-0">
          <img 
            src={houseLogo} 
            alt="House logo" 
            className="h-8 w-8 object-contain shrink-0 mr-3"
          />
          <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm text-center">
            Anywhere
          </div>
        </div>
        
        {/* Second section - Anytime */}
        <div className="flex items-center justify-center flex-1 py-3 px-4 border-r border-gray-200 dark:border-gray-700">
          <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm text-center">
            Anytime
          </div>
        </div>
        
        {/* Third section - Add guests with search button */}
        <div className="flex items-center justify-between flex-1 py-3 px-4">
          <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">
            Add guests
          </div>
          
          <div className="bg-airbnb p-3 rounded-full text-white hover:bg-red-600 transition-colors ml-4 shrink-0">
            <Search className="h-4 w-4" strokeWidth={3} />
          </div>
        </div>
        
      </button>
    </div>
  );
}

export default CompactSearchBar;