import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShare, FiHeart } from 'react-icons/fi';
import { BsCheckCircle, BsHeartFill } from 'react-icons/bs';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ChevronLeft, ChevronRight, Calendar, Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { fetchHotelById } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';
import ReviewsList from '../ReviewsList';
import WriteReview from '../WriteReview';

// ─── GuestCounter ─────────────────────────────────────────────────────────────
function GuestCounter({ label, sublabel, value, onInc, onDec, min = 0, max = 10 }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div>
        <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{label}</div>
        <div className="text-xs text-gray-500">{sublabel}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDec} disabled={value <= min}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            value <= min ? "border-gray-200 text-gray-200 cursor-not-allowed dark:border-gray-700 dark:text-gray-600" : "border-gray-400 text-gray-600 hover:border-gray-900 dark:text-gray-300 dark:hover:border-gray-100"
          }`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center font-semibold text-sm">{value}</span>
        <button 
          onClick={onInc} disabled={value >= max}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            value >= max ? "border-gray-200 text-gray-200 cursor-not-allowed dark:border-gray-700 dark:text-gray-600" : "border-gray-400 text-gray-600 hover:border-gray-900 dark:text-gray-300 dark:hover:border-gray-100"
          }`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const getDaysInMonth     = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

function CalendarMonth({ year, month, startDate, endDate, onDayClick, hoveredDay, setHoveredDay, bookedDates = [] }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex-1 min-w-0">
      <div className="text-center font-semibold text-gray-900 dark:text-gray-100 mb-4 text-sm">{MONTH_NAMES[month]} {year}</div>
      <div className="grid grid-cols-7 gap-0 text-center">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} className="text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const date = new Date(year, month, day); date.setHours(0, 0, 0, 0);
          
          const isPast    = date < today;
          const isBooked  = bookedDates.some(r => date >= r.start && date < r.end); // Note: end date checkout day might be bookable, so < r.end or <= depending on check-in policy. Here using < r.end so people can checkout and checkin on the same day, but simplified to <= if strict
          let isDisabled  = isPast || isBooked;

          // Also disable if they have a startDate, and this date is after a booked date (cannot span reservations)
          if (!isDisabled && startDate && !endDate && date > startDate) {
             const hasBookingBetween = bookedDates.some(r => r.start > startDate && r.start < date);
             if (hasBookingBetween) isDisabled = true;
          }

          const isStart   = startDate && date.getTime() === startDate.getTime();
          const isEnd     = endDate   && date.getTime() === endDate.getTime();
          const isInRange = startDate && (endDate || hoveredDay) && date > startDate && date < (hoveredDay && !endDate ? hoveredDay : endDate) && !isDisabled;

          return (
            <button
              key={day}
              disabled={isDisabled}
              onClick={() => !isDisabled && onDayClick(date)}
              onMouseEnter={() => !isDisabled && startDate && !endDate && setHoveredDay(date)}
              onMouseLeave={() => setHoveredDay(null)}
              className={[
                "relative h-9 w-full text-sm font-medium rounded-full transition-all",
                isDisabled ? "text-gray-300 dark:text-gray-600 line-through cursor-not-allowed" : "cursor-pointer text-gray-900 dark:text-gray-100",
                isStart || isEnd ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 z-10" : "",
                isInRange ? "bg-rose-50 dark:bg-rose-900/30 rounded-none text-gray-900 dark:text-gray-100" : "",
                !isDisabled && !isStart && !isEnd ? "hover:bg-gray-100 dark:hover:bg-gray-800" : "",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}


// A robust self-healing image loader to bypass AWS S3 strict casing errors
function S3Image({ src, alt, className }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && imgSrc) {
      setHasError(true);
      if (imgSrc.includes('/hotel-')) setImgSrc(imgSrc.replace('/hotel-', '/Hotel-'));
      else if (imgSrc.includes('/Hotel-')) setImgSrc(imgSrc.replace('/Hotel-', '/hotel-'));
    }
  };

  return <img src={imgSrc} onError={handleError} alt={alt} className={className} />;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="max-w-[1120px] mx-auto px-6 pt-6 pb-24 animate-pulse">
      <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[460px] rounded-xl overflow-hidden mb-12">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`bg-gray-200 dark:bg-gray-700 ${i === 0 ? "col-span-2 row-span-2" : ""}`} />
        ))}
      </div>
      <div className="flex gap-20">
        <div className="flex-1 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          ))}
        </div>
        <div className="w-[330px] h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Hotel Detail Page ────────────────────────────────────────────────────────
const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, wishlistIds, toggleWishlist, user } = useAuth();
  const { appliedSearch } = useSearch();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Reviews state
  const reviewsRef = useRef(null);
  const [bookedDates, setBookedDates] = useState([]);
  
  // Seed dates from search context if the user came from a search
  const [startDate, setStartDate] = useState(appliedSearch?.startDate || null);
  const [endDate, setEndDate] = useState(appliedSearch?.endDate || null);
  const [isReserving] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  
  // Custom DatePicker states
  const [calendarMode, setCalendarMode]     = useState("dates");
  const [hoveredDay, setHoveredDay]         = useState(null);
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [stayLength, setStayLength]         = useState("Weekend");
  const [flexibleMonths, setFlexibleMonths] = useState([]);

  // Seed guests from search context
  const [guests, setGuests] = useState(
    appliedSearch?.guests && (appliedSearch.guests.adults > 0)
      ? appliedSearch.guests
      : { adults: 1, children: 0, infants: 0, pets: 0 }
  );
  
  useEffect(() => {
    if (appliedSearch?.startDate) setStartDate(appliedSearch.startDate);
    if (appliedSearch?.endDate) setEndDate(appliedSearch.endDate);
    if (appliedSearch?.guests && appliedSearch.guests.adults > 0) setGuests(appliedSearch.guests);
  }, [appliedSearch]);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const calendarRef = useRef(null);
  const guestDropdownRef = useRef(null);

  const totalGuests = guests.adults + guests.children;

  // Derive the host-configured max from data.guests (may be a number string like "4" or "1-4 guests")
  const maxGuestsFromListing = (() => {
    if (!data) return 10;
    const raw = data.guests;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
      // e.g. "4" or "1-4 guests" — grab the last number
      const nums = raw.match(/\d+/g);
      if (nums) return parseInt(nums[nums.length - 1], 10);
    }
    return 10;
  })();

  const limits = { adults: maxGuestsFromListing, children: Math.max(0, maxGuestsFromListing - 1), infants: 5, pets: 5 };
  const incGuest = (k) => setGuests((g) => ({ ...g, [k]: Math.min(limits[k], g[k] + 1) }));
  const decGuest = (k) => setGuests((g) => ({ ...g, [k]: Math.max(k === 'adults' ? 1 : 0, g[k] - 1) }));

  const scrollToCalendar = () => {
    calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    const handler = (e) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(e.target)) setShowGuestDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchHotelById(id)
      .then((hotel) => {
        if (!cancelled) {
          setData(hotel);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    // Fetch booked dates
    fetch(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`}/api/bookings/hotel/${id}/dates`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.success) {
          setBookedDates(data.bookedDates.map(bd => ({
            start: new Date(bd.checkInDate),
            end: new Date(bd.checkOutDate)
          })));
        }
      })
      .catch(console.error);

    return () => { cancelled = true; };
  }, [id]);

  // Geocode location if coordinates are missing
  useEffect(() => {
    if (data) {
      let lat, lng;
      if (Array.isArray(data.coordinates) && data.coordinates.length >= 2) {
        lat = data.coordinates[0];
        lng = data.coordinates[1];
      } else if (data.coordinates && !Array.isArray(data.coordinates) && data.coordinates.lat !== undefined) {
        lat = data.coordinates.lat;
        lng = data.coordinates.lng;
      } else if (data.lat !== undefined && data.lng !== undefined) {
        lat = data.lat;
        lng = data.lng;
      }

      if (lat !== undefined && lng !== undefined) {
        setMapCenter([lat, lng]);
      } else if (data.location) {
        // Fallback to geocoding the city
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(data.location)}&format=json&limit=1`)
          .then(res => res.json())
          .then(results => {
            if (results && results.length > 0) {
              setMapCenter([parseFloat(results[0].lat), parseFloat(results[0].lon)]);
            } else {
              setMapCenter([28.6139, 77.2090]); // Default to New Delhi if not found
            }
          })
          .catch(err => {
            console.error("Geocoding error", err);
            setMapCenter([28.6139, 77.2090]);
          });
      } else {
        setMapCenter([28.6139, 77.2090]);
      }
    }
  }, [data]);

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="max-w-[1120px] mx-auto px-6 py-24 text-center">
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Could not load this listing.</p>
        <p className="text-sm text-red-500 font-mono">{error}</p>
      </div>
    );
  }

  // BUG 1 Fix: Fallback for missing data to prevent white screen crashes
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="max-w-[1120px] mx-auto px-6 py-24 text-center">
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Hotel not found.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-black text-white rounded">Go back home</button>
      </div>
    );
  }

  const handleDayClick = (date) => {
    setBookingError(null);
    if (!startDate || (startDate && endDate)) { setStartDate(date); setEndDate(null); }
    else if (date > startDate) { setEndDate(date); }
    else { setStartDate(date); setEndDate(null); }
  };

  const today         = new Date();
  const leftMonth     = (today.getMonth() + calMonthOffset) % 12;
  const leftYear      = today.getFullYear() + Math.floor((today.getMonth() + calMonthOffset) / 12);
  const rightMonthRaw = leftMonth + 1;
  const rightMonth    = rightMonthRaw % 12;
  const rightYear     = rightMonthRaw > 11 ? leftYear + 1 : leftYear;

  const calculateDays = () => {
    if (startDate && endDate) {
      return Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  const days = calculateDays();
  const totalPrice = (data?.priceRaw || 0) * days;
  const serviceFee = Math.round(totalPrice * 0.14);
  const total = totalPrice + serviceFee;

  // Is the logged-in user the owner of this listing?
  const isOwner = isLoggedIn && user && data &&
    (String(user._id || user.id) === String(data.hostId));

  const handleReserve = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!startDate || !endDate) {
      setBookingError("Please select check-in and checkout dates.");
      return;
    }
    setBookingError(null);
    
    // Always use MongoDB ObjectId (_id) — data.id is a virtual alias that
    // may be absent on freshly-created listings before a page reload.
    navigate(`/checkout/${data._id || data.id}`, {
      state: {
        hotel: data,
        checkIn: startDate,
        checkOut: endDate,
        guests: guests
      }
    });
  };

  // Open (or resume) a real-time message thread with the host
  const handleMessageHost = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    // Navigate to the messages page; pass hostId so the page can init the thread
    navigate(`/messages?hostId=${data.hostId}`);
  };

  return (
    <div className="max-w-[1120px] mx-auto px-6 pt-6 pb-24 text-gray-900 dark:text-gray-100">

      {/* Back to home arrow — always visible for navigation */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-xl transition-colors -ml-3"
        aria-label="Back to home"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Title & Header section */}
      <h1 className="text-[26px] font-semibold mb-2">{data.title}</h1>

      <div className="flex justify-between items-end mb-6">
        <div className="flex items-center gap-1 text-[15px] font-medium underline">
          <span>{data.location}</span>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-md font-medium text-sm transition">
            <FiShare className="w-5 h-5" />
            <span className="underline">Share</span>
          </button>
          <button
            onClick={async () => {
              if (!isLoggedIn) { navigate('/login'); return; }
              await toggleWishlist(String(id));
            }}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-md font-medium text-sm transition"
          >
            {wishlistIds.has(String(id)) ? (
              <BsHeartFill className="w-5 h-5" style={{ color: '#FF385C' }} />
            ) : (
              <FiHeart className="w-5 h-5" />
            )}
            <span className="underline">{wishlistIds.has(String(id)) ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="md:grid grid-cols-4 grid-rows-2 gap-2 md:h-[460px] rounded-xl overflow-hidden mb-12 hidden">
        <div className="col-span-2 row-span-2 relative">
          <S3Image src={data.images?.[0] || data.image} alt="Main" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1 relative">
          <S3Image src={data.images?.[1] || data.image} alt="Gallery 1" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1 relative">
          <S3Image src={data.images?.[2] || data.image} alt="Gallery 2" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1 relative">
          <S3Image src={data.images?.[3] || data.image} alt="Gallery 3" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1 relative">
          <S3Image src={data.images?.[4] || data.image} alt="Gallery 4" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
          <button className="absolute bottom-4 right-4 bg-white border border-black px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2 text-gray-900">
            Show all photos
          </button>
        </div>
      </div>

      {/* Mobile Photo Gallery (Carousel) */}
      <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory h-[260px] rounded-xl overflow-hidden mb-6 relative" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {[data.images?.[0] || data.image, data.images?.[1], data.images?.[2], data.images?.[3], data.images?.[4]].filter(Boolean).map((src, i) => (
          <div key={i} className="flex-none w-full h-full snap-center relative">
            <S3Image src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
          </div>
        ))}
        {/* Floating Show All Button */}
        <button className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-lg text-[13px] font-semibold">
           1 / {[data.images?.[0] || data.image, data.images?.[1], data.images?.[2], data.images?.[3], data.images?.[4]].filter(Boolean).length}
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-20">

        {/* Left Column - Details */}
        <div className="flex-1 w-full md:max-w-[653px]">

          {/* Host Info */}
          <div className="flex justify-between items-center pb-6 border-b">
            <div>
              <h2 className="text-[22px] font-semibold mb-1">Entire home hosted by {data.host?.name || data.hostName || "Independent Host"}</h2>
              <div className="text-[15px] text-gray-700 dark:text-gray-300 flex flex-wrap gap-1 mb-3">
                <span>{data.guests} guests</span> ·
                <span>{data.bedrooms} bedrooms</span> ·
                <span>{data.beds} beds</span> ·
                <span>{data.baths} baths</span>
              </div>
              {/* Message Host — only for non-owners */}
              {!isOwner && (
                <button 
                  id="message-host-btn"
                  onClick={handleMessageHost}
                  className="px-4 py-2 border border-black dark:border-white rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  Message Host
                </button>
              )}
              {/* Owner management shortcut */}
              {isOwner && (
                <button
                  onClick={() => navigate('/host-dashboard')}
                  className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center gap-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Manage listing
                </button>
              )}
            </div>
            <img
              src={data.host?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.host?.name || data.hostName || 'Host')}&background=random&size=112`}
              alt={data.host?.name || "Host"}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.host?.name || data.hostName || 'H')}&background=222222&color=ffffff&size=112`;
              }}
            />
          </div>

          {/* Description */}
          <div className="py-8 border-b">
            <p className="text-[16px] text-gray-800 dark:text-gray-200 leading-relaxed font-light">
              {data.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="py-8 border-b">
            <h2 className="text-[22px] font-semibold mb-6">What this place offers</h2>
            <div className="grid grid-cols-2 gap-y-4">
              {data.amenities?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 text-[16px] text-gray-800 dark:text-gray-200">
                  <BsCheckCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Location */}
          {mapCenter && (
            <div className="py-8">
              <h2 className="text-[22px] font-semibold mb-6">Where you'll be</h2>
              <div className="mb-4 text-[15px] text-gray-700 dark:text-gray-300">
                {data.location && <span className="font-semibold">{data.location}</span>}
              </div>
              <div className="w-full h-[480px] rounded-xl overflow-hidden z-0 relative">
                <MapContainer
                  key={`${mapCenter[0]}-${mapCenter[1]}`}
                  center={mapCenter}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={mapCenter}>
                    <Popup>Exact location provided after booking.</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}

          {/* Permanent Date Picker Section */}
          <div ref={calendarRef} className="py-8 border-t dark:border-gray-700">
            <h2 className="text-[22px] font-semibold mb-1">Select checkout date</h2>
            <p className="text-[15px] font-light text-gray-500 mb-6">Add your travel dates for exact pricing</p>

            <div className="w-full">
              <div className="flex justify-start mb-6">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                  {["dates", "flexible"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCalendarMode(mode)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                        calendarMode === mode ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {mode === "dates" ? "Dates" : "Flexible"}
                    </button>
                  ))}
                </div>
              </div>

              {calendarMode === "dates" ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCalMonthOffset((o) => Math.max(0, o - 1))} disabled={calMonthOffset === 0} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => setCalMonthOffset((o) => o + 1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-8">
                    <CalendarMonth year={leftYear}  month={leftMonth}  startDate={startDate} endDate={endDate} onDayClick={handleDayClick} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} bookedDates={bookedDates} />
                    <CalendarMonth year={rightYear} month={rightMonth} startDate={startDate} endDate={endDate} onDayClick={handleDayClick} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} bookedDates={bookedDates} />
                  </div>
                  <div className="flex gap-2 mt-5 flex-wrap">
                    {["Exact dates","± 1 day","± 2 days","± 3 days","± 7 days","± 14 days"].map((label) => (
                      <button key={label} className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-gray-900 dark:hover:border-gray-400 transition-colors">{label}</button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-start w-full py-2">
                  <h3 className="text-[17px] font-semibold mb-4 text-gray-800 dark:text-gray-200">How long would you like to stay?</h3>
                  <div className="flex gap-3 mb-8">
                    {["Weekend", "Week", "Month"].map(type => (
                      <button 
                        key={type}
                        onClick={() => setStayLength(type)}
                        className={`px-5 py-2 rounded-full border ${stayLength === type ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-800 shadow-sm' : 'border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-400'} text-sm font-light transition-colors`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <h3 className="text-[17px] font-semibold mb-4 text-gray-800 dark:text-gray-200">When do you want to go?</h3>
                  <div className="w-full relative flex items-center group">
                    <div className="flex gap-4 overflow-x-auto snap-x py-2 px-1 w-full hide-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                      {[...Array(12)].map((_, i) => {
                        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
                        const monthStr = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
                        const isSelected = flexibleMonths.includes(monthStr);
                        return (
                          <button
                            key={monthStr}
                            onClick={() => {
                              setFlexibleMonths(prev => 
                                prev.includes(monthStr) ? prev.filter(m => m !== monthStr) : [...prev, monthStr]
                              );
                            }}
                            className={`flex flex-col items-center justify-center snap-start shrink-0 w-[120px] h-[130px] rounded-2xl border ${isSelected ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-800 border-2' : 'border-gray-200 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-400'} transition-all`}
                          >
                            <Calendar className="w-8 h-8 mb-3 text-gray-400" strokeWidth={1.5} />
                            <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{MONTH_NAMES[date.getMonth()]}</span>
                            <span className="text-[13px] text-gray-500">{date.getFullYear()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section – real reviews via shared components */}
          <ReviewsList ref={reviewsRef} targetId={id} targetType="hotel" />
          <WriteReview
            targetId={id}
            targetType="hotel"
            onReviewPosted={() => reviewsRef.current?.refetch()}
          />
        </div>

        {/* Right Column - Sticky Reservation Card (Desktop) */}
        <div className="hidden md:block w-[330px]">
          {isOwner ? (
            /* Host management panel */
            <div className="sticky top-28 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_6px_16px_rgba(0,0,0,0.4)] p-6 z-10">
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Published
                </span>
              </div>
              <h3 className="text-[18px] font-semibold text-center mb-2">This is your listing</h3>
              <p className="text-[14px] text-gray-500 dark:text-gray-400 text-center mb-6">Guests cannot book their own host's listing.</p>
              <button
                onClick={() => navigate('/host-dashboard')}
                className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold py-3 rounded-lg hover:opacity-90 transition text-[15px] mb-3"
              >
                Go to Host Dashboard
              </button>
              <button
                onClick={() => navigate(`/host-dashboard`)}
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-[15px]"
              >
                Edit listing
              </button>
            </div>
          ) : (
            /* Guest reservation card */
            <div className="sticky top-28 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_6px_16px_rgba(0,0,0,0.4)] p-6 z-10">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[22px] font-semibold">₹{data.priceRaw?.toLocaleString('en-IN')}</span>
                <span className="text-[15px] font-light text-gray-600 dark:text-gray-400">night</span>
              </div>

              {/* Date Picker Input */}
              <div className="border border-gray-400 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-900 relative">
                <div className="flex border-b border-gray-400 dark:border-gray-600">
                  <div onClick={scrollToCalendar} className="w-1/2 p-3 border-r border-gray-400 dark:border-gray-600 rounded-tl-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <div className="text-[10px] uppercase font-bold text-gray-800 dark:text-gray-200 mb-1">Check-in</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {startDate ? `${startDate.getDate()} ${MONTH_NAMES[startDate.getMonth()].slice(0,3)}` : "Add date"}
                    </div>
                  </div>
                  <div onClick={scrollToCalendar} className="w-1/2 p-3 rounded-tr-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    <div className="text-[10px] uppercase font-bold text-gray-800 dark:text-gray-200 mb-1">Checkout</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {endDate ? `${endDate.getDate()} ${MONTH_NAMES[endDate.getMonth()].slice(0,3)}` : "Add date"}
                    </div>
                  </div>
                </div>
                <div className="relative" ref={guestDropdownRef}>
                  <div 
                    onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                    className="p-3 w-full rounded-b-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition flex justify-between items-center"
                  >
                    <div className="overflow-hidden">
                      <div className="text-[10px] uppercase font-bold text-gray-800 dark:text-gray-200 mb-1">Guests</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 truncate pr-2">
                        {totalGuests} guest{totalGuests !== 1 && 's'} 
                        {guests.infants > 0 && `, ${guests.infants} infant${guests.infants > 1 ? "s" : ""}`}
                        {guests.pets > 0 && `, ${guests.pets} pet${guests.pets > 1 ? "s" : ""}`}
                      </div>
                    </div>
                    {showGuestDropdown ? <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />}
                  </div>

                  {showGuestDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl p-4 z-50">
                      <GuestCounter label="Adults" sublabel="Age 13+" value={guests.adults} onInc={() => incGuest('adults')} onDec={() => decGuest('adults')} min={1} max={maxGuestsFromListing} />
                      <GuestCounter label="Children" sublabel="Ages 2-12" value={guests.children} onInc={() => incGuest('children')} onDec={() => decGuest('children')} max={Math.max(0, maxGuestsFromListing - guests.adults)} />
                      <GuestCounter label="Infants" sublabel="Under 2" value={guests.infants} onInc={() => incGuest('infants')} onDec={() => decGuest('infants')} max={5} />
                      <GuestCounter label="Pets" sublabel="Bringing a service animal?" value={guests.pets} onInc={() => incGuest('pets')} onDec={() => decGuest('pets')} max={5} />
                      <div className="mt-4 text-xs font-light text-gray-500 text-center">
                        This property allows a maximum of <span className="font-semibold">{maxGuestsFromListing}</span> guests, not including infants.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                id="reserve-btn"
                onClick={handleReserve}
                disabled={isReserving}
                className={`w-full ${isReserving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF385C] hover:bg-[#d90b63]'} text-white font-semibold py-3.5 rounded-lg transition text-[16px] mb-4 flex justify-center items-center gap-2`}
              >
                {isReserving && (
                  <div className="w-5 h-5 border-2 border-t-white border-transparent rounded-full animate-spin"></div>
                )}
                {isReserving ? 'Reserving...' : 'Reserve'}
              </button>
              {bookingError && (
                <div className="text-center text-sm text-red-500 mb-4 font-medium px-2 bg-red-50 py-2 rounded-lg border border-red-100">
                  {bookingError}
                </div>
              )}
              {!bookingError && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6 font-light">
                  You won't be charged yet
                </div>
              )}

              {/* Pricing Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[16px] text-gray-700 dark:text-gray-300 font-light">
                  <span className="underline">₹{data.priceRaw?.toLocaleString('en-IN')} x {days} nights</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[16px] text-gray-700 dark:text-gray-300 font-light">
                  <span className="underline">Airbnb service fee</span>
                  <span>₹{serviceFee.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between font-semibold text-[16px]">
                <span>Total before taxes</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Sticky Booking Bar — hidden for owners */}
      {!isOwner && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex justify-between items-center z-40 transition-transform shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold">₹{data.priceRaw?.toLocaleString('en-IN')}</span>
              <span className="text-[13px] font-light text-gray-600 dark:text-gray-400">night</span>
            </div>
            <div className="text-[13px] text-gray-500 underline font-medium">
              {startDate && endDate ? `${startDate.getDate()} ${MONTH_NAMES[startDate.getMonth()].slice(0,3)} - ${endDate.getDate()} ${MONTH_NAMES[endDate.getMonth()].slice(0,3)}` : "Add dates"}
            </div>
          </div>
          <button 
            onClick={handleReserve}
            disabled={isReserving}
            className={`px-8 py-3 rounded-lg text-white font-semibold flex items-center justify-center min-h-[44px] ${isReserving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FF385C] active:scale-95'}`}
          >
            {isReserving ? 'Reserving...' : 'Reserve'}
          </button>
        </div>
      )}
    </div>
  );
};

// Error Boundary for HotelDetails
class HotelDetailsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-[1120px] mx-auto px-6 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-red-500">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function HotelDetailsWrapper(props) {
  return (
    <HotelDetailsErrorBoundary>
      <HotelDetails {...props} />
    </HotelDetailsErrorBoundary>
  );
}
