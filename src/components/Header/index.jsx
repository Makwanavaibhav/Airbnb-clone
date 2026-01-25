import React, { useState, useEffect } from "react";
import LongLogo from "../../assets/logo/long-logo.png";
import ShortLogo from "../../assets/logo/logo.png";
import House from "../../assets/logo/house.png";
import Experiences from "../../assets/logo/Experience.png";
import Services from "../../assets/logo/Services.png";
import { Search, Globe, Menu } from "lucide-react";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("Homes");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Homes", icon: House },
    { label: "Experiences", icon: Experiences, badge: "NEW" },
    { label: "Services", icon: Services, badge: "NEW" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white pt-6 pb-4 transition-all">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <img src={LongLogo} alt="Logo" className="h-8 w-auto hidden md:block" />
            <img src={ShortLogo} alt="Logo" className="h-8 w-auto block md:hidden" />
          </div>
          <div className="flex items-center gap-8">
          {navItems.map((item) => (
          <button
          key={item.label}
          onClick={() => setActiveTab(item.label)}
          className="group relative flex items-center gap-2 pb-2 transition-all"
         >
      {/* Icon Container - Always full opacity */}
      <div className="relative opacity-100">
        <img src={item.icon} alt="" className="h-10 w-10 object-contain" />
        {item.badge && (
          <span className="absolute -top-1 -right-6 bg-[#22223b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            {item.badge}
          </span>
        )}
      </div>

      {/* Label - Conditional opacity */}
      <span 
        className={`text-base Cerealnormal text-gray-800 transition-opacity duration-200 ${
          activeTab === item.label 
            ? "opacity-100" 
            : "opacity-50 group-hover:opacity-100"
           }`}
           >
           {item.label}
      </span>

           {/* Underline - Only shows for active tab */}
           {activeTab === item.label && (
           <div className="absolute bottom-0 left-0 w-full h-0.75 bg-black rounded-full" />
          )}
         </button>
         ))}
         </div>

          {/* Right Side */}
          <div className="flex-1 flex justify-end items-center gap-2">
            <button className="text-sm font-semibold py-3 px-4 hover:bg-gray-100 rounded-full">
              Become a host
            </button>
            <div className="p-3 hover:bg-gray-100 rounded-full cursor-pointer">
              <Globe className="h-5 w-5" />
            </div>
            <div className="p-3 hover:bg-gray-100 rounded-full cursor-pointer">
              <Menu className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* SEARCH BAR ROW */}
      <div className={`mt-4 flex justify-center transition-all duration-300 ${isScrolled ? "scale-90 opacity-0 h-0 overflow-hidden" : "scale-100 opacity-100"}`}>
     <div className="flex items-center w-full max-w-212.5 border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow bg-white h-[66px]">
    
       {/* Where */}
      <button className="flex-1 flex flex-col items-start px-8 py-2 hover:bg-gray-100 rounded-full text-left h-full justify-center transition-colors">
       <span className="text-xs font-semibold text-black">Where</span>
       <span className="text-sm text-gray-500">Search destinations</span>
      </button>

       <div className="h-8 w-px bg-gray-200" />

     {/* When */}
     <button className="flex-1 flex flex-col items-start px-8 py-2 hover:bg-gray-100 rounded-full text-left h-full justify-center transition-colors">
      <span className="text-xs font-semibold text-black">When</span>
      <span className="text-sm text-gray-500">Add dates</span>
     </button>

                <div className="h-8 w-px bg-gray-200" />

         {/* Who / Services */}
          <button className="flex-[1.2] flex items-center justify-between pl-8 pr-2 hover:bg-gray-100 rounded-full text-left h-full group transition-colors">
            <div className="flex flex-col">
             <span className="text-xs font-semibold text-black">
             {activeTab === "Services" ? "Type of services" : "Who"}
             </span>
             <span className="text-sm text-gray-500">
             {activeTab === "Services" ? "Add services" : "Add guests"}
             </span>
             </div>
             <div className="bg-[#ff385c] p-4 rounded-full text-white transition-all group-hover:bg-[#e31c5f]">
             <Search className="h-5 w-5 stroke-[3px]" />
           </div>
          </button>
         </div>
        </div>
      </div>
    </header>
  );
}

export default Header;