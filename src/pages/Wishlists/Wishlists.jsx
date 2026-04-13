import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HotelCard } from '../../components/ui/card';

const Wishlists = () => {
  const [wishlistHotels, setWishlistHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/users/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistHotels(response.data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-8">Wishlists</h1>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : wishlistHotels.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="text-6xl mb-6">❤️</div>
          <h2 className="text-2xl font-semibold mb-2">Create your first wishlist</h2>
          <p className="text-gray-500 mb-6">As you search, tap the heart icon to save your favorite places to stay or things to do to a wishlist.</p>
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
            <HotelCard 
              key={hotel._id || hotel.id} 
              hotel={hotel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlists;
