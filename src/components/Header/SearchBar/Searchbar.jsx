import React from "react";
import { Search } from "lucide-react";
import houseLogo from "../../../assets/logo/house.png";

function SearchBar({
  activeTab,
  variant = "full", // "full" | "compact"
  searchRef,
  compactSearchRef,
  searchPillWidth,
  onExpand,
  where,
  dateLabel,
  guestLabel,
}) {
  if (variant === "compact") {
    const defaultGuestLabel = activeTab === "Services" ? "Add services" : "Add guests";
    const handleExpand = typeof onExpand === "function" ? onExpand : () => {};

    return (
      <div
        ref={compactSearchRef}
        className="transition-all duration-300 ease-out absolute left-1/3"
        style={{
          width: searchPillWidth,
          maxWidth: "400px",
        }}
      >
        <button
          onClick={handleExpand}
          aria-label="Expand search"
          className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg h-16 hover:shadow-xl transition-all duration-200 w-full border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* First section — Where */}
          <div className="flex items-center justify-center flex-1 py-3 px-4 border-r border-gray-200 dark:border-gray-700 min-w-0">
            <img
              src={houseLogo}
              alt=""
              className="h-8 w-8 object-contain shrink-0 mr-3"
            />
            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm text-center truncate">
              {where || "Anywhere"}
            </div>
          </div>

          {/* Second section — When */}
          <div className="flex items-center justify-center flex-1 py-3 px-4 border-r border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm text-center whitespace-nowrap">
              {dateLabel || "Anytime"}
            </div>
          </div>

          {/* Third section — Who + Search button */}
          <div className="flex items-center justify-between flex-1 py-3 px-4">
            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm whitespace-nowrap">
              {guestLabel || defaultGuestLabel}
            </div>
            <div className="bg-airbnb p-3 rounded-full text-white hover:bg-red-600 transition-colors ml-4 shrink-0">
              <Search className="h-4 w-4" strokeWidth={3} />
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Full expanded pill.
  const searchOptions = [
    { key: "where", title: "Where", subtitle: "Search destinations" },
    { key: "when", title: "When", subtitle: "Add dates" },
    {
      key: "who",
      title: activeTab === "Services" ? "Type of services" : "Who",
      subtitle: activeTab === "Services" ? "Add services" : "Add guests",
    },
  ];

  return (
    <div
      ref={searchRef}
      className="flex items-center w-full max-w-212.5 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 h-16"
    >
      {searchOptions.map((option, index) => (
        <React.Fragment key={option.key}>
          {index > 0 && (
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
          )}

          <button
            className={`flex items-center justify-between px-6 py-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-left h-full transition-colors flex-1 ${
              option.key === "who" ? "pr-3" : ""
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
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center justify-center bg-[#ff385c] text-white w-10 h-10 rounded-full hover:bg-[#e31c5f] transition-colors">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            )}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

export default SearchBar;