import React, { useState, useEffect, useRef } from "react";
import LongLogo from "../../assets/logo/long-logo.png";
import { Globe, Menu, User } from "lucide-react";
import LocaleModal from "../Header/LocaleModal/LocalModal.jsx";
import NavItems from "../Header/NavItems/NavItems.jsx";
import SearchBar from "../Header/SearchBar/Searchbar.jsx";
import HostDialog from "../Header/HostDialog/HostDialog.jsx";
import UserMenu from "../Header/UserMenu/UserMenu.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

import { useLocation, useNavigate } from "react-router-dom";

function DesktopHeader({ activeTab, setActiveTab }) {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const isHotelPage = location.pathname.startsWith("/hotel/");
  const isExperiencePage = location.pathname.startsWith("/experience/");
  const showSearchBar = isHomePage || isHotelPage || isExperiencePage;
  
  const [selectedHostType, setSelectedHostType] = useState(null);
  const [openLanguageModal, setOpenLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("USD - $");
  const [translateEnabled, setTranslateEnabled] = useState(true);
  const [activeLocaleTab, setActiveLocaleTab] = useState("language");
  const [isScrolled, setIsScrolled] = useState(false);
  const [forceExpand, setForceExpand] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const searchRef = useRef(null);

  useEffect(() => {
    setForceExpand(false);
    setIsScrolled(window.scrollY > 50);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY < 50) {
            setIsScrolled(false);
          } else {
            setIsScrolled(true);
            setForceExpand(false); // Close expanded search on scroll
          }
          
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isFullOpen = isHomePage ? (!isScrolled || forceExpand) : forceExpand;



  return (
    <>
      {/* Fixed Header - Updated borders */}
      <div className="fixed py-2 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-8 h-16 dark:bg-gray-900">
          <div className="shrink-0">
            <img src={LongLogo} alt="Airbnb" className="h-8 w-auto" />
          </div>

          {/* Center area */}
          <div className="flex-1 mx-8 flex justify-center items-center">
            {showSearchBar && (
              isFullOpen ? (
                isHomePage ? <NavItems activeTab={activeTab} setActiveTab={setActiveTab} /> : <div className="h-10"></div>
              ) : (
                <SearchBar
                  variant="compact"
                  activeTab={activeTab}
                  onExpand={(e) => {
                    if (e) e.stopPropagation();
                    setForceExpand(true);
                  }}
                />
              )
            )}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden min-[1150px]:block">
              <HostDialog 
                selectedHostType={selectedHostType}
                setSelectedHostType={setSelectedHostType}
              />
            </div>
            {!isLoggedIn ? (
              <button
                onClick={() => setOpenLanguageModal(true)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent dark:border-gray-700"
              >
                <Globe size={18} className="text-gray-900 dark:text-gray-100" />
              </button>
            ) : (
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
            )}
            <UserMenu onOpenLanguageModal={() => setOpenLanguageModal(true)} />
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
      
      {/* Search Section - Updated borders */}
      {/* Search Section - Updated borders */}
      {showSearchBar && (
        <div 
          className={`${isHomePage ? 'sticky' : 'absolute left-0 right-0 shadow-lg'} top-16 z-40 bg-white dark:bg-gray-900 transition-all duration-300 border-b border-gray-200 dark:border-gray-800 ${
            !isFullOpen
              ? "-translate-y-full opacity-0 pointer-events-none invisible"
              : "translate-y-0 opacity-100 visible"
          }`}
        >
          <div className="px-8 py-6">
            <div className="flex justify-center">
              <SearchBar activeTab={activeTab} searchRef={searchRef} />
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close forceExpand when clicking outside */}
      {forceExpand && (
        <div 
          className="fixed inset-0 top-[180px] z-30 bg-black/25" 
          onClick={() => setForceExpand(false)}
        />
      )}

      <LocaleModal
        open={openLanguageModal}
        onOpenChange={setOpenLanguageModal}
        activeLocaleTab={activeLocaleTab}
        setActiveLocaleTab={setActiveLocaleTab}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        translateEnabled={translateEnabled}
        setTranslateEnabled={setTranslateEnabled}
      />
    </>
  );
}

export default DesktopHeader;