import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ExperienceBookingCard = ({ experience }) => {
  const navigate = useNavigate();
  const [showDates, setShowDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [guests, setGuests] = useState(1);

  const incrementGuests = () => setGuests(prev => Math.min(prev + 1, experience.groupSize));
  const decrementGuests = () => setGuests(prev => Math.max(prev - 1, 1));
  const totalPrice = experience.pricePerGuest * guests;

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const handleBook = () => {
    navigate(`/checkout/${experience.id}`, { state: { date: selectedDate, guests, type: 'experience', experienceDetails: experience } });
  };

  return (
    <>
      <div className="hidden md:block sticky top-28 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-[400px]">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-2xl font-bold dark:text-white">
            ₹{experience.pricePerGuest.toLocaleString('en-IN')} <span className="text-base font-normal text-gray-500">/ guest</span>
          </h3>
        </div>
        {experience.freeCancellation && (
          <p className="text-sm font-semibold text-rose-600 mb-6">Free cancellation</p>
        )}

        <button 
          onClick={() => setShowDates(!showDates)}
          className="w-full bg-[#FF385C] hover:bg-[#D90B38] text-white font-semibold py-3 rounded-xl transition mb-4"
        >
          {showDates ? 'Hide dates' : 'Show dates'}
        </button>

        {showDates && (
          <div className="mt-4 mb-4 max-h-[300px] overflow-y-auto scrollbar-hide flex flex-col gap-3">
            {experience.availableDates.map((slot, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedDate(slot)}
                className={`border rounded-xl p-4 cursor-pointer transition ${selectedDate === slot ? 'border-gray-900 dark:border-white border-2' : 'border-gray-300 dark:border-gray-700 hover:border-gray-500'}`}
              >
                <div className="flex justify-between font-semibold dark:text-white mb-1">
                  <span>{formatDate(slot.date)}</span>
                  <span>{slot.timeRange}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>₹{experience.pricePerGuest} / guest</span>
                  <span>{slot.spotsAvailable} spots available</span>
                </div>
              </div>
            ))}
            <button className="text-left py-2 font-semibold underline mt-2 dark:text-white hover:text-gray-600">Show all dates</button>
          </div>
        )}

        {selectedDate && (
          <div className="border border-gray-300 dark:border-gray-700 rounded-xl mt-4 mb-4">
            <div className="p-4 flex justify-between items-center w-full">
              <div>
                <div className="font-semibold text-sm dark:text-white">GUESTS</div>
                <div className="text-sm text-gray-500">{guests} guest{guests > 1 ? 's' : ''}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={decrementGuests} disabled={guests <= 1} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center dark:text-white disabled:opacity-30 disabled:cursor-not-allowed">-</button>
                <span className="font-semibold dark:text-white w-4 text-center">{guests}</span>
                <button onClick={incrementGuests} disabled={guests >= experience.groupSize} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center dark:text-white disabled:opacity-30 disabled:cursor-not-allowed">+</button>
              </div>
            </div>
          </div>
        )}

        {selectedDate && (
          <>
            <button 
              onClick={handleBook}
              className="w-full bg-[#FF385C] hover:bg-[#D90B38] text-white font-semibold py-3 rounded-xl transition"
            >
              Book now
            </button>
            <div className="mt-4 flex justify-between dark:text-gray-300 pb-4 border-b border-gray-200 dark:border-gray-800">
              <span className="underline">₹{experience.pricePerGuest.toLocaleString('en-IN')} x {guests} guests</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between font-bold dark:text-white mt-4">
              <span>Total (INR)</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </>
        )}
      </div>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 px-6 flex justify-between items-center z-40">
        <div>
          <div className="font-bold text-lg dark:text-white">
            ₹{experience.pricePerGuest.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">/ guest</span>
          </div>
          {experience.freeCancellation && (
            <div className="text-xs font-semibold text-rose-600">Free cancellation</div>
          )}
        </div>
        <button 
          onClick={() => {
            navigate(`/checkout/${experience.id}`, { state: { date: experience.availableDates[0], guests: 1, type: 'experience', experienceDetails: experience } });
          }}
          className="bg-[#FF385C] text-white px-6 py-3 rounded-xl font-bold"
        >
          Show dates
        </button>
      </div>
    </>
  );
};

export default ExperienceBookingCard;
