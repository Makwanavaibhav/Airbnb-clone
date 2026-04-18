import { useState, useEffect } from "react";
import Card from "../ui/card";
import { fetchHotelsByCity } from "../../services/api";

// ─── Skeleton loader for a single card row ───────────────────────────────────
function SkeletonRow() {
  return (
    <div className="mb-12">
      <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-64">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-2" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── One city section with its own fetch + state ──────────────────────────────
function CitySection({ cityKey, title }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchHotelsByCity(cityKey)
      .then((data) => {
        if (!cancelled) {
          setHotels(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(`Failed to load ${cityKey} hotels:`, err.message);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [cityKey]);

  if (loading) return <SkeletonRow />;

  if (error) {
    return (
      <div className="mb-12">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</p>
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          Could not load listings. Make sure the backend is running.
          <br />
          <span className="font-mono text-xs opacity-70">{error}</span>
        </div>
      </div>
    );
  }

  if (hotels.length === 0) return null;

  return <Card hotels={hotels} title={title} layout="scroll" />;
}

// ─── Search Section for Dynamic Results ──────────────────────────────────────────
function SearchSection({ searchContext, searchDest }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    // Construct query path
    const params = new URLSearchParams();
    if (searchDest && searchDest !== 'anywhere' && searchDest !== 'nearby') {
       params.append('city', searchDest);
    }
    if (searchContext?.checkIn) params.append('checkIn', searchContext.checkIn.toISOString());
    if (searchContext?.checkOut) params.append('checkOut', searchContext.checkOut.toISOString());
    if (searchContext?.guests?.adults) params.append('guests', searchContext.guests.adults + searchContext.guests.children);

    fetch(`http://localhost:5001/api/hotels/search?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
         if (!cancelled) {
             setHotels(Array.isArray(data) ? data : []);
             setLoading(false);
         }
      })
      .catch(err => {
         if (!cancelled) {
            setError(err.message);
            setLoading(false);
         }
      });

    return () => { cancelled = true; };
  }, [searchDest, searchContext]);

  if (loading) return <SkeletonRow />;
  
  if (error) {
    return (
      <div className="mb-12">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Search Results</p>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Search failed. <span className="font-mono text-xs opacity-70">{error}</span>
        </div>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No exact matches found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search filters or destination.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return <Card hotels={hotels} title={`Search results for "${searchDest}"`} layout="grid" />;
}

// ─── Main listing page ────────────────────────────────────────────────────────
import { useSearch } from "../../context/SearchContext.jsx";

function Cards({ activeTab }) {
  const { appliedSearch } = useSearch();
  const searchDest = (appliedSearch?.destination || "").toLowerCase();
  
  const [discoveryCities, setDiscoveryCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    setLoadingCities(true);
    fetch("http://localhost:5001/api/hotels/cities")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Map backend cities to format expected by CitySection
          const formatted = data.cities.map(city => ({
            key: city.toLowerCase(),
            title: `Popular homes in ${city}`,
            match: [city.toLowerCase()]
          }));
          setDiscoveryCities(formatted);
        }
      })
      .catch(err => console.error("Error fetching discovery cities:", err))
      .finally(() => setLoadingCities(false));
  }, []);

  // If searchDest is empty or contains "nearby", show all predefined sections.
  // Otherwise, use deep search.
  const isDefaultView = !searchDest || searchDest === "nearby" || searchDest === "anywhere" || searchDest === "destination";
  
  const isHardcodedMatch = discoveryCities.some(r => r.match.some(kw => searchDest.includes(kw)));
  const useSearchEndpoint = !isDefaultView && !isHardcodedMatch;

  const filteredRoutes = discoveryCities.filter((r) => 
      !isDefaultView ? r.match.some((kw) => searchDest.includes(kw) || kw.includes(searchDest)) : true
  );

  // Styling block
  const sharedStyles = (
    <style>{`
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
        scroll-behavior: smooth;
        padding: 10px 5px;
        margin: -10px -5px;
      }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
    `}</style>
  );

  // 1. Experiences Tab
  if (activeTab === "Experiences") {
    return (
      <div className="w-full px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold mb-3 dark:text-white">Experiences coming soon</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          We're partnering with local guides in {appliedSearch?.destination || "your area"} to bring you unforgettable activities.
        </p>
        {sharedStyles}
      </div>
    );
  }

  // 2. Services Tab
  if (activeTab === "Services") {
    return (
      <div className="w-full px-6 py-20 text-center">
        <h2 className="text-3xl font-semibold mb-3 dark:text-white">Services in {appliedSearch?.destination || "your area"}</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          From private chefs to daily housekeeping, professional services are coming to Airbnb.
        </p>
        <div className="flex justify-center gap-4 mt-8 opacity-60">
          <span className="text-4xl">👨‍🍳</span>
          <span className="text-4xl">💆</span>
          <span className="text-4xl">📸</span>
        </div>
        {sharedStyles}
      </div>
    );
  }

  // 3. Default Homes Tab
  return (
    <div className="w-full px-6 py-8">
      {useSearchEndpoint ? (
         <SearchSection searchContext={appliedSearch} searchDest={searchDest} />
      ) : filteredRoutes.length > 0 ? (
        filteredRoutes.map((route) => (
          <CitySection key={route.key} cityKey={route.key} title={route.title} />
        ))
      ) : (
         <SearchSection searchContext={appliedSearch} searchDest={searchDest} />
      )}
      {sharedStyles}
    </div>
  );
}

export default Cards;