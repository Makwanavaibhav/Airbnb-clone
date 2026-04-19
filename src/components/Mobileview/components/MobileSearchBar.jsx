import React, { useState } from "react";
import { Search, X, MapPin } from "lucide-react";
import { useSearch } from "../../../context/SearchContext.jsx";

// Simplified destinations for mobile mock
const MOCK_DESTINATIONS = ["Nearby", "Mumbai", "Goa", "Udaipur", "Jaipur", "Delhi", "Lonavala"];

function MobileSearchBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Where, 2: When, 3: Who
  const { appliedSearch, setAppliedSearch, searchState, setSearchState } = useSearch();

  const handleSearch = () => {
    setAppliedSearch({ ...searchState });
    setIsModalOpen(false);
    setStep(1);
  };

  const getPillText = () => {
    if (appliedSearch.destination) {
      return `${appliedSearch.destination}`;
    }
    return "Search for homes";
  };

  return (
    <>
      <div className={`transition-all duration-300 w-full`}>
        <button 
          className={`flex items-center gap-3 w-full h-[48px] rounded-full transition-all duration-200 cursor-pointer group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg pl-4`}
          onClick={() => setIsModalOpen(true)}
        >
          <Search className="h-5 w-5 text-gray-900 dark:text-white stroke-[2px]" />
          <div className="flex flex-col items-start justify-center">
            <span className="text-gray-900 dark:text-white text-[13px] font-semibold leading-tight">
              {getPillText()}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-[11px] leading-tight flex gap-1">
              <span>Anywhere</span>
              <span>•</span>
              <span>Any week</span>
              <span>•</span>
              <span>Add guests</span>
            </span>
          </div>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 pt-safe flex items-center justify-between border-b border-gray-200 dark:border-gray-700 h-[60px] pb-2">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 flex items-center justify-center min-w-[44px] min-h-[44px]"
            >
              <X className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            </button>
            <div className="flex gap-2">
              <span className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300'}`} />
              <span className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300'}`} />
              <span className={`h-1.5 w-8 rounded-full ${step >= 3 ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300'}`} />
            </div>
            <div className="w-[44px]" /> {/* Spacer for centering */}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            {step === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Where to?</h2>
                <div className="relative mb-6">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search destinations"
                    value={searchState.destination}
                    onChange={(e) => setSearchState(s => ({ ...s, destination: e.target.value }))}
                    className="w-full h-14 pl-12 pr-4 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  {MOCK_DESTINATIONS.map(d => (
                    <button 
                      key={d} 
                      className="px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl dark:text-gray-200 min-h-[44px]"
                      onClick={() => {
                        setSearchState(s => ({ ...s, destination: d }));
                        setStep(2);
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4 w-full dark:text-white">When's your trip?</h2>
                <p className="text-gray-500 py-10">Select dates (Calendar mock)</p>
                <div className="w-full flex justify-end mt-4">
                   <button 
                      onClick={() => setStep(3)}
                      className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold w-full min-h-[44px]"
                    >
                     Next
                   </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Who's coming?</h2>
                <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <div className="font-semibold dark:text-white">Adults</div>
                    <div className="text-gray-500 text-sm">Ages 13 or above</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      className="w-[44px] h-[44px] rounded-full border border-gray-300 flex items-center justify-center dark:text-white"
                      onClick={() => setSearchState(s => ({ ...s, guests: { ...s.guests, adults: Math.max(1, s.guests.adults - 1) } }))}
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-semibold dark:text-white">{searchState.guests.adults}</span>
                    <button 
                      className="w-[44px] h-[44px] rounded-full border border-gray-300 flex items-center justify-center dark:text-white"
                      onClick={() => setSearchState(s => ({ ...s, guests: { ...s.guests, adults: s.guests.adults + 1 } }))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button 
              className="font-semibold underline dark:text-white w-[44px] h-[44px] flex items-center justify-center"
              onClick={() => {
                setSearchState({ destination: "", startDate: null, endDate: null, guests: { adults: 1, children: 0, infants: 0, pets: 0 } });
              }}
            >
              Clear
            </button>
            <button 
              className="bg-[#FF385C] text-white px-8 h-[48px] rounded-xl font-semibold flex flex-row items-center justify-center gap-2 min-h-[44px]"
              onClick={handleSearch}
            >
              <Search className="w-5 h-5" /> Search
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MobileSearchBar;