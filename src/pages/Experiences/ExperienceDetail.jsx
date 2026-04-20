import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExperiencePhotoGrid from './components/ExperiencePhotoGrid';
import MeetingPointMap from '../../components/MeetingPointMap';
import ReviewsList from '../../components/ReviewsList';
import WriteReview from '../../components/WriteReview';
import { Share, Heart, Star, ChevronLeft, Clock, Users, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const reviewsRef = useRef(null);

  // Booking state
  const [selectedDate, setSelectedDate] = useState(null);
  const [guests, setGuests] = useState(1);
  const [booking, setBooking] = useState(false);
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
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const totalPrice = (experience?.pricePerPerson || 0) * guests;

  const handleBook = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    if (!selectedDate) {
      setToast({ type: 'error', msg: 'Please select a date first' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    try {
      setBooking(true);
      await axios.post('http://localhost:5001/api/bookings/experience', {
        experienceId: experience._id,
        hostId: experience.hostId,
        checkIn: selectedDate.date || selectedDate,
        checkOut: selectedDate.date || selectedDate,
        guests,
        totalPrice,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setToast({ type: 'success', msg: 'Booking confirmed! 🎉' });
      setTimeout(() => navigate('/trips'), 1500);
    } catch (err) {
      setToast({ type: 'error', msg: err.response?.data?.message || 'Failed to book' });
      setTimeout(() => setToast(null), 4000);
    } finally {
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

      <div className="w-full max-w-[1120px] mx-auto md:px-6 md:mt-8 mb-6 flex justify-between items-center px-4 pt-4 md:pt-0">
        <div className="md:hidden cursor-pointer" onClick={() => navigate(-1)}>
          <ChevronLeft size={24} className="dark:text-white" />
        </div>
        <div className="hidden md:block" />
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

            {/* Date picker */}
            {availableDates.length > 0 ? (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Available dates</p>
                <div className="max-h-[200px] overflow-y-auto flex flex-col gap-2">
                  {availableDates.map((slot, idx) => {
                    const d = new Date(slot.date);
                    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                    const isSelected = selectedDate === slot;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(slot)}
                        className={`border rounded-xl p-3 text-left transition ${
                          isSelected
                            ? 'border-gray-900 dark:border-white border-2 bg-gray-50 dark:bg-gray-800'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between dark:text-white text-sm font-semibold">
                          <span>{label}</span>
                          <span>{slot.timeRange}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{slot.spotsAvailable} spots available</div>
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
                  value={selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : ''}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
            )}

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
                    disabled={guests <= 1}>-</button>
                  <span className="font-semibold dark:text-white w-4 text-center">{guests}</span>
                  <button onClick={() => setGuests(g => Math.min(experience.groupSize || 10, g + 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center dark:text-white">+</button>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="mb-4 text-sm dark:text-gray-300">
              <div className="flex justify-between py-1">
                <span className="underline">₹{experience.pricePerPerson?.toLocaleString('en-IN')} × {guests} guest{guests > 1 ? 's' : ''}</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold dark:text-white border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <span>Total</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={handleBook}
              disabled={booking}
              className="w-full bg-[#FF385C] hover:bg-[#D90B38] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
            >
              {booking ? 'Booking...' : 'Reserve'}
            </button>
            <p className="text-center text-gray-400 text-xs mt-3">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
