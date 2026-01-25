import React, { useState, useEffect } from "react";
import LongLogo from "../../assets/logo/long-logo.png";
import ShortLogo from "../../assets/logo/logo.png";
import House from "../../assets/logo/house.png";
import Experiences from "../../assets/logo/Experience.png";
import Services from "../../assets/logo/Services.png";
import Host  from "../../assets/logo/host.png";
import { Search, Globe, Menu, CircleQuestionMark, UserPlus, Users, Home } from "lucide-react";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuTrigger,} from "../ui/dropdown-menu.jsx";
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger,} from "../ui/dialog.jsx";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("Homes");
  const [selectedHostType, setSelectedHostType] = useState(null);
  const [openLanguageModal, setOpenLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedCurrency, setSelectedCurrency] = useState("USD - $");
  const [translateEnabled, setTranslateEnabled] = useState(true);
  const [activeLocaleTab, setActiveLocaleTab] = useState("language");

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

  return (
    <header className="sticky top-0 z-50 bg-white pt-6 pb-4 transition-all">
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
                    <span className="absolute -top-1 -right-6 bg-[#22223b] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-base Cerealnormal text-gray-800 transition-opacity duration-200 ${
                    activeTab === item.label
                      ? "opacity-100"
                      : "opacity-50 group-hover:opacity-100"
                  }`}
                >
                  {item.label}
                </span>

                {activeTab === item.label && (
                  <div className="absolute bottom-0 left-0 w-full h-0.75 bg-black rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-end items-center gap-2">
            {/* Become a Host Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-sm font-semibold py-3 px-4 hover:bg-gray-100 rounded-full">
                  Become a host
                </button>
              </DialogTrigger>
              
              <DialogContent className="w-[90vw] max-w-5xl min-h-100 rounded-2xl p-8 md:p-12">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-semibold text-center">
                    What would you like to host?
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {hostOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedHostType(option.id)}
                      className={`border-2 rounded-2xl p-8 md:p-10 flex flex-col items-center gap-4 hover:border-black transition-all duration-200 ${
                        selectedHostType === option.id 
                          ? "border-black bg-gray-50 shadow-md" 
                          : "border-gray-200"
                      }`}
                    >
                      <img 
                        src={option.icon} 
                        alt={option.label} 
                        className="h-24 w-auto object-contain" 
                      />
                      
                      <div className="text-center">
                        <span className="text-lg font-medium">{option.label}</span>
                        <p className="text-sm text-gray-500 mt-2">{option.description}</p>
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
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Globe Button */}
            <button
              onClick={() => setOpenLanguageModal(true)}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <Globe size={18} />
            </button>

            {/* Globe Dialog */}
            <Dialog open={openLanguageModal} onOpenChange={setOpenLanguageModal}>
              <DialogContent className="w-[95vw] max-w-5xl h-[85vh] p-0 rounded-2xl overflow-hidden shadow-2xl">

                <div className="flex items-center gap-8 px-10 py-6 border-b border-gray-200">
                  {localeTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveLocaleTab(tab.id)}
                      className={`pb-2 text-[16px] font-medium border-b-2 ${
                        activeLocaleTab === tab.id
                          ? "border-black text-black"
                          : "border-transparent text-gray-500 hover:text-black"
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
                       <h3 className="text-lg font-semibold">
                          Translate descriptions and reviews to English
                       </h3>
                      <p className="text-sm text-gray-500">
                      Automatically translate content.
                      </p>
                    </div>

                   <button
                   onClick={() => setTranslateEnabled(!translateEnabled)}
    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
      translateEnabled ? "bg-black" : "bg-gray-300"
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

                      <h3 className="text-lg font-semibold mb-4">
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
                            className="p-4 rounded-xl border hover:border-black text-left"
                          >
                            <p className="font-medium">{item.language}</p>
                            <p className="text-sm text-gray-500">{item.region}</p>
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
                            className="p-4 rounded-xl border hover:border-black text-left flex justify-between"
                          >
                            <div>
                              <p className="font-medium">{item.language}</p>
                              <p className="text-sm text-gray-500">{item.region}</p>
                            </div>

                            {selectedLanguage === item.language && (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M5 13l4 4L19 7"
                                  stroke="black"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
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
                      <h2 className="text-2xl font-semibold mb-6">
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
                                ? "border-black bg-gray-50"
                                : "border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            <p className="font-medium">{currency.name}</p>
                            <p className="text-sm text-gray-500">
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
                  className="p-3 hover:bg-gray-100 rounded-full cursor-pointer focus-visible:outline-none">
                  <Menu className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-64 z-50">
                <DropdownMenuItem className=" py-3"><CircleQuestionMark />Help Center </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem className="py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <span className="font-medium">Become a host</span>
                      <p className="text-xs text-gray-500 mt-0.5">It's easy to start hosting and earn extra income.</p>
                    </div>
                    <img src={Host} alt="Host" className="w-10 h-10 object-contain" />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="py-3">
                  <div className="flex items-center gap-3">
                    <span>Refer a Host</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem className="py-3">
                  <div className="flex items-center gap-3">
                    <span>Find a co-host</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Help item */}
                <DropdownMenuItem className="py-3">
                  <div className="flex items-center gap-3">
                    <span>Log in or sign up</span>
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
          <div className="flex items-center w-full max-w-212.5 border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow bg-white h-[66px]">
            
            {searchOptions.map((option, index) => (
              <React.Fragment key={option.key}>
                {index > 0 && <div className="h-8 w-px bg-gray-200" />}
                
                <button 
                  className={`flex items-center justify-between px-8 py-2 hover:bg-gray-200 rounded-full text-left h-full transition-colors ${
                    option.key === "who" ? "flex-[1.2]" : "flex-1"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-black">
                      {option.title}
                    </span>
                    <span className="text-sm text-gray-500">
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
    </header>
  );
}

export default Header;