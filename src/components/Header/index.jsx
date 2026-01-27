import React, { useState, useEffect } from "react";
import LongLogo from "../../assets/logo/long-logo.png";
import ShortLogo from "../../assets/logo/logo.png";
import House from "../../assets/logo/house.png";
import Experiences from "../../assets/logo/Experience.png";
import Services from "../../assets/logo/Services.png";
import Host from "../../assets/logo/host.png";
import MobileHeader from "../Mobileview/MobileHeader";
import { Search, Globe, Menu, CircleQuestionMark, Sun, Moon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog.jsx";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("Homes");
  const [selectedHostType, setSelectedHostType] = useState(null);
  const [openLanguageModal, setOpenLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("USD - $");
  const [translateEnabled, setTranslateEnabled] = useState(true);
  const [activeLocaleTab, setActiveLocaleTab] = useState("language");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 800);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const navItems = [
    { label: "Homes", icon: House },
    { label: "Experiences", icon: Experiences, badge: "NEW" },
    { label: "Services", icon: Services, badge: "NEW" },
  ];

  const hostOptions = [
    { id: "home", label: "Home", icon: House, description: "Rent out your property" },
    { id: "experience", label: "Experience", icon: Experiences, description: "Host activities and tours" },
    { id: "service", label: "Service", icon: Services, description: "Offer professional services" },
  ];

  const languages = [
    { language: "English", region: "United Kingdom" },
    { language: "Azerbaycan dili", region: "Azerbaycan" },
    { language: "Bahasa Indonesia", region: "Indonesia" },
    { language: "Cmogorski", region: "Crna Gora" },
    { language: "Dansk", region: "Danmark" },
    { language: "Deutsch", region: "Luxemburg" },
    { language: "Eesti", region: "Eesti" },
    { language: "Bosanski", region: "Bosna i Hercegovina" },
    { language: "Deutsch", region: "Deutschland" },
    { language: "English", region: "Australia" },
    { language: "Català", region: "Espanya" },
    { language: "Deutsch", region: "Österreich" },
    { language: "English", region: "Canada" },
  ];

  const currencies = [
    { name: "Australian dollar", code: "AUD", symbol: "$" },
    { name: "Brazilian real", code: "BRL", symbol: "R$" },
    { name: "Bulgarian lev", code: "BGN", symbol: "лв." },
    { name: "Canadian dollar", code: "CAD", symbol: "$" },
    { name: "Chinese yuan", code: "CNY", symbol: "¥" },
    { name: "Colombian peso", code: "COP", symbol: "$" },
    { name: "Costa Rican colon", code: "CRC", symbol: "₡" },
    { name: "Czech koruna", code: "CZK", symbol: "Kč" },
    { name: "Egyptian pound", code: "EGP", symbol: "E£" },
    { name: "Emirati dirham", code: "AED", symbol: "د.إ" },
    { name: "Euro", code: "EUR", symbol: "€" },
    { name: "Ghanaian cedi", code: "GHS", symbol: "₵" },
    { name: "Hungarian forint", code: "HUF", symbol: "Ft" },
    { name: "Indonesian rupiah", code: "IDR", symbol: "Rp" },
    { name: "Israeli new shekel", code: "ILS", symbol: "₪" },
    { name: "Japanese yen", code: "JPY", symbol: "¥" },
    { name: "Kenyan shilling", code: "KES", symbol: "KSh" },
    { name: "Malaysian ringgit", code: "MYR", symbol: "RM" },
    { name: "Mexican peso", code: "MXN", symbol: "$" },
    { name: "Moroccan dirham", code: "MAD", symbol: "د.م." },
    { name: "New Zealand dollar", code: "NZD", symbol: "$" },
    { name: "Norwegian krone", code: "NOK", symbol: "kr" },
    { name: "Peruvian sol", code: "PEN", symbol: "S/" },
    { name: "Philippine peso", code: "PHP", symbol: "₱" },
    { name: "Pound sterling", code: "GBP", symbol: "£" },
    { name: "Qatari riyal", code: "QAR", symbol: "ر.ق" },
    { name: "Romanian leu", code: "RON", symbol: "lei" },
    { name: "Saudi riyal", code: "SAR", symbol: "ر.س" },
    { name: "Singapore dollar", code: "SGD", symbol: "$" },
    { name: "South African rand", code: "ZAR", symbol: "R" },
    { name: "South Korean won", code: "KRW", symbol: "₩" },
    { name: "Swedish krona", code: "SEK", symbol: "kr" },
    { name: "Swiss franc", code: "CHF", symbol: "CHF" },
    { name: "Thai baht", code: "THB", symbol: "฿" },
    { name: "Turkish lira", code: "TRY", symbol: "₺" },
    { name: "US dollar", code: "USD", symbol: "$" },
  ];

  const suggestedLanguages = [
    { language: "English", region: "India" },
    { language: "English", region: "United States" },
    { language: "हिन्दी", region: "भारत" },
  ];

  const localeTabs = [
    { id: "language", label: "Language and region" },
    { id: "currency", label: "Currency" },
  ];

  const searchOptions = [
    { key: "where", title: "Where", subtitle: "Search destinations" },
    { key: "when", title: "When", subtitle: "Add dates" },
    {
      key: "who",
      title: activeTab === "Services" ? "Type of services" : "Who",
      subtitle: activeTab === "Services" ? "Add services" : "Add guests"
    },
  ];

  // If it's mobile view, only show the MobileHeader component
  if (isMobile) {
    return <MobileHeader />;
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 pt-6 pb-4 transition-all duration-300 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-1440px mx-auto px-6">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div>
            <img src={LongLogo} alt="Logo" className="h-8 w-auto hidden md:block" />
            <img src={ShortLogo} alt="Logo" className="h-8 w-auto block md:hidden" />
          </div>

          {/* Center Nav */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className="group relative flex items-center gap-2 pb-2 transition-all"
              >
                <div className="relative opacity-100">
                  <img
                    src={item.icon}
                    alt=""
                    className="h-10 w-10 object-contain"
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

          <div className="flex justify-end items-center gap-2">
            {/* Become a Host Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-sm font-semibold py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  Become a host
                </button>
              </DialogTrigger>
              
              <DialogContent className="w-[90vw] max-w-5xl min-h-100 rounded-2xl p-8 md:p-12 bg-white dark:bg-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-semibold text-center text-gray-900 dark:text-gray-100">
                    What would you like to host?
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {hostOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedHostType(option.id)}
                      className={`border-2 rounded-2xl p-8 md:p-10 flex flex-col items-center gap-4 hover:border-black dark:hover:border-white transition-all duration-200 ${
                        selectedHostType === option.id 
                          ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700 shadow-md" 
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <img 
                        src={option.icon} 
                        alt={option.label} 
                        className="h-24 w-auto object-contain" 
                      />
                      
                      <div className="text-center">
                        <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{option.label}</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-10 flex justify-end">
                  <button
                    onClick={() => {
                      console.log("Selected:", selectedHostType);
                    }}
                    disabled={!selectedHostType}
                    className={`px-8 py-3 rounded-lg transition-colors ${
                      selectedHostType
                        ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200" 
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-gray-900 dark:text-gray-100" />
              ) : (
                <Moon className="h-4 w-4 text-gray-900 dark:text-gray-100" />
              )}
            </button>

            {/* Globe Button */}
            <button
              onClick={() => setOpenLanguageModal(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <Globe size={18} className="text-gray-900 dark:text-gray-100" />
            </button>

            {/* Globe Dialog */}
            <Dialog open={openLanguageModal} onOpenChange={setOpenLanguageModal}>
              <DialogContent className="w-[95vw] max-w-5xl h-[85vh] p-0 rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                <div className="flex items-center gap-8 px-10 py-6 border-b border-gray-200 dark:border-gray-600">
                  {localeTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveLocaleTab(tab.id)}
                      className={`pb-2 text-[16px] font-medium border-b-2 transition-colors ${
                        activeLocaleTab === tab.id
                          ? "border-black dark:border-white text-gray-900 dark:text-gray-100"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-10 overflow-y-auto h-[calc(85vh-5rem)]">
                  {activeLocaleTab === "language" && (
                    <>
                      <div className="mb-10 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Translate descriptions and reviews to English
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Automatically translate content.
                          </p>
                        </div>

                        <button
                          onClick={() => setTranslateEnabled(!translateEnabled)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                            translateEnabled ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-600"
                          }`}
                          aria-label={translateEnabled ? "Disable translation" : "Enable translation"}
                          role="switch"
                          aria-checked={translateEnabled}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                              translateEnabled ? "translate-x-8" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                        Suggested languages and regions
                      </h3>

                      <div className="grid grid-cols-3 gap-4 mb-10">
                        {suggestedLanguages.map((item) => (
                          <button
                            key={`${item.language}-${item.region}`}
                            onClick={() => {
                              setSelectedLanguage(item.language);
                              setOpenLanguageModal(false);
                            }}
                            className="p-4 rounded-xl border hover:border-black dark:hover:border-white text-left transition-colors"
                          >
                            <p className="font-medium text-gray-900 dark:text-gray-100">{item.language}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.region}</p>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {languages.map((item) => (
                          <button
                            key={`${item.language}-${item.region}`}
                            onClick={() => {
                              setSelectedLanguage(item.language);
                              setOpenLanguageModal(false);
                            }}
                            className="p-4 rounded-xl border hover:border-black dark:hover:border-white text-left flex justify-between transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{item.language}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.region}</p>
                            </div>

                            {selectedLanguage === item.language && (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M5 13l4 4L19 7"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-black dark:text-white"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {activeLocaleTab === "currency" && (
                    <>
                      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                        Choose a currency
                      </h2>

                      <div className="grid grid-cols-3 gap-4">
                        {currencies.map((currency) => (
                          <button
                            key={`${currency.code}-${currency.name}`}
                            onClick={() =>
                              setSelectedCurrency(`${currency.code} - ${currency.symbol}`)
                            }
                            className={`p-4 rounded-xl border text-left transition-all ${
                              selectedCurrency === `${currency.code} - ${currency.symbol}`
                                ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400"
                            }`}
                          >
                            <p className="font-medium text-gray-900 dark:text-gray-100">{currency.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {currency.code} – {currency.symbol}
                            </p>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer focus-visible:outline-none transition-colors"
                >
                  <Menu className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-64 z-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <DropdownMenuItem className="py-3 text-gray-900 dark:text-gray-100">
                  <CircleQuestionMark className="mr-2 h-4 w-4" />Help Center
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem className="py-3 focus:bg-gray-100 dark:focus:bg-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">Become a host</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">It's easy to start hosting and earn extra income.</p>
                    </div>
                    <img src={Host} alt="Host" className="w-10 h-10 object-contain" />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="py-3 focus:bg-gray-100 dark:focus:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 dark:text-gray-100">Refer a Host</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="py-3 focus:bg-gray-100 dark:focus:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 dark:text-gray-100">Find a co-host</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="py-3 focus:bg-gray-100 dark:focus:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 dark:text-gray-100">Log in or sign up</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* SEARCH BAR ROW */}
        <div
          className={`mt-4 flex justify-center transition-all duration-300 ${
            isScrolled
              ? "scale-90 opacity-0 h-0 overflow-hidden"
              : "scale-100 opacity-100"
          }`}
        >
          <div className="flex items-center w-full max-w-212.5 border border-gray-200 dark:border-gray-600 rounded-full shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 h-16.5">
            
            {searchOptions.map((option, index) => (
              <React.Fragment key={option.key}>
                {index > 0 && <div className="h-8 w-px bg-gray-200 dark:bg-gray-600" />}
                
                <button 
                  className={`flex items-center justify-between px-8 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-left h-full transition-colors ${
                    option.key === "who" ? "flex-[1.2]" : "flex-1"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {option.title}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {option.subtitle}
                    </span>
                  </div>
                  
                  {option.key === "who" && (
                    <div className="bg-[#ff385c] p-4 rounded-full text-white transition-all hover:bg-[#e31c5f]">
                      <Search className="h-5 w-5 stroke-[3px]" />
                    </div>
                  )}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <MobileHeader />
    </header>
  );
}

export default Header;