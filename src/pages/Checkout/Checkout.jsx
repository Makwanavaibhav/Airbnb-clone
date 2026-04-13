import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BookingSummary from './components/BookingSummary';
import PaymentSection from './components/PaymentSection';
import PriceBreakdown from './components/PriceBreakdown';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const { user } = useAuth();
  
  // Get booking details from navigation state
  const { hotel, checkIn, checkOut, guests } = location.state || {};
  
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
    // Initialize Razorpay or redirect to payment gateway
    try {
        const response = await fetch("http://localhost:5001/api/bookings/checkout", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            hotelId: hotel?.id || hotelId,
            hotelName: hotel?.title || hotel?.name,
            hotelImage: hotel?.image,
            startDate: checkIn,
            endDate: checkOut,
            totalDays: nights,
            totalPrice: total,
            adults: guests?.adults,
            children: guests?.children,
            infants: guests?.infants,
            pets: guests?.pets
          }),
        });
  
        const resData = await response.json();
        if (!response.ok) {
          throw new Error(resData.error || "Failed to initiate booking");
        }
  
        if (resData.url) {
          window.location.href = resData.url;
        } else {
          // Fallback
          navigate('/?booking_success=true');
        }
      } catch (err) {
        alert(err.message);
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

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        
        {/* Left column (60% width) */}
        <div className="w-full lg:w-[60%] flex-shrink-0">
          <PaymentSection onPaymentClick={handlePayment} />
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
