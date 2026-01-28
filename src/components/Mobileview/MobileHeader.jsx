import React, { useState, useEffect } from "react";
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
  const [navItemsVisible, setNavItemsVisible] = useState(true);
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navItems = [
    { label: "Homes", icon: House },
    { label: "Experiences", icon: Experiences, badge: "NEW" },
    { label: "Services", icon: Services, badge: "NEW" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // For nav tabs (hide logos when scrolled down)
      if (currentScrollY > 50) {
        setNavItemsVisible(false);
      } else {
        setNavItemsVisible(true);
      }
      
      // For bottom navigation (hide when scrolling down, show when scrolling up)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setBottomNavVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setBottomNavVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      <div className={`bg-white dark:bg-gray-900 pt-4 ${className}`}>
        <div className={`px-5 mb-6 transition-opacity duration-300 ${isScrolled ? "opacity-0" : "opacity-100"}`}>
          <div 
            className="flex items-center justify-center gap-2 w-full h-13 bg-white dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 shadow-[0_3px_12px_rgba(0,0,0,0.1)] transition-all duration-200 hover:ring-1 hover:ring-black dark:hover:ring-white cursor-pointer"
            onClick={() => {}}
          >
            <Search className="h-3 w-3 text-black dark:text-white stroke-[3px]" />
            <span className="text-black dark:text-white text-[13px] font-semibold">
              Search for homes
            </span>
          </div>
        </div>

        {/* Nav Tabs */}
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
      </div>

      {/* Mobile Bottom Navigation */}
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
    </>
  );
}

export default MobileHeader;