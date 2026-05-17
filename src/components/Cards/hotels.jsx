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
    if (searchContext?.startDate) params.append('checkIn', searchContext.startDate.toISOString());
    if (searchContext?.endDate) params.append('checkOut', searchContext.endDate.toISOString());
    const totalGuests = (searchContext?.guests?.adults || 0) + (searchContext?.guests?.children || 0);
    if (totalGuests > 0) params.append('guests', totalGuests);

    fetch(`http://localhost:5001/api/hotels/search?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
         if (!cancelled) {
             const allListings = Array.isArray(data) ? data : [];
             const filtered = allListings.filter(l => {
                 if (!searchDest || searchDest.trim() === '' || searchDest === 'anywhere' || searchDest === 'nearby')
                     return true;
                 const query = searchDest.trim().toLowerCase();
                 const city = (l.city || l.location || '').trim().toLowerCase();
                 return city.includes(query);
             });
             setHotels(filtered);
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
import ExperiencesPage from "../../pages/Experiences/Experiences.jsx";
import ServicesPage from "../../pages/Services/Services.jsx";


function Cards({ activeTab }) {
  const { appliedSearch } = useSearch();
  const searchDest = (appliedSearch?.destination || "").toLowerCase();

  // ── Dynamic city sections: fetch from backend so any new published listing auto-appears ──
  const FALLBACK_ROUTES = [
    { key: "udaipur", title: "Popular homes in Udaipur", match: ["udaipur", "pichola", "rajasthan"] },
    { key: "goa",     title: "Top picks in Goa",         match: ["goa", "north goa", "south goa", "calangute", "baga", "anjuna"] },
    { key: "mumbai",  title: "Places to stay in Mumbai", match: ["mumbai", "bandra", "andheri", "maharashtra"] }
  ];

  const [CITY_ROUTES, setCityRoutes] = useState(FALLBACK_ROUTES);
  const [citiesLoaded, setCitiesLoaded] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5001/api/hotels/cities")
      .then(res => res.json())
      .then(data => {
        if (!data.success || !data.cities?.length) return;

        // Build a route for every distinct city that has at least 1 published listing
        const dynamicRoutes = data.cities.map(city => {
          const lower = city.toLowerCase();
          // Friendly section title
          const title = lower === "goa" || lower.includes("goa")
            ? "Top picks in Goa"
            : lower === "udaipur" || lower.includes("udaipur") || lower.includes("pichola")
            ? "Popular homes in Udaipur"
            : lower === "mumbai" || lower.includes("mumbai") || lower.includes("bandra") || lower.includes("andheri")
            ? "Places to stay in Mumbai"
            : `Places to stay in ${city}`;

          return {
            key: lower,           // used as the city param in /api/hotels/city/:city
            title,
            match: [lower]
          };
        });

        // De-duplicate by key so Mumbai's many localities collapse into one section
        const seen = new Set();
        const deduped = dynamicRoutes.filter(r => {
          const base =
            r.key.includes("goa") || r.match.some(k => k.includes("goa"))     ? "goa"
            : r.key.includes("udaipur") || r.key.includes("pichola")           ? "udaipur"
            : r.key.includes("mumbai") || r.key.includes("bandra") || r.key.includes("andheri") ? "mumbai"
            : r.key;
          if (seen.has(base)) return false;
          seen.add(base);
          r.key = base; // normalise key so /api/hotels/city/ query works
          return true;
        });

        setCityRoutes(deduped.length ? deduped : FALLBACK_ROUTES);
        setCitiesLoaded(true);
      })
      .catch(() => {
        setCityRoutes(FALLBACK_ROUTES); // silent fallback on network error
        setCitiesLoaded(true);
      });
  }, []); // eslint-disable-line

  // If searchDest is empty or contains "nearby", show all predefined sections.
  // Otherwise, use deep search.
  const isDefaultView = !searchDest || searchDest === "nearby" || searchDest === "anywhere" || searchDest === "destination";
  
  const isHardcodedMatch = CITY_ROUTES.some(r => r.match.some(kw => searchDest.includes(kw) || kw.includes(searchDest)));
  const useSearchEndpoint = !isDefaultView && !isHardcodedMatch;

  const filteredRoutes = CITY_ROUTES.filter((r) => 
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
      <div className="w-full">
         <ExperiencesPage />
         {sharedStyles}
      </div>
    );
  }

  // 2. Services Tab
  if (activeTab === "Services") {
    return (
      <div className="w-full">
         <ServicesPage />
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