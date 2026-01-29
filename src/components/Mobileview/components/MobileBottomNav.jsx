import React from "react";
import { Search, Heart, CircleUserRound } from "lucide-react";

function MobileBottomNav({ bottomNavVisible }) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-800/50 z-40 transition-transform duration-300 ${
      bottomNavVisible ? "translate-y-0" : "translate-y-full"
    }`}>
      <div className="flex items-center h-16 px-4">
        <div className="flex-1 flex items-center justify-center gap-10 ">
          <button className="flex flex-col items-center gap-1 text-airbnb ">
            <Search className="h-7 w-7 mb-0.5 cursor-pointer" />
            <span className="text-[11px] font-medium">Explore</span>
          </button>

          <button className="flex flex-col items-center px-10 gap-1 text-gray-500 dark:text-gray-300 transition-colors relative">
            <Heart className="h-7 w-7 mb-0.5 cursor-pointer" />
            <span className="text-[11px] font-medium">Wishlists</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-300 transition-colors ">
            <CircleUserRound className="h-7 w-7 mb-0.5 cursor-pointer" />
            <span className="text-[11px] font-medium">Log in</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileBottomNav;