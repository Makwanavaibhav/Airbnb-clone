// components/Header/components/LocaleModal/LocaleModal.jsx
import React from "react";
import { Dialog, DialogContent } from "../../ui/dialog.jsx";
import LanguageTab from "../LocaleModal/LanguageTab.jsx";
import CurrencyTab from "../LocaleModal/CurrencyTab.jsx";

function LocaleModal({ 
  open, 
  onOpenChange, 
  activeLocaleTab, 
  setActiveLocaleTab,
  selectedLanguage,
  setSelectedLanguage,
  selectedCurrency,
  setSelectedCurrency,
  translateEnabled,
  setTranslateEnabled
}) {
  const localeTabs = [
    { id: "language", label: "Language and region" },
    { id: "currency", label: "Currency" },
  ];

  // Data moved to child components, but you can keep common data here if needed
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <LanguageTab
              translateEnabled={translateEnabled}
              setTranslateEnabled={setTranslateEnabled}
              suggestedLanguages={suggestedLanguages}
              languages={languages}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              onClose={() => onOpenChange(false)}
            />
          )}

          {activeLocaleTab === "currency" && (
            <CurrencyTab
              currencies={currencies}
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LocaleModal;