import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function TripSkeleton() {
  return (
    <div className="animate-pulse border rounded-xl overflow-hidden shadow-sm">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-5">
        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

// ─── Badge colors ──────────────────────────────────────────────────────────────
const TYPE_BADGE = {
  hotel:      { label: 'Stay',       classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' },
  experience: { label: 'Experience', classes: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' },
  service:    { label: 'Service',    classes: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200' },
};

const STATUS_BADGE = {
  confirmed: 'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
  completed:  'bg-blue-100 text-blue-800',
  pending:    'bg-gray-100 text-gray-800',
};

// ─── TripCard ──────────────────────────────────────────────────────────────────
function TripCard({ trip, onCancel, onDelete }) {
  const navigate = useNavigate();

  const typeBadge = TYPE_BADGE[trip.bookingType] || TYPE_BADGE.hotel;
  const statusClass = STATUS_BADGE[trip.status] || STATUS_BADGE.pending;

  const image   = trip.images?.[0] || '';
  const title   = trip.title || trip.hotelId?.title || 'Booking';
  const city    = trip.city   || trip.hotelId?.location || '';

  // Determine the "detail link" based on booking type
  const detailLink = trip.bookingType === 'experience'
    ? `/experiences/${trip.experienceId?._id || trip.experienceId}`
    : trip.bookingType === 'service'
    ? `/services/${trip.serviceId?._id || trip.serviceId}`
    : `/hotel/${trip.hotelId?._id || trip.hotelId}`;

  // Dates
  const startDate = trip.startDate || trip.checkInDate || trip.sessionDate;
  const endDate   = trip.endDate   || trip.checkOutDate;

  const fmtDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col md:flex-row border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow dark:border-gray-700">
      {/* Image */}
      <div
        className="w-full md:w-1/3 h-48 md:h-auto bg-gray-200 bg-cover bg-center cursor-pointer shrink-0"
        style={{ backgroundImage: image ? `url(${image})` : 'none' }}
        onClick={() => navigate(detailLink)}
      />

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title row */}
          <div className="flex justify-between items-start gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
            <div className="flex gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeBadge.classes}`}>
                {typeBadge.label}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                {trip.status?.charAt(0).toUpperCase() + trip.status?.slice(1)}
              </span>
            </div>
          </div>

          {city && <p className="text-gray-500 text-sm mb-3">{city}</p>}

          {/* Dates */}
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2 flex-wrap">
            {trip.bookingType === 'service' ? (
              startDate && (
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Session Date</p>
                  <p>{fmtDate(startDate)}</p>
                </div>
              )
            ) : (
              <>
                {startDate && (
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {trip.bookingType === 'experience' ? 'Date' : 'Check in'}
                    </p>
                    <p>{fmtDate(startDate)}</p>
                  </div>
                )}
                {endDate && trip.bookingType !== 'experience' && (
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Check out</p>
                    <p>{fmtDate(endDate)}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {trip.guests && trip.bookingType !== 'service' && (
            <p className="text-sm text-gray-500">{trip.guests} guest{trip.guests > 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="font-semibold dark:text-white">₹ {(trip.totalPrice || trip.totalAmount || 0).toLocaleString('en-IN')}</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate(detailLink)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-white text-sm font-medium transition-colors"
            >
              View Details
            </button>
            {/* Hotel-only actions */}
            {trip.bookingType === 'hotel' && trip.status === 'confirmed' && trip.hotelId?.hostId && (
              <button
                onClick={() => navigate(`/messages?hostId=${trip.hotelId.hostId}`)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black text-sm font-medium transition-colors"
              >
                Message Host
              </button>
            )}
            {trip.bookingType === 'hotel' && trip.status === 'confirmed' && new Date(trip.checkInDate) > new Date() && (
              <button
                onClick={() => onCancel(trip._id)}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            )}
            {trip.status === 'pending' && onDelete && (
              <button
                onClick={() => onDelete(trip._id)}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ tab }) {
  return (
    <div className="text-center py-20 px-4">
      <div className="text-5xl mb-4">{tab === 'cancelled' ? '❌' : '🧳'}</div>
      <h3 className="text-2xl font-semibold mb-2 dark:text-white">
        {tab === 'upcoming'  && 'No upcoming trips yet'}
        {tab === 'past'      && 'No past trips yet'}
        {tab === 'cancelled' && 'No cancelled trips'}
      </h3>
      <p className="text-gray-500 mb-6">
        {tab === 'cancelled' ? "You haven't cancelled any trips." : "No trips yet – start exploring!"}
      </p>
      {tab !== 'cancelled' && (
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[#FF385C] hover:bg-[#e31c5f] text-white font-semibold rounded-xl transition-colors"
        >
          Start Exploring
        </Link>
      )}
    </div>
  );
}

// ─── Main Trips page ───────────────────────────────────────────────────────────
const Trips = () => {
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelId, setCancelId]   = useState(null);
  const navigate = useNavigate();

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      const res = await axios.get('http://localhost:5001/api/bookings/my-trips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(res.data.trips || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError(err.response?.data?.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  // Filter trips by tab
  const filterTrips = () => {
    const now = new Date();
    return trips.filter(trip => {
      const start = new Date(trip.startDate || trip.checkInDate || trip.sessionDate || Date.now());
      switch (activeTab) {
        case 'upcoming':  return start >= now && trip.status !== 'cancelled';
        case 'past':      return start < now  && trip.status !== 'cancelled';
        case 'cancelled': return trip.status === 'cancelled';
        default:          return true;
      }
    });
  };

  const filteredTrips = filterTrips();

  const handleCancelBooking = (id) => setCancelId(id);

  const confirmCancel = async () => {
    if (!cancelId) return;
    try {
      await axios.post(`http://localhost:5001/api/bookings/${cancelId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelId(null);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this pending booking permanently?')) return;
    try {
      await axios.delete(`http://localhost:5001/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-8 dark:text-white">Trips</h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b dark:border-gray-700 mb-8">
        {['upcoming', 'past', 'cancelled'].map(tab => (
          <button
            key={tab}
            className={`pb-4 px-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-black dark:border-white text-black dark:text-white'
                : 'text-gray-500 hover:text-black dark:hover:text-white'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <TripSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchTrips} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium">Retry</button>
        </div>
      ) : filteredTrips.length === 0 ? (
        <EmptyState tab={activeTab} />
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

      {/* Cancel modal */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Cancel Booking?</h3>
            <p className="text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setCancelId(null)} className="flex-1 py-3 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white transition-colors">
                Keep it
              </button>
              <button onClick={confirmCancel} className="flex-1 py-3 bg-[#E31C5F] text-white font-semibold rounded-lg hover:bg-[#C11751] transition-colors">
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
