import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import BookingSummary from './components/BookingSummary';
import PaymentSection from './components/PaymentSection';
import PriceBreakdown from './components/PriceBreakdown';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelId } = useParams();
  
  // Get booking details from navigation state
  const { hotel, checkIn, checkOut, guests } = location.state || {};

  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  // Redirect if no booking data
  useEffect(() => {
    if (!hotel) {
      if (hotelId) navigate(`/hotel/${hotelId}`);
      else navigate('/');
    }
  }, [hotel, hotelId, navigate]);
  
  if (!hotel) return null;

  // Calculate pricing
  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  };
  
  const nights = calculateNights();
  const pricePerNight = hotel?.priceRaw || hotel?.pricePerNight || 0;
  const subtotal = pricePerNight * nights;
  const taxes = subtotal * 0.10; // 10% tax
  const total = subtotal + taxes;
  
  const handlePayment = async () => {
    setIsPaying(true);
    setPaymentError(null);
    try {
      const response = await fetch('http://localhost:5001/api/bookings/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          hotelId: hotel?.id || hotelId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests: (guests?.adults || 1) + (guests?.children || 0),
          totalAmount: total,
        }),
      });

      const resData = await response.json();
      console.log('[Checkout] Backend response:', resData);

      if (!response.ok) {
        throw new Error(resData.message || resData.error || 'Failed to initiate booking');
      }

      if (resData.url) {
        // Redirect to Stripe Checkout hosted page
        window.location.href = resData.url;
      } else {
        throw new Error('No payment URL returned from server. Check backend logs.');
      }
    } catch (err) {
      console.error('[Checkout] Payment error:', err);
      setPaymentError(err.message);
    } finally {
      setIsPaying(false);
    }
  };
  
  return (
    <div className="max-w-[1120px] mx-auto px-6 pt-12 pb-24 text-gray-900 dark:text-gray-100 font-sans">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition cursor-pointer -ml-2">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h1 className="text-[32px] font-semibold tracking-tight">Confirm and pay</h1>
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-24">
        
        {/* Left column (60% width) */}
        <div className="w-full lg:w-[60%] flex-shrink-0">
          {paymentError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm font-medium">
              ⚠️ {paymentError}
            </div>
          )}
          <PaymentSection onPaymentClick={handlePayment} isLoading={isPaying} />
        </div>

        {/* Right column (40% width) */}
        <div className="w-full lg:w-[40%]">
          <BookingSummary 
            hotel={hotel}
            nights={nights}
            subtotal={subtotal}
            taxes={taxes}
            total={total}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
          />
          <PriceBreakdown />
        </div>

      </div>
    </div>
  );
};

export default Checkout;
