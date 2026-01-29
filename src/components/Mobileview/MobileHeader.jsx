import React, { useState, useEffect } from "react";
import MobileNavItems from "../Mobileview/components/MobileNavItems.jsx";
import MobileSearchBar from "../Mobileview/components/MobileSearchBar.jsx";
import MobileBottomNav from "../Mobileview/components/MobileBottomNav.jsx";

function MobileHeader({ 
  activeTab, 
  onTabChange, 
  isScrolled,
  className = "" 
}) {
  const [navItemsVisible, setNavItemsVisible] = useState(true);
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
        {/* Search Bar */}
        <MobileSearchBar isScrolled={isScrolled} />
        
        {/* Navigation Tabs */}
        <MobileNavItems 
          activeTab={activeTab}
          onTabChange={onTabChange}
          navItemsVisible={navItemsVisible}
        />
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav bottomNavVisible={bottomNavVisible} />
    </>
  );
}

export default MobileHeader;