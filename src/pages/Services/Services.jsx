import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../context/SearchContext';
import { Star, Clock, MapPin } from 'lucide-react';

function ServiceSkeletonCard() {
  return (
    <div className="animate-pulse flex flex-col md:flex-row gap-8 items-center bg-white dark:bg-gray-800 rounded-3xl p-6">
      <div className="w-full md:w-1/2 aspect-video bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      <div className="w-full md:w-1/2">
        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function Services() {
  const navigate = useNavigate();
  const { appliedSearch } = useSearch();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const destination = appliedSearch?.destination || '';
  const displayDest = destination || 'your area';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5001/api/services`)
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
          setServices(filtered);
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
    <div className="w-full px-8 py-10 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Elevate your stay in {displayDest}
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto dark:text-gray-400">
            Transform your trip into a 5-star experience with our vetted professional services.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-10">
            {[...Array(3)].map((_, i) => <ServiceSkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-2">Failed to load services.</p>
            <p className="text-gray-400 font-mono text-sm">{error}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No results found for "{destination}"
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try searching for Goa, Mumbai, or Udaipur.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {services.map((service, index) => (
              <div
                key={service._id}
                className={`flex flex-col md:flex-row gap-8 items-center bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
                onClick={() => navigate(`/services/${service._id}`)}
              >
                <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={service.images?.[0] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center px-4 md:px-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-gray-900 dark:text-white font-medium">{service.rating}</span>
                    <span className="text-gray-400 text-sm">({service.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {service.serviceType && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-xs font-semibold rounded-full">
                        {service.serviceType}
                      </span>
                    )}
                    {service.city && (
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <MapPin size={12} />{service.city}
                      </span>
                    )}
                  </div>
                  <h3 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-medium text-gray-900 dark:text-white">
                      From ₹{service.pricePerSession?.toLocaleString('en-IN')}/session
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/services/${service._id}`); }}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 transition-colors text-white font-semibold rounded-lg shadow-sm"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
