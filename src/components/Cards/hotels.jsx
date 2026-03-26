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

// ─── Main listing page ────────────────────────────────────────────────────────
function Cards() {
  return (
    <div className="w-full px-6 py-8">
      <CitySection cityKey="udaipur" title="Popular homes in Udaipur" />
      <CitySection cityKey="goa"     title="Top Picks in Goa" />
      <CitySection cityKey="mumbai"  title="Places to stay in Mumbai" />

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
    </div>
  );
}

export default Cards;