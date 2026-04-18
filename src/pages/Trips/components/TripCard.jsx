import React from 'react';
import { useNavigate } from 'react-router-dom';

const TripCard = ({ trip, onCancel }) => {
  const navigate = useNavigate();
  const hotel = trip.hotelId || {};
  
  return (
    <div className="trip-card flex flex-col md:flex-row border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="w-full md:w-1/3 h-48 md:h-auto bg-gray-200 bg-cover bg-center cursor-pointer"
        style={{ backgroundImage: `url(${hotel.images?.[0] || ''})` }}
        onClick={() => navigate(`/hotel/${hotel._id || hotel.id}`)}
      />
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{hotel.title || hotel.location}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              trip.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              trip.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              trip.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-500 mb-4">{hotel.location}</p>
          
          <div className="flex gap-4 text-sm text-gray-600 mb-2">
            <div>
              <p className="font-semibold text-gray-900">Check in</p>
              <p>{new Date(trip.checkInDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Check out</p>
              <p>{new Date(trip.checkOutDate).toLocaleDateString()}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">{trip.guests} guest{trip.guests > 1 ? 's' : ''}</p>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <p className="font-semibold">₹ {trip.totalAmount}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate(`/hotel/${hotel._id || hotel.id}`)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              View Details
            </button>
            {hotel.hostId && (
              <button 
                onClick={() => navigate(`/messages?hostId=${hotel.hostId}`)}
                className="px-4 py-2 border border-[#FF385C] text-[#FF385C] rounded-lg hover:bg-rose-50 text-sm font-medium transition-colors"
              >
                Message Host
              </button>
            )}
            {trip.status === 'confirmed' && new Date(trip.checkInDate) > new Date() && (
              <button 
                onClick={() => onCancel(trip._id)}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
