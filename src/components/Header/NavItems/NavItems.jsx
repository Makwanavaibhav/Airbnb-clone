// components/Header/components/NavItems/NavItems.jsx
import React from "react";
import house from "../../../assets/logo/house.png";
import Experiences from "../../../assets/logo/Experience.png";
import Services from "../../../assets/logo/Services.png";

function NavItems({ activeTab, setActiveTab }) {
  const navItems = [
    { label: "Homes", icon: house },
    { label: "Experiences", icon: Experiences, badge: "NEW" },
    { label: "Services", icon: Services, badge: "NEW" },
  ];

  return (
    <div className="flex items-center gap-8">
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => setActiveTab(item.label)}
          className="group relative flex items-center gap-2 pb-2"
        >
          <div className="relative">
            <img
              src={item.icon}
              alt=""
              className="h-10 w-10 object-contain group-hover:scale-125 transition-transform duration-200"
            />
            {item.badge && (
              <span className="absolute -top-1 -right-6 bg-[#22223b] dark:bg-gray-200 text-white dark:text-gray-900 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                {item.badge}
              </span>
            )}
          </div>

          <span
            className={`text-base Cerealnormal text-gray-800 dark:text-gray-200 transition-opacity duration-200 ${
              activeTab === item.label
                ? "opacity-100"
                : "opacity-50 group-hover:opacity-100"
            }`}
          >
            {item.label}
          </span>

          {activeTab === item.label && (
            <div className="absolute bottom-0 left-0 w-full h-0.75 bg-black dark:bg-white rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

export default NavItems;