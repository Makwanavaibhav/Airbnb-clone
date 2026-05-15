import React, { useState, useEffect } from "react";
import MobileNavItems from "../Mobileview/components/MobileNavItems.jsx";
import MobileSearchBar from "../Mobileview/components/MobileSearchBar.jsx";
import MobileBottomNav from "../Mobileview/components/MobileBottomNav.jsx";
import Logo from "../../assets/logo/logo.png"; // We'll need a small icon logo like the airbnb a
import { useAuth } from "../../context/AuthContext.jsx";
import { User, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

function MobileHeader({ 
  activeTab, 
  onTabChange, 
  className = "" 
}) {
  const [scrolled, setScrolled] = useState(false);
  const [bottomNavVisible, setBottomNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

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
        <div className="pt-3 pb-2 px-4 flex items-center justify-between gap-3">
          {/* Logo - Left */}
          <div className="shrink-0">
            <img src={Logo} alt="Airbnb" className="h-8 w-8 object-contain cursor-pointer" onClick={() => navigate('/')} />
          </div>

          {/* Search Bar Pill - Center */}
          <div className="flex-1">
            <MobileSearchBar />
          </div>

          {/* Avatar/Menu - Right */}
          <div className="shrink-0 flex items-center">
            {isLoggedIn ? (
              <div 
                onClick={() => navigate('/profile')}
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
              >
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500"
              >
                <User size={18} />
              </button>
            )}
          </div>
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
          : 'calc(130px + env(safe-area-inset-top, 0px))' // Adjusted for new layout
      }} />

      {/* Bottom Navigation */}
      <MobileBottomNav bottomNavVisible={bottomNavVisible} />
    </>
  );
}

export default MobileHeader;