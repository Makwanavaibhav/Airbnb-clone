import React, { useState, useEffect, useRef } from "react";
import LongLogo from "../../assets/logo/long-logo.png";
import { Globe, Menu, User } from "lucide-react";
import LocaleModal from "../Header/LocaleModal/LocalModal.jsx";
import NavItems from "../Header/NavItems/NavItems.jsx";
import SearchBar from "../Header/SearchBar/Searchbar.jsx";
import HostDialog from "../Header/HostDialog/HostDialog.jsx";
import UserMenu from "../Header/UserMenu/UserMenu.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function DesktopHeader({ activeTab, setActiveTab }) {
  const { isLoggedIn } = useAuth();
  const [selectedHostType, setSelectedHostType] = useState(null);
  const [openLanguageModal, setOpenLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("USD - $");
  const [translateEnabled, setTranslateEnabled] = useState(true);
  const [activeLocaleTab, setActiveLocaleTab] = useState("language");
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY < 50) {
            setIsScrolled(false);
          } else {
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
            {isScrolled ? (
              <SearchBar
                variant="compact"
                activeTab={activeTab}
              />
            ) : (
              <NavItems activeTab={activeTab} setActiveTab={setActiveTab} />
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
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                V
              </div>
            )}
            <UserMenu onOpenLanguageModal={() => setOpenLanguageModal(true)} />
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
      
      {/* Search Section - Updated borders */}
      <div 
        className={`sticky top-16 z-40 bg-white dark:bg-gray-900 transition-all duration-300 border-b border-gray-200 dark:border-gray-800 ${
          isScrolled
            ? "-translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="px-8 py-6">
          <div className="flex justify-center">
            <SearchBar activeTab={activeTab} searchRef={searchRef} />
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