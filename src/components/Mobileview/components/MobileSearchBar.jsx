import React from "react";
import { Search } from "lucide-react";

function MobileSearchBar({ isScrolled }) {
  return (
    <div className={`px-5 mb-6 transition-opacity duration-300 ${isScrolled ? "opacity-0" : "opacity-100"}`}>
      <button 
        className="flex items-center justify-center gap-2 w-full h-13 bg-white dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 shadow-[0_3px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:ring-1 hover:ring-black dark:hover:ring-white cursor-pointer"
        onClick={() => {}}
      >
        <Search className="h-4 w-4 text-gray-900 dark:text-white stroke-[3px]" />
        <span className="text-gray-900 dark:text-white text-[13px] font-semibold">
          Search for homes
        </span>
      </button>
    </div>
  );
}

export default MobileSearchBar;