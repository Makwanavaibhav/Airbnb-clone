import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

function MobileSearchBar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`px-6 transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <button 
        className={`flex items-center justify-center gap-3 w-full h-13 rounded-full transition-all duration-200 cursor-pointer group ${
          isScrolled 
            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-[0_4px_12px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)] dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.4)]' 
            : 'bg-white dark:bg-gray-800 border border-white/20 dark:border-gray-700/60 shadow-[0_6px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.45)]'
        } hover:ring-1 hover:ring-black dark:hover:ring-white hover:ring-opacity-20 dark:hover:ring-opacity-30 active:scale-[0.98]`}
        onClick={() => {}}
      >
        <Search className="h-4.5 w-4.5 text-gray-900 dark:text-white stroke-[2.5px]" />
        <span className="text-gray-900 dark:text-white text-[14px] font-semibold">
          Search for homes
        </span>
      </button>
    </div>
  );
}

export default MobileSearchBar;