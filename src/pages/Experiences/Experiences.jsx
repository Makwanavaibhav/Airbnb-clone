import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import { Star, Clock, Users } from 'lucide-react';

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function ExperienceSkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}

export default function Experiences() {
  const navigate = useNavigate();
  const { appliedSearch } = useSearch();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const destination = appliedSearch?.destination || '';
  const displayDest = destination || 'your area';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5001/api/experiences`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          const allListings = Array.isArray(data) ? data : [];
          const filtered = allListings.filter(l => {
            if (!destination || destination.trim() === '' || destination.toLowerCase() === 'anywhere' || destination.toLowerCase() === 'nearby') 
              return true;
            
            const query = destination.trim().toLowerCase();
            const city = (l.city || l.location || '').trim().toLowerCase();
            return city.includes(query);
          });
          setExperiences(filtered);
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
  }, [destination]);

  return (
    <div className="w-full px-8 py-10 min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Unforgettable experiences in {displayDest}
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            Led by locals who love where they're from and what they do.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ExperienceSkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Failed to load experiences.</p>
            <p className="text-gray-400 text-sm font-mono">{error}</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found for "{destination}"
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try searching for a different city like Goa, Mumbai, or Udaipur.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {experiences.map(item => (
              <div
                key={item._id}
                className="group cursor-pointer"
                onClick={() => navigate(`/experiences/${item._id}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4">
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {(item.tags || []).slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-md shadow-sm text-gray-900">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm font-medium mb-1">
                  <span className="text-yellow-500">★</span>
                  {item.reviewCount > 0 ? (
                    <>
                      <span className="text-gray-900 dark:text-white">{item.rating}</span>
                      <span className="text-gray-500">({item.reviewCount})</span>
                    </>
                  ) : (
                    <span className="text-gray-900 dark:text-white font-medium">New</span>
                  )}
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium truncate mb-1">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 text-gray-500 text-xs mb-2">
                  {item.duration && (
                    <span className="flex items-center gap-1"><Clock size={12} />{item.duration}</span>
                  )}
                  {item.city && (
                    <span>{item.city}</span>
                  )}
                </div>
                <div className="text-gray-900 dark:text-white text-sm">
                  <span className="font-semibold">From ₹{item.pricePerPerson?.toLocaleString('en-IN')}</span>
                  <span className="text-gray-500"> / person</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
