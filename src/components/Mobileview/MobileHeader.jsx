import React from "react";
import House from "../../assets/logo/house.png";
import Experiences from "../../assets/logo/Experience.png";
import Services from "../../assets/logo/Services.png";
import { Search, Heart, CircleUserRound } from "lucide-react";

function MobileHeader({ 
  activeTab, 
  onTabChange, 
  isScrolled,
  className = "" 
}) {
  const navItems = [
    { label: "Homes", icon: House },
    { label: "Experiences", icon: Experiences, badge: "NEW" },
    { label: "Services", icon: Services, badge: "NEW" },
  ];

  return (
    <>
      {/* Mobile Navigation Tabs */}
      <div className={`md:hidden ${isScrolled ? "opacity-0" : "opacity-100"} transition-opacity duration-300 mt-4 ${className}`}>
        <div className="flex items-center justify-between w-full px-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onTabChange(item.label)}
              className="group relative flex flex-col items-center pb-2 transition-all flex-1"
            >
              <div className="relative mb-1">
                <img
                  src={item.icon}
                  alt=""
                  className={`h-8 w-8 object-contain transition-transform duration-200 cursor-pointer ${activeTab !== item.label ? 'group-hover:scale-110' : ''}`}
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-3 bg-[#22223b] dark:bg-gray-200 text-white dark:text-gray-900 text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-xs font-medium text-gray-800 dark:text-gray-200 transition-opacity duration-200 ${
                  activeTab === item.label
                    ? "opacity-100"
                    : "opacity-60 group-hover:opacity-100"
                }`}
              >
                {item.label}
              </span>

              {activeTab === item.label && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-black dark:bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-800/50 z-40">
        <div className="flex items-center h-16 px-4">
          <div className="flex-1 flex items-center justify-around">
            <button className="flex flex-col items-center gap-1 p-2 text-airbnb flex-1">
              <Search className="h-6 w-6 mb-0.5 cursor-pointer" />
              <span className="text-xs font-medium">Explore</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 p-2 text-gray-700 dark:text-gray-300 transition-colors relative flex-1">
              <Heart className="h-6 w-6 mb-0.5 cursor-pointer" />
              <span className="text-xs font-medium">Wishlists</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 p-2 text-gray-700 dark:text-gray-300 transition-colors flex-1">
              <CircleUserRound className="h-6 w-6 mb-0.5 cursor-pointer" />
              <span className="text-xs font-medium">Log in</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileHeader;
