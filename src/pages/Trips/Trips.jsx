import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TripCard from './components/TripCard';
import EmptyState from './components/EmptyState';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, [activeTab]);

  const fetchTrips = async () => {
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
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await axios.post(`http://localhost:5001/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchTrips(); // Refresh the list
      alert('Booking cancelled successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Trips;
