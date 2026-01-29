// components/Header/components/SearchBar/CompactSearchBar.jsx
import React from "react";
import { Search } from "lucide-react";

function CompactSearchBar({ compactSearchRef, searchPillWidth }) {
  return (
    <div 
      ref={compactSearchRef}
      className="transition-all duration-300 ease-out"
      style={{ 
        width: searchPillWidth,
        maxWidth: '212.5px'
      }}
    >
      <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-md h-14 px-4 py-2 hover:shadow-lg transition-shadow duration-200 w-full">
        <button className="flex items-center justify-between w-full px-4">
          <div className="text-left flex-1">
            <div className="font-semibold text-gray-900 text-sm truncate">
              Anywhere
            </div>
          </div>
          
          <div className="h-6 w-px bg-gray-300 mx-4" />
          
          <div className="text-left flex-1">
            <div className="font-semibold text-gray-900 text-sm truncate">
              Any week
            </div>
          </div>
          
          <div className="h-6 w-px bg-gray-300 mx-4" />
          
          <div className="text-left flex-1 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900 text-sm truncate">
                Add guests
              </div>
            </div>
            
            <div className="bg-[#ff385c] p-2.5 rounded-full text-white ml-4">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default CompactSearchBar;