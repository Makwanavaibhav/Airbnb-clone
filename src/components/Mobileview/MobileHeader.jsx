import React, { useState, useEffect } from "react";
import MobileNavItems from "../Mobileview/components/MobileNavItems.jsx";
import MobileSearchBar from "../Mobileview/components/MobileSearchBar.jsx";
import MobileBottomNav from "../Mobileview/components/MobileBottomNav.jsx";

function MobileHeader({ 
  activeTab, 
  onTabChange, 
  className = "" 
}) {
  const [scrolled, setScrolled] = useState(false);
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide logos when scrolled, show when at top
      if (currentScrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
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
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      {/* Fixed Header with Search Bar and Navigation Tabs */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white dark:bg-gray-900 shadow-md' 
            : 'bg-white dark:bg-gray-900'
        } ${className}`}
      >
        <div className="pt-3 pb-2">
          {/* Search Bar - Always visible */}
          <MobileSearchBar />
        </div>
        
        {/* Navigation Tabs - Logos will hide on scroll */}
        <MobileNavItems 
          activeTab={activeTab}
          onTabChange={onTabChange}
          navItemsVisible={!scrolled} // Pass the opposite of scrolled state
        />
      </div>

      {/* Spacer to prevent content from being hidden behind fixed header */}
      <div className="pt-safe-top" style={{ 
        height: scrolled 
          ? 'calc(80px + env(safe-area-inset-top, 0px))'
          : 'calc(150px + env(safe-area-inset-top, 0px))' // Larger when logos visible
      }} />

      {/* Bottom Navigation */}
      <MobileBottomNav bottomNavVisible={bottomNavVisible} />
    </>
  );
}

export default MobileHeader;