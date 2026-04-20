import React, { useState, useRef, useEffect } from "react";
import {
  Search, X, ChevronLeft, ChevronRight, Minus, Plus, MapPin,
  Navigation, Building2, Palmtree, Landmark, Trees, Compass, Calendar
} from "lucide-react";
import { useSearch } from "../../../context/SearchContext.jsx";

// Removed hardcoded DESTINATIONS

// ─── Services data ────────────────────────────────────────────────────────────
const SERVICES = [
  { id: "photography",    label: "Photography",    icon: "📷" },
  { id: "chefs",          label: "Chefs",          icon: "👨\u200d🍳" },
  { id: "massage",        label: "Massage",        icon: "💆" },
  { id: "prepared-meals", label: "Prepared meals", icon: "🍽️" },
  { id: "training",       label: "Training",       icon: "🏋️" },
  { id: "makeup",         label: "Make-up",        icon: "💄" },
  { id: "hair",           label: "Hair",           icon: "✂️" },
  { id: "spa",            label: "Spa treatments", icon: "🧖" },
  { id: "catering",       label: "Catering",       icon: "🍱" },
  { id: "nails",          label: "Nails",          icon: "💅" },
];

function HighlightMatch({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong className="text-gray-900 font-bold">{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </span>
  );
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const getDaysInMonth     = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

// ─── CalendarMonth ────────────────────────────────────────────────────────────
function CalendarMonth({ year, month, startDate, endDate, onDayClick, hoveredDay, setHoveredDay }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex-1 min-w-0">
      <div className="text-center font-semibold text-gray-900 mb-4 text-sm">{MONTH_NAMES[month]} {year}</div>
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
                isPast ? "text-gray-300 cursor-not-allowed" : "cursor-pointer",
                isStart || isEnd ? "bg-gray-900 text-white z-10" : "",
                isInRange ? "bg-rose-50 rounded-none" : "",
                !isPast && !isStart && !isEnd ? "hover:bg-gray-100" : "",
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

// ─── GuestCounter ─────────────────────────────────────────────────────────────
function GuestCounter({ label, sublabel, value, onInc, onDec, min = 0, max = 10 }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <div className="font-semibold text-gray-900 text-sm">{label}</div>
        <div className="text-xs text-gray-400">{sublabel}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDec} disabled={value <= min}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            value <= min ? "border-gray-200 text-gray-200 cursor-not-allowed" : "border-gray-400 text-gray-600 hover:border-gray-900"
          }`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center font-semibold text-sm">{value}</span>
        <button 
          onClick={onInc} disabled={value >= max}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            value >= max ? "border-gray-200 text-gray-200 cursor-not-allowed" : "border-gray-400 text-gray-600 hover:border-gray-900"
          }`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Main SearchBar ───────────────────────────────────────────────────────────
function SearchBar({ activeTab, variant = "full", searchRef, compactSearchRef, onExpand, where, dateLabel, guestLabel }) {
  const { searchState, setSearchState, appliedSearch, setAppliedSearch } = useSearch();
  const [activeSection, setActiveSection]   = useState(null);
  const [calendarMode, setCalendarMode]     = useState("dates");
  const [hoveredDay, setHoveredDay]         = useState(null);
  const [calMonthOffset, setCalMonthOffset] = useState(0);
  const [stayLength, setStayLength]         = useState("Weekend");
  const [flexibleMonths, setFlexibleMonths] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const wrapperRef = useRef(null);
  const inputRef   = useRef(null);

  // Read draft state from context
  const { destination, startDate, endDate, guests } = searchState;
  
  // Helpers to update context state
  const updateSearchState = (key, value) => {
    setSearchState((prev) => ({ ...prev, [key]: value }));
  };
  const setDestination = (val) => updateSearchState("destination", val);
  const setStartDate   = (val) => updateSearchState("startDate", val);
  const setEndDate     = (val) => updateSearchState("endDate", val);
  const setGuests      = (valOrFn) => {
    setSearchState((prev) => ({
      ...prev,
      guests: typeof valOrFn === "function" ? valOrFn(prev.guests) : valOrFn
    }));
  };

  const [allDestinations, setAllDestinations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(destination);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(destination), 300);
    return () => clearTimeout(timer);
  }, [destination]);

  // Fetch all destinations on mount
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/search/destinations');
        const data = await res.json();
        if (data.destinations) {
          setAllDestinations(data.destinations);
          setSuggestions(data.destinations);
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      }
    };
    fetchDestinations();
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim() === '') {
      setSuggestions(allDestinations);
      return;
    }
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`http://localhost:5001/api/search/destinations?q=${encodeURIComponent(debouncedQuery.trim())}`);
        const data = await res.json();
        setSuggestions(data.destinations || []);
      } catch (err) {
        // Fallback filter
        const fallback = allDestinations.filter(d => 
          (d.city || "").toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        setSuggestions(fallback);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery, allDestinations]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const today         = new Date();
  const leftMonth     = (today.getMonth() + calMonthOffset) % 12;
  const leftYear      = today.getFullYear() + Math.floor((today.getMonth() + calMonthOffset) / 12);
  const rightMonthRaw = leftMonth + 1;
  const rightMonth    = rightMonthRaw % 12;
  const rightYear     = rightMonthRaw > 11 ? leftYear + 1 : leftYear;

  const totalGuests = guests.adults + guests.children;
  const guestSummary = activeTab === "Services"
    ? (selectedServices.length > 0 ? `${selectedServices.length} selected` : "Add service")
    : (totalGuests === 0
        ? "Add guests"
        : `${totalGuests} guest${totalGuests > 1 ? "s" : ""}${guests.infants > 0 ? `, ${guests.infants} infant${guests.infants > 1 ? "s" : ""}` : ""}${guests.pets > 0 ? `, ${guests.pets} pet${guests.pets > 1 ? "s" : ""}` : ""}`);

  const dateSummary = (() => {
    if (!startDate) return "Add dates";
    const fmt = (d) => `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
    return endDate ? `${fmt(startDate)} – ${fmt(endDate)}` : fmt(startDate);
  })();

  // ── Click outside ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setActiveSection(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search input when Where opens
  useEffect(() => {
    if (activeSection === "where") setTimeout(() => inputRef.current?.focus(), 20);
  }, [activeSection]);

  // ── Day click ─────────────────────────────────────────────────────────────
  const handleDayClick = (date) => {
    if (startDate && !endDate && date.getTime() === startDate.getTime()) {
      setStartDate(null);
      return;
    }
    if (!startDate || (startDate && endDate)) { setStartDate(date); setEndDate(null); }
    else if (date > startDate) { setEndDate(date); setActiveSection("who"); }
    else { setStartDate(date); setEndDate(null); }
  };

  // ── Guest helpers ─────────────────────────────────────────────────────────
  const limits = { adults: 10, children: 5, infants: 5, pets: 5 };
  const incGuest = (k) => setGuests((g) => ({ ...g, [k]: Math.min(limits[k], g[k] + 1) }));
  const decGuest = (k) => setGuests((g) => ({ ...g, [k]: Math.max(0, g[k] - 1) }));

  // ── Divider visibility ────────────────────────────────────────────────────
  const div1 = !(activeSection === "where" || activeSection === "when");
  const div2 = !(activeSection === "when"  || activeSection === "who");

  const isActive      = activeSection !== null;

  // ════════════════════════════════════════════════════════════════════════════
  // COMPACT VARIANT
  // ════════════════════════════════════════════════════════════════════════════
  if (variant === "compact") {
    const handleExpand = typeof onExpand === "function" ? onExpand : () => {};
    
    // Formatting for applied search
    const totalAppliedGuests = appliedSearch.guests.adults + appliedSearch.guests.children;
    const appliedGuestSummary = totalAppliedGuests === 0 ? "Add guests" : `${totalAppliedGuests} guests`;
    const appliedDateSummary = appliedSearch.startDate
      ? `${MONTH_NAMES[appliedSearch.startDate.getMonth()].slice(0,3)} ${appliedSearch.startDate.getDate()}`
      : "Anytime";

    return (
      <div ref={compactSearchRef} className="flex justify-center">
        <button
          onClick={handleExpand}
          aria-label="Expand search"
          className="flex items-center bg-white rounded-full shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 overflow-hidden h-12"
          style={{ width: "fit-content", maxWidth: "420px" }}
        >
          <div className="flex items-center px-4 border-r border-gray-200 h-full">
            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
              {appliedSearch.destination || where || "Anywhere"}
            </span>
          </div>
          <div className="flex items-center px-4 border-r border-gray-200 h-full">
            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
              {appliedSearch.startDate ? appliedDateSummary : (dateLabel || "Anytime")}
            </span>
          </div>
          <div className="flex items-center gap-3 pl-4 pr-2 h-full">
            <span className="text-gray-500 text-sm whitespace-nowrap">
              {totalAppliedGuests > 0 ? appliedGuestSummary : (guestLabel || "Add guests")}
            </span>
            <div className="bg-[#ff385c] h-8 w-8 rounded-full flex items-center justify-center text-white hover:bg-[#e31c5f] transition-colors shrink-0">
              <Search className="h-3.5 w-3.5" strokeWidth={3} />
            </div>
          </div>
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // FULL VARIANT
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div ref={wrapperRef} className="w-full flex justify-center">

      {/* ── Search Pill ──────────────────────────────────────────────────────── */}
      <div
        ref={searchRef}
        className={`flex items-center w-full max-w-3xl rounded-full transition-all duration-200 h-16 ${
          isActive
            ? "bg-gray-100 shadow-none border border-gray-200"
            : "bg-white border border-gray-200 shadow-lg hover:shadow-xl"
        }`}
      >

        {/* ══ WHERE — relative wrapper so dropdown anchors here ══ */}
        <div className="relative flex-1 h-full">
          <button
            onClick={() => setActiveSection(activeSection === "where" ? null : "where")}
            className={`flex flex-col justify-center px-6 rounded-full h-full w-full text-left transition-colors duration-150 ${
              activeSection === "where" ? "bg-white shadow-md" : isActive ? "hover:bg-gray-200/60" : "hover:bg-gray-100"
            }`}
          >
            <span className="text-xs font-bold text-gray-900">Where</span>
            <span className={`text-sm truncate ${destination ? "text-gray-900 font-medium" : "text-gray-400"}`}>
              {destination || "Search destinations"}
            </span>
          </button>

          {activeSection === "where" && (
            <div className="absolute top-full mt-3 left-0 z-50">
              <div className="bg-white rounded-3xl shadow-[0_6px_20px_rgba(0,0,0,0.18)] p-4 w-[400px]">
                {/* Input */}
                <div className="relative mb-3">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Search destinations"
                    className="w-full pl-10 pr-9 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-gray-400 transition-colors bg-white"
                  />
                  {destination && (
                    <button onClick={() => setDestination("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
                  {!destination ? "Popular Destinations" : "Suggestions"}
                </p>
                <div className="max-h-[360px] overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                  {loadingSuggestions ? (
                    <div className="p-4 text-center text-gray-400 text-sm">Searching destinations...</div>
                  ) : suggestions.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-gray-500 text-sm">No destinations found for "{destination}"</p>
                      <p className="text-gray-400 text-xs mt-1">Try a different city name</p>
                    </div>
                  ) : (
                    suggestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => { setDestination(item.city); setActiveSection("when"); }}
                        className="flex items-center gap-4 w-full px-2 py-3 hover:bg-gray-100 rounded-2xl transition-colors text-left"
                      >
                        <div className="w-[52px] h-[52px] rounded-2xl bg-gray-100 flex items-center justify-center shrink-0">
                          <MapPin className="h-6 w-6 text-gray-500" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[15px] font-medium text-gray-800 leading-tight">
                            <HighlightMatch text={item.city} query={destination} />
                          </div>
                          <div className="text-[13px] text-gray-400 mt-0.5">
                            {item.count} {item.count === 1 ? 'listing' : 'listings'} available
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider 1 */}
        <div className={`h-8 w-px shrink-0 transition-colors duration-150 ${div1 ? "bg-gray-200" : "bg-transparent"}`} />

        {/* ══ WHEN — relative wrapper so dropdown anchors here ══ */}
        <div className="relative flex-1 h-full">
          <button
            onClick={() => setActiveSection(activeSection === "when" ? null : "when")}
            className={`flex flex-col justify-center px-6 rounded-full h-full w-full text-left transition-colors duration-150 ${
              activeSection === "when" ? "bg-white shadow-md" : isActive ? "hover:bg-gray-200/60" : "hover:bg-gray-100"
            }`}
          >
            <span className="text-xs font-bold text-gray-900">When</span>
            <span className={`text-sm ${startDate ? "text-gray-900 font-medium" : "text-gray-400"}`}>{dateSummary}</span>
          </button>

          {activeSection === "when" && (
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-white rounded-3xl shadow-[0_6px_20px_rgba(0,0,0,0.18)] p-6 w-[680px]">
                {/* Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="flex bg-gray-100 rounded-full p-1">
                    {["dates", "flexible"].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setCalendarMode(mode)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                          calendarMode === mode ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
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
                      <button onClick={() => setCalMonthOffset((o) => Math.max(0, o - 1))} disabled={calMonthOffset === 0} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={() => setCalMonthOffset((o) => o + 1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-8">
                      <CalendarMonth year={leftYear}  month={leftMonth}  startDate={startDate} endDate={endDate} onDayClick={handleDayClick} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} />
                      <CalendarMonth year={rightYear} month={rightMonth} startDate={startDate} endDate={endDate} onDayClick={handleDayClick} hoveredDay={hoveredDay} setHoveredDay={setHoveredDay} />
                    </div>
                    <div className="flex gap-2 mt-5 flex-wrap">
                      {["Exact dates","± 1 day","± 2 days","± 3 days","± 7 days","± 14 days"].map((label) => (
                        <button key={label} className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:border-gray-900 transition-colors">{label}</button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center w-full px-6 py-2">
                    <h3 className="text-[17px] font-semibold mb-4 text-gray-800">How long would you like to stay?</h3>
                    <div className="flex gap-3 mb-8">
                      {["Weekend", "Week", "Month"].map(type => (
                        <button 
                          key={type}
                          onClick={() => setStayLength(type)}
                          className={`px-5 py-2 rounded-full border ${stayLength === type ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-300 hover:border-gray-900'} text-sm font-light transition-colors`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <h3 className="text-[17px] font-semibold mb-4 text-gray-800">When do you want to go?</h3>
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
                              className={`flex flex-col items-center justify-center snap-start shrink-0 w-[120px] h-[130px] rounded-2xl border ${isSelected ? 'border-gray-900 bg-gray-50 border-2' : 'border-gray-200 hover:border-gray-900'} transition-all`}
                            >
                              <Calendar className="w-8 h-8 mb-3 text-gray-400" strokeWidth={1.5} />
                              <span className="text-[15px] font-semibold text-gray-900">{MONTH_NAMES[date.getMonth()]}</span>
                              <span className="text-[13px] text-gray-500">{date.getFullYear()}</span>
                            </button>
                          );
                        })}
                      </div>
                      <button className="absolute -right-4 bg-white border border-gray-200 shadow-md rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:scale-105 transition-all opacity-0 group-hover:opacity-100 z-10">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider 2 */}
        <div className={`h-8 w-px shrink-0 transition-colors duration-150 ${div2 ? "bg-gray-200" : "bg-transparent"}`} />

        <div
          className={`relative flex items-center h-full rounded-full transition-colors duration-150 ${
            activeSection === "who"
              ? "bg-white shadow-md"
              : isActive ? "hover:bg-gray-200/60" : "hover:bg-gray-100"
          }`}
          onClick={() => setActiveSection(activeSection === "who" ? null : "who")}
        >
          {/* WHO button — no active bg here; handled by wrapper */}
          <button
            className="flex flex-col justify-center pl-6 pr-3 h-full text-left"
            style={{ minWidth: "160px" }}
          >
            <span className="text-xs font-bold text-gray-900">
              {activeTab === "Services" ? "Type of service" : "Who"}
            </span>
            <span className={`text-sm ${totalGuests > 0 ? "text-gray-900 font-medium" : "text-gray-400"}`}>
              {guestSummary}
            </span>
          </button>

          {/* SEARCH BUTTON — inside same wrapper as Who */}
          <div className="pr-3 pl-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setAppliedSearch({ destination, startDate, endDate, guests });
                setActiveSection(null);
                if (compactSearchRef?.current) {
                  // close expanded bar if we search from it
                }
              }}
              className={`flex items-center gap-2 rounded-full text-white font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[#ff385c] hover:bg-[#e31c5f] px-5 py-3"
                  : "bg-[#ff385c] hover:bg-[#e31c5f] h-10 w-10 justify-center"
              }`}
            >
              <Search className="h-4 w-4 shrink-0" strokeWidth={3} />
              {isActive && <span className="text-sm">Search</span>}
            </button>
          </div>

          {/* WHO / SERVICE DROPDOWN */}
          {activeSection === "who" && (
            <div className="absolute top-full mt-3 right-0 z-50" onClick={(e) => e.stopPropagation()}>
              {activeTab === "Services" ? (
                /* ── Service type picker ── */
                <div className="bg-white rounded-3xl shadow-[0_6px_20px_rgba(0,0,0,0.18)] p-6 w-[480px]">
                  <div className="flex flex-wrap gap-3">
                    {SERVICES.map((svc) => {
                      const isSelected = selectedServices.includes(svc.id);
                      return (
                      <button
                        key={svc.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServices(prev => 
                            prev.includes(svc.id) ? prev.filter(s => s !== svc.id) : [...prev, svc.id]
                          );
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all hover:shadow-sm active:scale-95 ${isSelected ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-sm' : 'border-gray-200 hover:border-gray-400 text-gray-800'}`}
                      >
                        <span className="text-base leading-none">{svc.icon}</span>
                        <span>{svc.label}</span>
                      </button>
                    )})}
                  </div>
                </div>
              ) : (
                /* ── Guest counter ── */
                <div className="bg-white rounded-3xl shadow-[0_6px_20px_rgba(0,0,0,0.18)] p-6 w-80">
                  <GuestCounter label="Adults"   sublabel="Ages 13 or above"           value={guests.adults}   onInc={() => incGuest("adults")}   onDec={() => decGuest("adults")} min={1} max={10} />
                  <GuestCounter label="Children" sublabel="Ages 2–12"                  value={guests.children} onInc={() => incGuest("children")} onDec={() => decGuest("children")} max={5} />
                  <GuestCounter label="Infants"  sublabel="Under 2"                    value={guests.infants}  onInc={() => incGuest("infants")}  onDec={() => decGuest("infants")} max={5} />
                  <GuestCounter label="Pets"     sublabel="Bringing a service animal?" value={guests.pets}     onInc={() => incGuest("pets")}     onDec={() => decGuest("pets")} max={5} />
                </div>
              )}
            </div>
          )}
        </div>


      </div>
    </div>
  );
}

export default SearchBar;