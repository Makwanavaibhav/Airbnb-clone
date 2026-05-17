import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('bookingId');
  const sessionId = searchParams.get('session_id');
  const type = searchParams.get('type') || 'hotel';

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [booking, setBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!sessionId || (type === 'hotel' && !bookingId)) {
      setStatus('error');
      setErrorMsg('Missing booking information. Please contact support.');
      return;
    }

    // Bug #9 fix: skip re-calling Stripe if we already confirmed this booking in this browser session
    const cacheKey = `booking_confirmed_${bookingId || sessionId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        setBooking(JSON.parse(cached));
        setStatus('success');
        return;
      } catch { /* fall through to re-verify */ }
    }

    const confirm = async () => {
      try {
        const endpoint = type === 'hotel' 
          ? 'http://localhost:5001/api/bookings/verify-payment'
          : 'http://localhost:5001/api/payments/verify-session';
          
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ paymentIntentId: sessionId, bookingId, type }),
        });
        const data = await res.json();

        if (data.success) {
          // Cache so reloads don't re-call Stripe
          const cacheKey = `booking_confirmed_${bookingId || sessionId}`;
          sessionStorage.setItem(cacheKey, JSON.stringify(data.booking));
          setBooking(data.booking);
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(data.message || 'Payment verification failed.');
        }
      } catch {
        setStatus('error');
        setErrorMsg('Network error. Please contact support.');
      }
    };

    confirm();
  }, [bookingId, sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-gray-700 dark:text-gray-300">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF385C]" />
        <p className="text-lg font-medium">Confirming your booking…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <XCircle className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Something went wrong</h1>
        <p className="text-gray-500 max-w-sm">{errorMsg}</p>
        <button
          onClick={() => navigate('/trips')}
          className="mt-4 px-6 py-3 bg-[#222222] text-white rounded-lg font-medium hover:bg-black transition"
        >
          Go to My Trips
        </button>
      </div>
    );
  }

  const item = booking?.hotelId || booking?.experienceId || booking?.serviceId;
  const checkIn  = booking?.checkInDate || booking?.checkIn || booking?.sessionDate 
    ? new Date(booking.checkInDate || booking.checkIn || booking.sessionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : '';
  const checkOut = booking?.checkOutDate || booking?.checkOut 
    ? new Date(booking.checkOutDate || booking.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : '';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-10 max-w-md w-full text-center">

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-gray-900 dark:text-white mb-2">
          Booking Confirmed! 🎉
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 font-light">
          Your reservation has been successfully booked. Have a great time!
        </p>

        {item && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 text-left mb-8 space-y-3">
            <div className="font-semibold text-gray-900 dark:text-white text-[16px]">
              {item.title || 'Your reservation'}
            </div>
            {item.location && (
              <div className="text-sm text-gray-500">{item.location}</div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-[11px] uppercase font-bold text-gray-400 mb-1">{type === 'service' ? 'Session Date' : 'Check-in'}</div>
                <div className="text-gray-800 dark:text-gray-200 font-medium">{checkIn}</div>
              </div>
              {checkOut && type !== 'service' && (
                <div>
                  <div className="text-[11px] uppercase font-bold text-gray-400 mb-1">Check-out</div>
                  <div className="text-gray-800 dark:text-gray-200 font-medium">{checkOut}</div>
                </div>
              )}
            </div>
            {(booking?.totalAmount || booking?.totalPrice) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-sm font-semibold">
                <span className="text-gray-700 dark:text-gray-300">Total Paid</span>
                <span className="text-gray-900 dark:text-white">
                  ₹{Number(booking.totalAmount || booking.totalPrice).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/trips')}
            className="w-full py-3 bg-[#FF385C] hover:bg-[#d90b63] text-white font-semibold rounded-xl transition text-[15px]"
          >
            View My Trips
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-[15px]"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
