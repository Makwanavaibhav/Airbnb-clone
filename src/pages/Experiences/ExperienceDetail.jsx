import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExperiencePhotoGrid from './components/ExperiencePhotoGrid';
import MeetingPointMap from '../../components/MeetingPointMap';
import ReviewsList from '../../components/ReviewsList';
import WriteReview from '../../components/WriteReview';
import { Share, Heart, Star, ChevronLeft, Clock, Users, CheckCircle } from 'lucide-react';
import axios from 'axios';
import StripeCheckout from '../../components/StripeCheckout';
import { useSearch } from '../../context/SearchContext';

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const reviewsRef = useRef(null);

  // Booking state
  const { appliedSearch } = useSearch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [booking, setBooking] = useState(false);
  const [dateError, setDateError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    fetch(`http://localhost:5001/api/experiences/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data._id) {
          setExperience(data);
        }
      })
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-populate guests and available slots from search context
  useEffect(() => {
    if (experience && experience.availableDates) {
      // Auto-select guests
      const searchGuests = appliedSearch?.guests?.adults + appliedSearch?.guests?.children;
      if (searchGuests > 1) {
        setGuests(Math.min(searchGuests, experience.groupSize || 10));
      }

      // Auto-select date slot if it matches search
      if (appliedSearch?.startDate && !selectedDate) {
        const searchDate = new Date(appliedSearch.startDate);
        searchDate.setHours(0,0,0,0);
        
        const matchingSlot = experience.availableDates.find(slot => {
          const slotDate = new Date(slot.date);
          slotDate.setHours(0,0,0,0);
          return slotDate.getTime() === searchDate.getTime() && slot.spotsAvailable > 0;
        });

        if (matchingSlot) {
          setSelectedDate(matchingSlot);
        }
      }
    }
  }, [experience, appliedSearch]);

  const validateDates = (selectedSlot) => {
    if (!selectedSlot) return "Please select a date and time slot";
    const d = new Date(selectedSlot.date);
    if (isNaN(d.getTime())) return "Invalid date selected";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return "Selected date cannot be in the past";
    return null;
  };

  const handleBook = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const errorMsg = validateDates(selectedDate);
    if (errorMsg) {
      setDateError(errorMsg);
      return;
    }
    setDateError(null);

    // checkIn = selected date; checkOut = next day (backend requires checkOut > checkIn)
    const checkIn = new Date(selectedDate.date);
    checkIn.setHours(10, 0, 0, 0);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);

    try {
      setBooking(true);
      const res = await fetch('http://localhost:5001/api/payments/experience/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          experienceId: id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          guests
        })
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 dark:bg-gray-950">
        <div className="text-5xl">😔</div>
        <h2 className="text-2xl font-semibold dark:text-white">Experience not found</h2>
        <button onClick={() => navigate(-1)} className="text-[#FF385C] underline font-medium">Go back</button>
      </div>
    );
  }

  const availableDates = experience.availableDates || [];
  const mp = experience.meetingPoint;

  return (
    <div className="relative font-sans bg-white dark:bg-gray-950 min-h-screen pb-32">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-xl font-semibold text-white transition-all ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Nav bar — back button visible on all screens */}
      <div className="w-full max-w-[1120px] mx-auto md:px-6 md:mt-8 mb-6 flex justify-between items-center px-4 pt-4 md:pt-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition dark:text-white"
        >
          <ChevronLeft size={24} className="dark:text-white" />
          <span className="hidden md:inline text-sm font-semibold">Back</span>
        </button>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition dark:text-white">
            <Share size={18} /> <span className="hidden md:inline">Share</span>
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition dark:text-white">
            <Heart size={18} /> <span className="hidden md:inline">Save</span>
          </button>
        </div>
      </div>

      <ExperiencePhotoGrid images={experience.images || []} />

      <div className="w-full max-w-[1120px] mx-auto px-6 mt-8 flex flex-col md:flex-row gap-12 relative">
        {/* ── Left column ── */}
        <div className="w-full md:w-2/3">
          {/* Title + rating */}
          <div className="pb-8 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-[26px] md:text-3xl font-bold mb-4 dark:text-white">{experience.title}</h1>
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-300 font-medium text-sm md:text-base flex-wrap">
              <Star size={16} fill="currentColor" />
              <span>
                {experience.rating} · <span className="underline cursor-pointer">{experience.reviewCount} reviews</span>
              </span>
              {experience.city && <><span>·</span><span>{experience.city}</span></>}
              {experience.category && <><span>·</span><span>{experience.category}</span></>}
            </div>
          </div>

          {/* Quick facts */}
          <div className="py-6 border-b border-gray-200 dark:border-gray-800 flex gap-8 flex-wrap">
            {experience.duration && (
              <div className="flex items-center gap-2 dark:text-white">
                <Clock size={20} className="text-gray-500" />
                <div>
                  <div className="font-semibold text-sm">Duration</div>
                  <div className="text-gray-500 text-sm">{experience.duration}</div>
                </div>
              </div>
            )}
            {experience.groupSize && (
              <div className="flex items-center gap-2 dark:text-white">
                <Users size={20} className="text-gray-500" />
                <div>
                  <div className="font-semibold text-sm">Group size</div>
                  <div className="text-gray-500 text-sm">Up to {experience.groupSize} guests</div>
                </div>
              </div>
            )}
            {experience.freeCancellation && (
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                <div>
                  <div className="font-semibold text-sm dark:text-white">Free cancellation</div>
                  <div className="text-gray-500 text-sm">Cancel up to 24h before</div>
                </div>
              </div>
            )}
          </div>

          {/* Host bar */}
          <div className="py-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold dark:text-white mb-1">
                Hosted by {experience.hostName || 'Host'}
              </h2>
            </div>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(experience.hostName || 'Host')}&background=random`}
              alt="host"
              className="w-14 h-14 rounded-full cursor-pointer ml-4 flex-shrink-0"
            />
          </div>

          {/* Description */}
          {experience.description && (
            <div className="py-8 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">About this experience</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{experience.description}</p>
            </div>
          )}

          {/* ── REAL Reviews (Task 3) ── */}
          <ReviewsList ref={reviewsRef} targetId={id} targetType="experience" />
          <WriteReview
            targetId={id}
            targetType="experience"
            onReviewPosted={() => reviewsRef.current?.refetch()}
          />

          {/* ── Meeting point map (Task 1) ── */}
          {mp?.lat && mp?.lng && (
            <MeetingPointMap lat={mp.lat} lng={mp.lng} address={mp.address} />
          )}
        </div>

        {/* ── Right column – Booking Card ── */}
        <div className="w-full md:w-1/3 relative">
          <div className="sticky top-28 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-2xl font-bold dark:text-white">
                ₹{experience.pricePerPerson?.toLocaleString('en-IN')}
                <span className="text-base font-normal text-gray-500"> / guest</span>
              </h3>
            </div>
            {experience.freeCancellation && (
              <p className="text-sm font-semibold text-rose-600 mb-4">Free cancellation</p>
            )}

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
                            ? 'border-black dark:border-white border-2 bg-gray-50 dark:bg-gray-800'
                            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400'
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
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
                  disabled={booking}
                />
              </div>
            )}

            {dateError && <p className="text-red-500 font-semibold text-sm mb-4">{dateError}</p>}

            {/* Guests counter */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl mb-4">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-sm dark:text-white">GUESTS</div>
                  <div className="text-sm text-gray-500">{guests} guest{guests > 1 ? 's' : ''}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center dark:text-white disabled:opacity-30"
                    disabled={guests <= 1 || booking}>-</button>
                  <span className="font-semibold dark:text-white w-4 text-center">{guests}</span>
                  <button onClick={() => setGuests(g => Math.min(experience.groupSize || 10, g + 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center dark:text-white disabled:opacity-30"
                    disabled={booking}>+</button>
                </div>
              </div>
            </div>

            <button
              onClick={handleBook}
              disabled={booking}
              className="w-full bg-[#FF385C] hover:bg-[#D90B38] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition mt-2"
            >
              {booking ? 'Processing...' : 'Reserve'}
            </button>
            <p className="text-center text-gray-400 text-xs mt-3">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
