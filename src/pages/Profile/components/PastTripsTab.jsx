import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { MapPin, Calendar, Compass } from 'lucide-react';

const STATUS_STYLES = {
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

function formatDateRange(start, end) {
  if (!start) return '';
  const s = new Date(start);
  const opts = { month: 'short', day: 'numeric' };
  const startStr = s.toLocaleDateString('en-IN', opts);
  if (!end) return startStr;
  const e = new Date(end);
  const endStr = e.toLocaleDateString('en-IN', opts);
  const yearStr = e.getFullYear();
  return `${startStr} – ${endStr}, ${yearStr}`;
}

const TripCard = ({ trip, onClick }) => {
  const thumb = trip.images?.[0];
  const status = trip.status || 'confirmed';

  return (
    <div
      onClick={onClick}
      className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-900"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
        {thumb ? (
          <img src={thumb} alt={trip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Compass className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-[15px] truncate">
            {trip.title || 'Unknown listing'}
          </h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_STYLES[status] || STATUS_STYLES.confirmed}`}>
            {status}
          </span>
        </div>

        {trip.city && (
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{trip.city}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>

        {trip.totalPrice != null && (
          <div className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
            ₹{Number(trip.totalPrice).toLocaleString('en-IN')}
          </div>
        )}
      </div>
    </div>
  );
};

const PastTripsTab = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/bookings/my-trips', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setTrips(res.data.trips || []);
      } catch (err) {
        setError('Could not load your trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [getToken]);

  const past = trips.filter(t => {
    const end = t.endDate || t.startDate;
    return new Date(end) < new Date() || t.status === 'cancelled';
  });

  return (
    <div className="flex-1 max-w-[800px]">
      <h2 className="text-[32px] font-semibold text-gray-900 dark:text-white mb-8">Past trips</h2>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-500 py-8">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF385C]" />
          Loading your trips...
        </div>
      ) : error ? (
        <div className="p-8 border border-red-200 dark:border-red-800 rounded-2xl text-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : past.length === 0 ? (
        <div className="p-10 border border-gray-200 dark:border-gray-700 rounded-2xl text-center flex flex-col items-center gap-4">
          <div className="text-5xl">🧳</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No past trips yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            Looks like you haven't completed any trips yet. Start exploring amazing places!
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-6 py-3 bg-[#FF385C] hover:bg-[#D90B63] text-white font-semibold rounded-xl transition-colors"
          >
            Explore hotels
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {past.map((trip) => (
            <TripCard
              key={trip._id}
              trip={trip}
              onClick={() => {
                if (trip.bookingType === 'hotel' && trip.hotelId) {
                  navigate(`/hotel/${trip.hotelId?._id || trip.hotelId}`);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PastTripsTab;
