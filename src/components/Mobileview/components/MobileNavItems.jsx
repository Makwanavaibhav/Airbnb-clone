import React from "react";
import House from "../../../assets/logo/house.png";
import Experiences from "../../../assets/logo/Experience.png";
import Services from "../../../assets/logo/Services.png";

function MobileNavItems({ activeTab, onTabChange, navItemsVisible }) {
  const navItems = [
    { label: "Homes", icon: House },
    { label: "Experiences", icon: Experiences, badge: "NEW" },
    { label: "Services", icon: Services, badge: "NEW" },
  ];

  return (
    <div className="flex items-center justify-around w-full px-4 border-b border-gray-100 dark:border-gray-800">
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => onTabChange(item.label)}
          className="group relative flex flex-col items-center pb-3 transition-all flex-1"
        >
          {/* Logo Container - Hidden when scrolled */}
          <div className={`relative mb-2 transition-all duration-300 ${
            navItemsVisible ? "opacity-100 h-auto" : "opacity-0 h-0"
          }`}>
            <img
              src={item.icon}
              alt=""
              className="h-11 w-11 object-contain transition-transform duration-200 group-hover:scale-110"
            />
            {item.badge && navItemsVisible && (
              <span className="absolute -top-1 -right-6 bg-[#3d4c63] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border border-white/10">
                {item.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`text-[13px] font-medium transition-colors duration-200 ${
                activeTab === item.label
                  ? "text-black dark:text-white"
                  : "text-gray-500"
              }`}
            >
              {item.label}
            </span>
            {item.badge && !navItemsVisible && (
              <span className="bg-[#3d4c63] text-white text-[8px] font-bold px-1 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </div>

          {activeTab === item.label && (
            <div className="absolute bottom-0 w-12 h-[2.5px] bg-black dark:bg-white rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
}

export default MobileNavItems;