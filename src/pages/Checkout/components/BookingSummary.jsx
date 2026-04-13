import React from 'react';
import { Star } from 'lucide-react';

const BookingSummary = ({ hotel, nights, subtotal, taxes, total, checkIn, checkOut, guests }) => {
  const formatDateRange = (startStr, endStr) => {
    if (!startStr || !endStr) return '';
    const start = new Date(startStr);
    const end = new Date(endStr);
    return `${start.getDate()}–${end.getDate()} ${start.toLocaleString('default', { month: 'short' })} ${start.getFullYear()}`;
  };

  const getGuestStr = () => {
    if (!guests) return '1 adult';
    let total = (guests.adults || 1) + (guests.children || 0);
    return `${total} guest${total !== 1 ? 's' : ''}`;
  };

  return (
    <div className="sticky top-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
      {/* Header Info */}
      <div className="flex gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
        <img src={hotel?.image} alt={hotel?.title || hotel?.name} className="w-24 h-24 object-cover rounded-xl" />
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1 leading-tight text-ellipsis line-clamp-1">{hotel?.location || 'Entire home'}</p>
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2 line-clamp-2">
            {hotel?.title || hotel?.name}
          </h3>
          <div className="flex items-center gap-1 text-[13px] font-semibold mt-auto">
            <Star className="w-3 h-3 fill-current" />
            <span>{hotel?.rating || '4.5'} ({hotel?.reviews || '4'})</span>
          </div>
        </div>
      </div>

      {/* Free Cancellation */}
      <div className="py-6 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-[16px] text-gray-900 dark:text-gray-100">Free cancellation</h4>
        <p className="text-[#717171] text-[15px] mt-1 line-clamp-2">
          Cancel before 12:00 pm on {new Date(checkIn).getDate()} {new Date(checkIn).toLocaleString('default', { month: 'short' })} for a full refund. <span className="font-bold underline text-gray-900 dark:text-gray-100 cursor-pointer">Full policy</span>
        </p>
      </div>

      {/* Dates and Guests details */}
      <div className="py-6 border-b border-gray-200 dark:border-gray-700 space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-[16px] text-gray-900 dark:text-gray-100 mb-0.5">Dates</h4>
            <p className="text-[15px] text-[#717171]">{formatDateRange(checkIn, checkOut)}</p>
            <p className="text-[15px] text-[#717171]">12:00 pm – 2:00 pm check-in</p>
          </div>
          <button className="text-[15px] font-semibold underline hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-colors">
            Change
          </button>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-[16px] text-gray-900 dark:text-gray-100 mb-0.5">Guests</h4>
            <p className="text-[15px] text-[#717171]">{getGuestStr()}</p>
          </div>
          <button className="text-[15px] font-semibold underline hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-md transition-colors">
            Change
          </button>
        </div>
      </div>

      {/* Price Details */}
      <div className="py-6 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-[22px] text-gray-900 dark:text-gray-100 mb-5">Price details</h4>
        <div className="flex justify-between text-[16px] text-[#222222] dark:text-gray-200 mb-3">
          <span>₹{(hotel?.priceRaw || hotel?.pricePerNight)?.toLocaleString('en-IN')} x {nights} night{nights !== 1 ? 's' : ''}</span>
          <div className="flex gap-2">
             <span className="line-through text-[#717171]">₹{(subtotal*1.12).toLocaleString('en-IN')}</span> {/* Demo discount strikethrough */}
             <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="flex justify-between text-[16px] text-[#222222] dark:text-gray-200 mb-3">
          <span className="underline">Taxes</span>
          <span>₹{taxes.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="pt-6">
        <div className="flex justify-between text-[16px] font-bold text-gray-900 dark:text-gray-100 mb-2">
          <span>Total <span className="underline font-semibold text-sm">INR</span></span>
          <span>₹{total.toLocaleString('en-IN')}</span>
        </div>
        <button className="text-[16px] font-semibold underline text-[#222222] dark:text-gray-300">
          Price breakdown
        </button>
      </div>
    </div>
  );
};

export default BookingSummary;
