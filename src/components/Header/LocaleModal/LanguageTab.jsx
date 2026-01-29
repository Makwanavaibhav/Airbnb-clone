import React from "react";

function LanguageTab({
  translateEnabled,
  setTranslateEnabled,
  suggestedLanguages,
  languages,
  selectedLanguage,
  setSelectedLanguage,
  onClose
}) {
  return (
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
              onClose();
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
              onClose();
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
  );
}

export default LanguageTab;