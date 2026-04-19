import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TripCard from './components/TripCard';
import EmptyState from './components/EmptyState';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`http://localhost:5001/api/bookings/my-trips?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(response.data.trips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const [cancelId, setCancelId] = useState(null);

  const confirmCancel = async () => {
    if (!cancelId) return;
    try {
      await axios.post(`http://localhost:5001/api/bookings/${cancelId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTrips(); // Refresh the list
      setCancelId(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
      setCancelId(null);
    }
  };

  const handleCancelBooking = (bookingId) => {
    setCancelId(bookingId);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to permanently delete this pending booking?")) {
      try {
        await axios.delete(`http://localhost:5001/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchTrips();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete booking');
      }
    }
  };

  const filterTrips = () => {
    const now = new Date();
    switch(activeTab) {
      case 'upcoming':
        return trips.filter(trip => new Date(trip.checkInDate) > now && trip.status !== 'cancelled');
      case 'completed':
        return trips.filter(trip => new Date(trip.checkOutDate) < now && trip.status !== 'cancelled');
      case 'cancelled':
        return trips.filter(trip => trip.status === 'cancelled');
      default:
        return trips;
    }
  };

  const filteredTrips = filterTrips();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-8">Trips</h1>
      
      <div className="flex gap-6 border-b mb-8">
        {['upcoming', 'completed', 'cancelled'].map(tab => (
          <button 
            key={tab}
            className={`pb-4 px-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500 hover:text-black'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredTrips.length === 0 ? (
        <EmptyState type={activeTab} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTrips.map(trip => (
            <TripCard 
              key={trip._id} 
              trip={trip} 
              onCancel={handleCancelBooking}
              onDelete={handleDeleteBooking}
            />
          ))}
        </div>
      )}

      {/* Inline Confirmation Modal */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Cancel Booking?</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setCancelId(null)} 
                className="flex-1 py-3 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
               >
                 Keep it
              </button>
              <button 
                onClick={confirmCancel} 
                className="flex-1 py-3 bg-[#E31C5F] text-white font-semibold rounded-lg hover:bg-[#C11751] transition-colors"
               >
                 Cancel it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trips;
