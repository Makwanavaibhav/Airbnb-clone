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

  return <Card hotels={hotels} title={title} />;
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

  return <Card hotels={hotels} title={`Search results for "${searchDest}"`} layout="grid" />;}

// ─── Experience Section ──────────────────────────────────────────────────────────
function ExperienceSection() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("http://localhost:5001/api/hotels/search?propertyType=Experience")
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setExperiences(Array.isArray(data) ? data : []);
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
  }, []);

  if (loading) return <SkeletonRow />;
  
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        Failed to load experiences. <span className="font-mono text-xs opacity-70">{error}</span>
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No experiences available yet</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Check back later for new and exciting offline experiences hosted by locals!
        </p>
      </div>
    );
  }

  // Force URLs to map to /experience/:id
  const updatedExperiences = experiences.map(exp => ({ ...exp, _isExperience: true }));

  return <Card hotels={updatedExperiences} layout="grid" />;
}

// ─── Main listing page ────────────────────────────────────────────────────────
import { useSearch } from "../../context/SearchContext.jsx";

// Fixed 3-region sections — each covers the relevant sub-locations
const CITY_ROUTES = [
  { key: "udaipur", title: "Popular homes in Udaipur", match: ["udaipur", "pichola", "rajasthan"] },
  { key: "goa",     title: "Top picks in Goa",         match: ["goa", "north goa", "south goa", "calangute", "baga", "anjuna", "panjim", "siolim", "varca"] },
  { key: "mumbai",  title: "Places to stay in Mumbai",  match: ["mumbai", "bandra", "bandra west", "bandra east", "andheri", "andheri west", "santacruz", "goregaon"] },
];

function Cards({ activeTab }) {
  const { appliedSearch } = useSearch();
  const searchDest = (appliedSearch?.destination || "").toLowerCase().trim();

  const isDefaultView = !searchDest || ["nearby", "anywhere", "destination"].includes(searchDest);
  const matchedRoutes = CITY_ROUTES.filter(r => r.match.some(kw => searchDest.includes(kw) || kw.includes(searchDest)));
  const useSearchEndpoint = !isDefaultView && matchedRoutes.length === 0;

  // In default view, show all 3 regions; otherwise narrow to matched ones
  const visibleRoutes = isDefaultView ? CITY_ROUTES : matchedRoutes;


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
      <div className="w-full px-6 py-8 max-w-[1120px] mx-auto">
        <h2 className="text-2xl font-bold mb-6 dark:text-white px-2">Unforgettable activities hosted by locals</h2>
        <ExperienceSection />
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
      ) : visibleRoutes.length > 0 ? (
        visibleRoutes.map((route) => (
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