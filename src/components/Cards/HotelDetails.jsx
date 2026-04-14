import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShare, FiHeart, FiStar } from 'react-icons/fi';
import { BsCheckCircle } from 'react-icons/bs';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ChevronLeft, ChevronRight, Calendar, Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { fetchHotelById } from '../../services/api';

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

function CalendarMonth({ year, month, startDate, endDate, onDayClick, hoveredDay, setHoveredDay }) {
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
          const isStart   = startDate && date.getTime() === startDate.getTime();
          const isEnd     = endDate   && date.getTime() === endDate.getTime();
          const isInRange = startDate && (endDate || hoveredDay) && date > startDate && date < (hoveredDay && !endDate ? hoveredDay : endDate);
          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => !isPast && onDayClick(date)}
              onMouseEnter={() => !isPast && startDate && !endDate && setHoveredDay(date)}
              onMouseLeave={() => setHoveredDay(null)}
              className={[
                "relative h-9 w-full text-sm font-medium rounded-full transition-all",
                isPast ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" : "cursor-pointer text-gray-900 dark:text-gray-100",
                isStart || isEnd ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 z-10" : "",
                isInRange ? "bg-rose-50 dark:bg-rose-900/30 rounded-none text-gray-900 dark:text-gray-100" : "",
                !isPast && !isStart && !isEnd ? "hover:bg-gray-100 dark:hover:bg-gray-800" : "",
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

// ─── Mock Reviews ──────────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  { id: 1, name: "John Doe", date: "March 2026", rating: 5, text: "Amazing stay! The place was exactly as described and the host was very responsive. The view from the balcony is breathtaking.", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Sarah Smith", date: "February 2026", rating: 4, text: "Great location, close to all the main attractions. The apartment was clean and comfortable. A wonderful experience.", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Michael Johnson", date: "January 2026", rating: 5, text: "Absolutely loved it! The amenities were top-notch and the bed was super comfy. Would definitely book again.", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Emily Davis", date: "December 2025", rating: 5, text: "A true hidden gem. We had such a relaxing time here. The kitchen was well-stocked and we enjoyed making dinners.", avatar: "https://i.pravatar.cc/150?u=4" }
];

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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isReserving, setIsReserving] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  
  // Custom DatePicker states
  const [calendarMode, setCalendarMode]     = useState("dates");
  const [hoveredDay, setHoveredDay]         = useState(null);
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [stayLength, setStayLength]         = useState("Weekend");
  const [flexibleMonths, setFlexibleMonths] = useState([]);

  // New states for guest & scroll
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const calendarRef = useRef(null);
  const guestDropdownRef = useRef(null);

  const totalGuests = guests.adults + guests.children;

  const limits = { adults: 10, children: 5, infants: 5, pets: 5 };
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

    // Fetch real reviews
    fetch(`http://localhost:5001/api/hotels/${id}/reviews`)
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.success) {
          setReviews(data.reviews);
        }
      })
      .catch(console.error);

    return () => { cancelled = true; };
  }, [id]);

  const handleSubmitReview = async () => {
    if (!newReviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem("token"); // Assuming auth context pattern
      const response = await fetch(`http://localhost:5001/api/hotels/${id}/reviews`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ rating: newReviewRating, text: newReviewText })
      });
      const result = await response.json();
      if (result.success) {
        // Refresh reviews
        const revRes = await fetch(`http://localhost:5001/api/hotels/${id}/reviews`);
        const revData = await revRes.json();
        setReviews(revData.reviews);
        setNewReviewText("");
        setNewReviewRating(5);
      } else {
        alert(result.error || "Failed to post review. Ensure you are logged in.");
      }
    } catch(err) {
      console.error(err);
      alert("Error posting review. Please log in first.");
    } finally {
      setSubmittingReview(false);
    }
  };

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

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="max-w-[1120px] mx-auto px-6 py-24 text-center">
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Could not load this listing.</p>
        <p className="text-sm text-red-500 font-mono">{error}</p>
      </div>
    );
  }

  const calculateDays = () => {
    if (startDate && endDate) {
      return Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  const days = calculateDays();
  const totalPrice = data.priceRaw * days;
  const serviceFee = Math.round(totalPrice * 0.14);
  const total = totalPrice + serviceFee;

  const handleReserve = () => {
    if (!startDate || !endDate) {
      setBookingError("Please select check-in and checkout dates.");
      return;
    }
    setBookingError(null);
    
    navigate(`/checkout/${data.id}`, {
      state: {
        hotel: data,
        checkIn: startDate,
        checkOut: endDate,
        guests: guests
      }
    });
  };

  return (
    <div className="max-w-[1120px] mx-auto px-6 pt-6 pb-24 text-gray-900 dark:text-gray-100">

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
          <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-md font-medium text-sm transition">
            <FiHeart className="w-5 h-5" />
            <span className="underline">Save</span>
          </button>
        </div>
      </div>

      {/* 5-Image Gallery Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[460px] rounded-xl overflow-hidden mb-12">
        <div className="col-span-2 row-span-2">
          <S3Image src={data.images?.[0] || data.image} alt="Main" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1">
          <S3Image src={data.images?.[1] || data.image} alt="Gallery 1" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1">
          <S3Image src={data.images?.[2] || data.image} alt="Gallery 2" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1">
          <S3Image src={data.images?.[3] || data.image} alt="Gallery 3" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1 relative">
          <S3Image src={data.images?.[4] || data.image} alt="Gallery 4" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
          <button className="absolute bottom-4 right-4 bg-white border border-black px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2">
            Show all photos
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-20">

        {/* Left Column - Details */}
        <div className="flex-1 max-w-[653px]">

          {/* Host Info */}
          <div className="flex justify-between items-center pb-6 border-b">
            <div>
              <h2 className="text-[22px] font-semibold mb-1">Entire home hosted by {data.host?.name}</h2>
              <div className="text-[15px] text-gray-700 dark:text-gray-300 flex gap-1">
                <span>{data.guests} guests</span> ·
                <span>{data.bedrooms} bedrooms</span> ·
                <span>{data.beds} beds</span> ·
                <span>{data.baths} baths</span>
              </div>
            </div>
            <img src={data.host?.image} alt={data.host?.name} className="w-14 h-14 rounded-full object-cover" />
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
          {data.coordinates && (
            <div className="py-8">
              <h2 className="text-[22px] font-semibold mb-6">Where you'll be</h2>
              <div className="w-full h-[480px] rounded-xl overflow-hidden z-0 relative">
                <MapContainer
                  center={data.coordinates}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={data.coordinates}>
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
                    <CalendarMonth year={leftYear}  month={leftMonth}  startDate={startDate} endDate={endDate} onDayClick={handleDayClick} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} />
                    <CalendarMonth year={rightYear} month={rightMonth} startDate={startDate} endDate={endDate} onDayClick={handleDayClick} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} />
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

          {/* Reviews Section */}
          <div className="py-8 border-t">
            <div className="flex items-center gap-2 mb-8">
              <FiStar className="fill-current w-6 h-6" />
              <h2 className="text-[22px] font-semibold">{data.rating || "New"} · {reviews.length} reviews</h2>
            </div>
            
            {reviews.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                {reviews.map(review => (
                  <div key={review._id}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex justify-center items-center font-bold text-gray-500">
                        {review.userId?.firstName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-[16px]">{review.userId?.firstName || "Guest"}</div>
                        <div className="text-[14px] text-gray-500">{new Date(review.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
                      </div>
                    </div>
                    <p className="text-[16px] text-gray-800 dark:text-gray-200 font-light leading-relaxed">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-gray-500 mb-8 italic">No reviews yet. Be the first to review this property!</div>
            )}
            
            <button className="mt-8 px-6 py-3 border border-gray-900 dark:border-gray-100 rounded-lg text-[16px] font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Show all reviews
            </button>

            {/* Write a review */}
            <div className="mt-12 bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
               <h3 className="text-[18px] font-semibold mb-4">Leave a review</h3>
               <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">Your Rating: </span>
                  {[1,2,3,4,5].map(v => (
                    <button key={v} onClick={() => setNewReviewRating(v)} className="text-lg">
                      <FiStar className={newReviewRating >= v ? "fill-[#FF385C] text-[#FF385C]" : "text-gray-400"} />
                    </button>
                  ))}
               </div>
               <textarea 
                  className="w-full outline-none border border-gray-300 dark:border-gray-600 p-4 rounded-xl resize-none focus:border-black dark:bg-gray-900"
                  rows={4}
                  placeholder="Share your experience..."
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
               />
               <button 
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="mt-4 px-6 py-2.5 bg-[#222222] hover:bg-black text-white font-medium rounded-lg transition-colors shadow-sm disabled:bg-gray-400"
               >
                 {submittingReview ? "Submitting..." : "Submit Review"}
               </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sticky Reservation Card */}
        <div className="w-[330px]">
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
                    <GuestCounter label="Adults" sublabel="Age 13+" value={guests.adults} onInc={() => incGuest('adults')} onDec={() => decGuest('adults')} min={1} max={10} />
                    <GuestCounter label="Children" sublabel="Ages 2-12" value={guests.children} onInc={() => incGuest('children')} onDec={() => decGuest('children')} max={5} />
                    <GuestCounter label="Infants" sublabel="Under 2" value={guests.infants} onInc={() => incGuest('infants')} onDec={() => decGuest('infants')} max={5} />
                    <GuestCounter label="Pets" sublabel="Bringing a service animal?" value={guests.pets} onInc={() => incGuest('pets')} onDec={() => decGuest('pets')} max={5} />
                    <div className="mt-4 text-xs font-light text-gray-500 text-center">
                      This property allows a maximum of {data.guests} guests, not including infants.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
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
        </div>

      </div>
    </div>
  );
};

export default HotelDetails;
