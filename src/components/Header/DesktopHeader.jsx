// components/Header/DesktopHeader.jsx
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
      <header 
        className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-300 ease-out border-b border-gray-200 dark:border-gray-800 ${
          showFullHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-1440px mx-auto px-6">
          <div className="flex justify-between py-4">
            
            <div>
              <img src={LongLogo} alt="Logo" className="h-8 w-auto" />
            </div>

            <NavItems activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex justify-end items-center gap-2">
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

          <div className="pb-4">
            <div className="flex justify-center">
              <SearchBar activeTab={activeTab} searchRef={searchRef} />
            </div>
          </div>
        </div>
      </header>

      <div 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
          isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ 
          backdropFilter: 'blur(10px)', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid rgba(229, 231, 235, 0.5)'
        }}
      >
        <div className="max-w-1440px mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <div>
              <img src={LongLogo} alt="Logo" className="h-7 w-auto" />
            </div>

            <div className="flex-1 flex justify-center px-4">
              <CompactSearchBar 
                compactSearchRef={compactSearchRef}
                searchPillWidth={searchPillWidth}
              />
            </div>

            <div className="flex items-center gap-3">
              <button className="text-sm font-semibold py-2.5 px-4 hover:bg-gray-100 rounded-full transition-colors">
                Become a host
              </button>
              
              <button className="flex items-center gap-1 p-2.5 hover:bg-gray-100 rounded-full transition-colors border border-gray-300">
                <Menu className="h-4 w-4 text-gray-900" />
                <User className="h-4 w-4 text-gray-900" />
              </button>
            </div>
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