import React from "react";

function CurrencyTab({ currencies, selectedCurrency, setSelectedCurrency }) {
  return (
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
  );
}

export default CurrencyTab;