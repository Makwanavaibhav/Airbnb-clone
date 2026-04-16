import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { HotelCard } from '../../components/ui/card';

// Fix #10: Wishlists now uses AuthContext wishlistIds for live sync
const Wishlists = () => {
  const navigate = useNavigate();
  const { isLoggedIn, wishlistIds, fetchWishlistIds } = useAuth();
  const [wishlistHotels, setWishlistHotels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchWishlistData();
  }, [isLoggedIn]);

  // Keep hotel data in sync whenever wishlistIds changes (e.g. after un-liking from Home)
  useEffect(() => {
    if (wishlistHotels.length > 0) {
      setWishlistHotels(prev => prev.filter(h => wishlistIds.has(String(h._id || h.id))));
    }
  }, [wishlistIds]);

  const fetchWishlistData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/users/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setWishlistHotels(data.wishlist || []);
      // Also sync AuthContext so heart icons on Home are accurate
      await fetchWishlistIds();
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen pb-40">
      <h1 className="text-3xl font-semibold mb-8">Wishlists</h1>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : wishlistHotels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Create your first wishlist</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            As you search, tap the heart icon to save your favorite places to a wishlist.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#FF385C] text-white rounded-lg hover:bg-[#D70466] font-semibold transition-colors"
          >
            Start exploring
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistHotels.map(hotel => (
            <HotelCard key={hotel._id || hotel.id} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlists;
