import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchState, setSearchState] = useState({
    destination: "",
    startDate: null,
    endDate: null,
    guests: { adults: 0, children: 0, infants: 0, pets: 0 },
  });
  
  // The filter applied when clicking 'Search'
  const [appliedSearch, setAppliedSearch] = useState({
    destination: "",
    startDate: null,
    endDate: null,
    guests: { adults: 0, children: 0, infants: 0, pets: 0 },
  });

  return (
    <SearchContext.Provider value={{
      searchState, setSearchState,
      appliedSearch, setAppliedSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
