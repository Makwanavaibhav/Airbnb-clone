import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, MapPin, Share, Heart } from 'lucide-react';
import axios from 'axios';
import ServiceAreaMap from '../../components/ServiceAreaMap';
import ReviewsList from '../../components/ReviewsList';
import WriteReview from '../../components/WriteReview';
import StripeCheckout from '../../components/StripeCheckout';
import { useSearch } from '../../context/SearchContext';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const reviewsRef = useRef(null);

  // Booking state
  const { appliedSearch } = useSearch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [booking, setBooking] = useState(false);
  const [dateError, setDateError] = useState(null);
  const [toast, setToast] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    if (service) {
      const dates = [];
      const daysMap = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
      let d = new Date();
      // start checking from today
      while (dates.length < 5) {
        const dayNum = d.getDay();
        const dayStrOptions = Object.keys(daysMap).filter(k => daysMap[k] === dayNum);
        // service.availability is something like ['Mon', 'Tue']
        const hasAvail = !service.availability || service.availability.length === 0 || 
                         service.availability.some(a => dayStrOptions.includes(a.substring(0,3)));
        if (hasAvail) {
          dates.push({
            date: d.toISOString(),
            timeRange: '10:00 AM - 1:00 PM',
            spotsAvailable: 5
          });
        }
        d.setDate(d.getDate() + 1);
        if (dates.length >= 5 || d > new Date(Date.now() + 86400000 * 30)) break; // reasonable limit
      }
      setAvailableDates(dates);
    }
  }, [service]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`http://localhost:5001/api/services/${id}`)
      .then(res => res.json())
      .then(data => { if (data && data._id) setService(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-populate available slot from search context
  useEffect(() => {
    if (availableDates.length > 0 && appliedSearch?.startDate && !selectedDate) {
      const searchDate = new Date(appliedSearch.startDate);
      searchDate.setHours(0,0,0,0);
      
      const matchingSlot = availableDates.find(slot => {
        const slotDate = new Date(slot.date);
        slotDate.setHours(0,0,0,0);
        return slotDate.getTime() === searchDate.getTime() && slot.spotsAvailable > 0;
      });

      if (matchingSlot) {
        setSelectedDate(matchingSlot);
      }
    }
  }, [availableDates, appliedSearch]);

  const validateSessionDate = (sessionDateInput) => {
    if (!sessionDateInput) return "Please select a date and time slot";
    return null;
  };

  const handleBook = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const errorMsg = validateSessionDate(selectedDate);
    if (errorMsg) {
      setDateError(errorMsg);
      return;
    }
    setDateError(null);

    try {
      setBooking(true);
      const res = await fetch('http://localhost:5001/api/payments/service/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ serviceId: id, sessionDate: selectedDate?.date })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setDateError(data.message || 'Payment initiation failed');
        return;
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setDateError('Failed to connect to payment server. Please try again.');
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 dark:bg-gray-950">
        <div className="text-5xl">😔</div>
        <h2 className="text-2xl font-semibold dark:text-white">Service not found</h2>
        <button onClick={() => navigate(-1)} className="text-purple-500 underline font-medium">Go back</button>
      </div>
    );
  }

  const sa = service.serviceArea;

  return (
    <div className="relative font-sans bg-white dark:bg-gray-950 min-h-screen pb-32">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-xl font-semibold text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Nav bar */}
      <div className="w-full max-w-[1120px] mx-auto md:px-6 md:mt-8 mb-6 flex justify-between items-center px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition dark:text-white">
          <ChevronLeft size={22} />
          <span className="hidden md:inline text-sm font-semibold">Back</span>
        </button>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition dark:text-white"><Share size={18} /></button>
          <button className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition dark:text-white"><Heart size={18} /></button>
        </div>
      </div>

      {/* Photo grid */}
      <div className="w-full max-w-[1120px] mx-auto px-4 md:px-6 mb-8">
        <div className="grid grid-cols-2 gap-3 rounded-2xl overflow-hidden aspect-[2/1]">
          <img
            src={service.images?.[0] || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'}
            alt={service.title}
            className="w-full h-full object-cover col-span-1 row-span-2"
          />
          {service.images?.[1] && (
            <img src={service.images[1]} alt={service.title} className="w-full h-full object-cover" />
          )}
        </div>
      </div>

      <div className="w-full max-w-[1120px] mx-auto px-6 flex flex-col md:flex-row gap-12">
        {/* Left */}
        <div className="w-full md:w-2/3">
          {/* Header */}
          <div className="pb-8 border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-2 mb-3 flex-wrap">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-sm font-semibold rounded-full">
                {service.serviceType || 'Service'}
              </span>
              {service.city && (
                <span className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin size={14} />{service.city}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold dark:text-white mb-3">{service.title}</h1>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Star size={16} fill="currentColor" className="text-yellow-500" />
              <span className="font-medium">{service.rating}</span>
              <span className="text-gray-400">({service.reviewCount} reviews)</span>
            </div>
          </div>

          {/* About */}
          <div className="py-8 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold dark:text-white mb-4">About this service</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{service.description}</p>
          </div>

          {/* Availability */}
          {service.availability && service.availability.length > 0 && (
            <div className="py-8 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold dark:text-white mb-4">Availability</h2>
              <div className="flex gap-2 flex-wrap">
                {service.availability.map(day => (
                  <span key={day} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full text-sm font-medium dark:text-white">{day}</span>
                ))}
              </div>
            </div>
          )}

          {/* Host info */}
          <div className="py-8 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold dark:text-white mb-4">Your service provider</h2>
            <div className="flex items-center gap-4">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(service.hostName || 'Host')}&background=random&size=80`}
                alt="host" className="w-16 h-16 rounded-full"
              />
              <div>
                <div className="font-bold dark:text-white">{service.hostName || 'Local Professional'}</div>
                <div className="text-gray-500 text-sm">Verified provider</div>
              </div>
            </div>
          </div>

          {/* ── REAL Reviews (Task 3) ── */}
          <ReviewsList ref={reviewsRef} targetId={id} targetType="service" />
          <WriteReview
            targetId={id}
            targetType="service"
            onReviewPosted={() => reviewsRef.current?.refetch()}
          />

          {/* ── Service area map (Task 2) ── */}
          {sa?.lat && sa?.lng && (
            <ServiceAreaMap lat={sa.lat} lng={sa.lng} radiusMeters={sa.radiusMeters} />
          )}
        </div>

        {/* Right — Booking Card */}
        <div className="w-full md:w-1/3">
          <div className="sticky top-28 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6">
            <div className="mb-4">
              <h3 className="text-2xl font-bold dark:text-white">
                ₹{service.pricePerSession?.toLocaleString('en-IN')}
                <span className="text-base font-normal text-gray-500"> / session</span>
              </h3>
            </div>

            {/* Available dates card list */}
            {availableDates.length > 0 ? (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Available dates</p>
                <div className="max-h-[300px] overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
                  {availableDates.map((slot, idx) => {
                    const d = new Date(slot.date);
                    const isToday = d.setHours(0,0,0,0) === new Date().setHours(0,0,0,0);
                    const isTomorrow = d.setHours(0,0,0,0) === new Date(Date.now() + 86400000).setHours(0,0,0,0);
                    const labelPrefix = isToday ? "Today, " : isTomorrow ? "Tomorrow, " : d.toLocaleDateString('en-GB', { weekday: 'long' }) + ", ";
                    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
                    
                    const isSelected = selectedDate === slot;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(slot)}
                        className={`w-full border rounded-[16px] p-4 text-left transition ${
                          isSelected
                            ? 'border-purple-600 dark:border-purple-400 border-2 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-400'
                        }`}
                        disabled={booking}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-[15px] dark:text-white">{labelPrefix}{dateStr}</div>
                            <div className="text-sm text-gray-500 mt-1">{slot.timeRange}</div>
                          </div>
                          <div className="font-semibold text-sm dark:text-white">
                            {slot.spotsAvailable} spots available
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Select date</p>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate ? new Date(selectedDate.date).toISOString().split('T')[0] : ''}
                  onChange={e => setSelectedDate({ date: e.target.value, timeRange: '10:00 AM - 1:00 PM', spotsAvailable: 10 })}
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500"
                  disabled={booking}
                />
              </div>
            )}
            
            {dateError && <p className="text-red-500 font-semibold text-sm mb-4">{dateError}</p>}

            <button
              onClick={handleBook}
              disabled={booking}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition mt-2"
            >
              {booking ? 'Processing...' : 'Book Now'}
            </button>
            <p className="text-center text-gray-400 text-xs mt-3">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
