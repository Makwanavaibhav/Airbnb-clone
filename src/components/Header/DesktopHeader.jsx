import React, { useState, useEffect, useRef } from "react";
import LongLogo from "../../assets/logo/long-logo.png";
import { Globe, Menu, User } from "lucide-react";
import LocaleModal from "../Header/LocaleModal/LocalModal.jsx";
import NavItems from "../Header/NavItems/NavItems.jsx";
import ThemeToggle from "../Header/ThemeToggle/ThemeToggle.jsx";
import SearchBar from "../Header/SearchBar/Searchbar.jsx";
import CompactSearchBar from "../Header/SearchBar/CompactSearchBar.jsx";
import HostDialog from "../Header/HostDialog/HostDialog.jsx";
import UserMenu from "../Header/UserMenu/UserMenu.jsx";

function DesktopHeader({ activeTab, setActiveTab }) {
  const [selectedHostType, setSelectedHostType] = useState(null);
  const [openLanguageModal, setOpenLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("USD - $");
  const [translateEnabled, setTranslateEnabled] = useState(true);
  const [activeLocaleTab, setActiveLocaleTab] = useState("language");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showFullHeader, setShowFullHeader] = useState(true);
  const [searchPillWidth, setSearchPillWidth] = useState("auto");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const searchRef = useRef(null);
  const compactSearchRef = useRef(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY < 50) {
            setShowFullHeader(true);
            setIsScrolled(false);
          } 
          else if (currentScrollY > lastScrollY.current) {
            setShowFullHeader(false);
            setIsScrolled(true);
          }
          else {
            setShowFullHeader(false);
            setIsScrolled(true);
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

  useEffect(() => {
    const updateSearchPillWidth = () => {
      if (searchRef.current && compactSearchRef.current) {
        const fullWidth = searchRef.current.offsetWidth;
        compactSearchRef.current.style.width = `${fullWidth}px`;
        setSearchPillWidth(`${fullWidth}px`);
      }
    };

    updateSearchPillWidth();
    window.addEventListener('resize', updateSearchPillWidth);
    
    const timeoutId = setTimeout(updateSearchPillWidth, 100);
    
    return () => {
      window.removeEventListener('resize', updateSearchPillWidth);
      clearTimeout(timeoutId);
    };
  }, [showFullHeader]);

  return (
    <>
      {/* Main fixed header */}
      <div className="fixed top-2 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        {/* Top row with logo, center content, and right buttons */}
        <div className="flex items-center justify-between px-8 h-16 dark:bg-gray-900">
          {/* Logo on left - Always visible */}
          <div className="shrink-0">
            <img src={LongLogo} alt="Airbnb" className="h-8 w-auto" />
          </div>

          {/* Center area - Shows either NavItems OR CompactSearchBar */}
          <div className="flex-1 mx-8 flex justify-center items-center">
            {isScrolled ? (
              <CompactSearchBar 
                compactSearchRef={compactSearchRef}
                searchPillWidth={searchPillWidth}
              />
            ) : (
              <NavItems activeTab={activeTab} setActiveTab={setActiveTab} />
            )}
          </div>

          {/* Right side buttons - Always visible */}
          <div className="flex items-center gap-4 shrink-0">
            <HostDialog 
              selectedHostType={selectedHostType}
              setSelectedHostType={setSelectedHostType}
            />
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            <button
              onClick={() => setOpenLanguageModal(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Globe size={18} className="text-gray-900 dark:text-gray-100" />
            </button>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      {/* Full Search Bar - Below header (hides when scrolled) */}
      <div 
        ref={searchRef}
        className={`sticky top-16 z-40 bg-white dark:bg-gray-900 transition-all duration-300 border-b border-gray-200 dark:border-gray-800 ${
          isScrolled 
            ? '-translate-y-full opacity-0 pointer-events-none' 
            : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="px-8 py-6">
          <div className="flex justify-center">
            <SearchBar activeTab={activeTab} />
          </div>
        </div>
      </div>

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