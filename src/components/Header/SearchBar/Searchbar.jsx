import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar, Users, X, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const SUGGESTED_DESTINATIONS = [
  { icon: "🌍", label: "I'm flexible", sublabel: "Explore any destination" },
  { icon: "📍", label: "Nearby", sublabel: "Find what's around you" },
  { icon: "🏙️", label: "Mumbai", sublabel: "India" },
  { icon: "🌴", label: "Goa", sublabel: "India" },
  { icon: "🏔️", label: "Manali", sublabel: "Himachal Pradesh, India" },
  { icon: "🕌", label: "Jaipur", sublabel: "Rajasthan, India" },
];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// ─── Calendar Sub-component ──────────────────────────────────────────────────

function CalendarMonth({ year, month, startDate, endDate, onDayClick, hoveredDay, setHoveredDay }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="flex-1 min-w-0">
      <div className="text-center font-semibold text-gray-900 mb-4 text-sm">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-0 text-center">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <div key={d} className="text-xs font-semibold text-gray-400 py-1">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const date = new Date(year, month, day);
          date.setHours(0, 0, 0, 0);
          const isPast = date < today;
          const isStart = startDate && date.getTime() === startDate.getTime();
          const isEnd = endDate && date.getTime() === endDate.getTime();
          const isInRange =
            startDate &&
            (endDate || hoveredDay) &&
            date > startDate &&
            date < (hoveredDay && !endDate ? hoveredDay : endDate);

          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => !isPast && onDayClick(date)}
              onMouseEnter={() => !isPast && startDate && !endDate && setHoveredDay(date)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`
                relative h-9 w-full text-sm font-medium rounded-full transition-all
                ${isPast ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
                ${isStart || isEnd ? "bg-gray-900 text-white z-10" : ""}
                ${isInRange ? "bg-airbnb/10 rounded-none" : ""}
                ${!isPast && !isStart && !isEnd ? "hover:bg-gray-100" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Guest Counter Sub-component ─────────────────────────────────────────────

function GuestCounter({ label, sublabel, value, onInc, onDec, min = 0 }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div>
        <div className="font-semibold text-gray-900 text-sm">{label}</div>
        <div className="text-xs text-gray-400">{sublabel}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDec}
          disabled={value <= min}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
            value <= min
              ? "border-gray-200 text-gray-200 cursor-not-allowed"
              : "border-gray-400 text-gray-600 hover:border-gray-900"
          }`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center font-semibold text-sm">{value}</span>
        <button
          onClick={onInc}
          className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center hover:border-gray-900 transition-all"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Main SearchBar ──────────────────────────────────────────────────────────

function SearchBar({
  activeTab,
  variant = "full",
  searchRef,
  compactSearchRef,
  onExpand,
  where,
  dateLabel,
  guestLabel,
}) {
  // ── State ──
  const [activeSection, setActiveSection] = useState(null); // "where" | "when" | "who" | null
  const [destination, setDestination] = useState("");
  const [calendarMode, setCalendarMode] = useState("dates"); // "dates" | "flexible"
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [calMonthOffset, setCalMonthOffset] = useState(0); // months offset from today
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0, pets: 0 });
  const wrapperRef = useRef(null);

  // ── Derived values ──
  const today = new Date();
  const leftMonth = (today.getMonth() + calMonthOffset) % 12;
  const leftYear = today.getFullYear() + Math.floor((today.getMonth() + calMonthOffset) / 12);
  const rightMonthRaw = leftMonth + 1;
  const rightMonth = rightMonthRaw % 12;
  const rightYear = rightMonthRaw > 11 ? leftYear + 1 : leftYear;

  const totalGuests = guests.adults + guests.children;
  const guestSummary =
    totalGuests === 0
      ? activeTab === "Services" ? "Add services" : "Add guests"
      : `${totalGuests} guest${totalGuests > 1 ? "s" : ""}${guests.infants > 0 ? `, ${guests.infants} infant${guests.infants > 1 ? "s" : ""}` : ""}${guests.pets > 0 ? `, ${guests.pets} pet${guests.pets > 1 ? "s" : ""}` : ""}`;

  const dateSummary = (() => {
    if (!startDate) return "Add dates";
    const fmt = (d) => `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
    if (!endDate) return fmt(startDate);
    return `${fmt(startDate)} – ${fmt(endDate)}`;
  })();

  // ── Click outside to close ──
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setActiveSection(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Day click logic ──
  const handleDayClick = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date > startDate) {
        setEndDate(date);
        setActiveSection("who"); // auto-advance
      } else {
        setStartDate(date);
        setEndDate(null);
      }
    }
  };

  // ── Guest helpers ──
  const incGuest = (key) => setGuests((g) => ({ ...g, [key]: g[key] + 1 }));
  const decGuest = (key) =>
    setGuests((g) => ({ ...g, [key]: Math.max(key === "adults" ? 0 : 0, g[key] - 1) }));

  const isActive = activeSection !== null;

  // ════════════════════════════════════════════════════════════════════════════
  // COMPACT VARIANT (scrolled state)
  // ════════════════════════════════════════════════════════════════════════════
  if (variant === "compact") {
    const handleExpand = typeof onExpand === "function" ? onExpand : () => {};

    return (
      <div ref={compactSearchRef} className="flex justify-center">
        <button
          onClick={handleExpand}
          aria-label="Expand search"
          className="flex items-center bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 overflow-hidden h-12"
          style={{ width: "fit-content", maxWidth: "380px" }}
        >
          {/* Where */}
          <div className="flex items-center px-4 border-r border-gray-200 h-full">
            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
              {where || "Anywhere"}
            </span>
          </div>

          {/* When */}
          <div className="flex items-center px-4 border-r border-gray-200 h-full">
            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
              {dateLabel || "Anytime"}
            </span>
          </div>

          {/* Who + Search button */}
          <div className="flex items-center gap-3 pl-4 pr-2 h-full">
            <span className="text-gray-500 text-sm whitespace-nowrap">
              {guestLabel || (activeTab === "Services" ? "Add services" : "Add guests")}
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
  // FULL EXPANDED VARIANT
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* Backdrop */}
      {isActive && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onMouseDown={() => setActiveSection(null)}
        />
      )}

      {/* Search pill wrapper */}
      <div ref={wrapperRef} className="relative z-40 w-full flex justify-center">
        <div
          ref={searchRef}
          className={`flex items-center w-full max-w-3xl rounded-full transition-all duration-200 h-16 ${
            isActive
              ? "bg-gray-100 shadow-none border border-gray-200"
              : "bg-white border border-gray-200 shadow-lg hover:shadow-xl"
          }`}
        >
          {/* ── WHERE ── */}
          <button
            onClick={() => setActiveSection(activeSection === "where" ? null : "where")}
            className={`flex flex-col justify-center px-6 rounded-full h-full flex-1 text-left transition-colors duration-150 ${
              activeSection === "where"
                ? "bg-white shadow-md"
                : isActive
                ? "hover:bg-gray-200/60"
                : "hover:bg-gray-100"
            }`}
          >
            <span className="text-xs font-bold text-gray-900">Where</span>
            <span className={`text-sm ${destination ? "text-gray-900 font-medium" : "text-gray-400"}`}>
              {destination || "Search destinations"}
            </span>
          </button>

          <div className={`h-8 w-px ${isActive && activeSection !== "where" && activeSection !== "when" ? "bg-transparent" : "bg-gray-200"}`} />

          {/* ── WHEN ── */}
          <button
            onClick={() => setActiveSection(activeSection === "when" ? null : "when")}
            className={`flex flex-col justify-center px-6 rounded-full h-full flex-1 text-left transition-colors duration-150 ${
              activeSection === "when"
                ? "bg-white shadow-md"
                : isActive
                ? "hover:bg-gray-200/60"
                : "hover:bg-gray-100"
            }`}
          >
            <span className="text-xs font-bold text-gray-900">When</span>
            <span className={`text-sm ${startDate ? "text-gray-900 font-medium" : "text-gray-400"}`}>
              {dateSummary}
            </span>
          </button>

          <div className={`h-8 w-px ${isActive && activeSection !== "when" && activeSection !== "who" ? "bg-transparent" : "bg-gray-200"}`} />

          {/* ── WHO + SEARCH BUTTON ── */}
          <button
            onClick={() => setActiveSection(activeSection === "who" ? null : "who")}
            className={`flex flex-col justify-center pl-6 pr-3 rounded-full h-full text-left transition-colors duration-150 ${
              activeSection === "who"
                ? "bg-white shadow-md"
                : isActive
                ? "hover:bg-gray-200/60"
                : "hover:bg-gray-100"
            }`}
            style={{ minWidth: "200px" }}
          >
            <span className="text-xs font-bold text-gray-900">
              {activeTab === "Services" ? "Type of services" : "Who"}
            </span>
            <span className={`text-sm ${totalGuests > 0 ? "text-gray-900 font-medium" : "text-gray-400"}`}>
              {guestSummary}
            </span>
          </button>

          {/* Search button */}
          <div className="pr-3 shrink-0">
            <button
              onClick={() => setActiveSection(null)}
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
        </div>

        {/* ══ WHERE DROPDOWN ══ */}
        {activeSection === "where" && (
          <div className="absolute top-[72px] left-0 right-0 flex justify-start z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-96">
              {/* Input */}
              <div className="relative mb-4">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Search destinations"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-gray-900 transition-colors"
                />
                {destination && (
                  <button
                    onClick={() => setDestination("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Suggestions */}
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Suggested destinations
              </div>
              <div className="space-y-1">
                {SUGGESTED_DESTINATIONS.filter(
                  (d) =>
                    !destination ||
                    d.label.toLowerCase().includes(destination.toLowerCase())
                ).map((dest) => (
                  <button
                    key={dest.label}
                    onClick={() => {
                      setDestination(dest.label === "I'm flexible" || dest.label === "Nearby" ? dest.label : dest.label);
                      setActiveSection("when");
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                      {dest.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{dest.label}</div>
                      <div className="text-xs text-gray-400">{dest.sublabel}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ WHEN DROPDOWN ══ */}
        {activeSection === "when" && (
          <div className="absolute top-[72px] left-1/2 -translate-x-1/2 z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-[680px]">
              {/* Dates / Flexible toggle */}
              <div className="flex justify-center mb-6">
                <div className="flex bg-gray-100 rounded-full p-1">
                  {["dates", "flexible"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCalendarMode(mode)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                        calendarMode === mode
                          ? "bg-white shadow text-gray-900"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {mode === "dates" ? "Dates" : "Flexible"}
                    </button>
                  ))}
                </div>
              </div>

              {calendarMode === "dates" ? (
                <>
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setCalMonthOffset((o) => Math.max(0, o - 1))}
                      disabled={calMonthOffset === 0}
                      className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCalMonthOffset((o) => o + 1)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Two-month calendar */}
                  <div className="flex gap-8">
                    <CalendarMonth
                      year={leftYear}
                      month={leftMonth}
                      startDate={startDate}
                      endDate={endDate}
                      onDayClick={handleDayClick}
                      hoveredDay={hoveredDay}
                      setHoveredDay={setHoveredDay}
                    />
                    <CalendarMonth
                      year={rightYear}
                      month={rightMonth}
                      startDate={startDate}
                      endDate={endDate}
                      onDayClick={handleDayClick}
                      hoveredDay={hoveredDay}
                      setHoveredDay={setHoveredDay}
                    />
                  </div>

                  {/* Duration chips */}
                  <div className="flex gap-2 mt-5 flex-wrap">
                    {["Exact dates", "± 1 day", "± 2 days", "± 3 days", "± 7 days", "± 14 days"].map((label) => (
                      <button
                        key={label}
                        className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:border-gray-900 transition-colors"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Flexible date search coming soon
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ WHO DROPDOWN ══ */}
        {activeSection === "who" && (
          <div className="absolute top-[72px] right-0 z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-80">
              <GuestCounter
                label="Adults"
                sublabel="Ages 13 or above"
                value={guests.adults}
                onInc={() => incGuest("adults")}
                onDec={() => decGuest("adults")}
              />
              <GuestCounter
                label="Children"
                sublabel="Ages 2–12"
                value={guests.children}
                onInc={() => incGuest("children")}
                onDec={() => decGuest("children")}
              />
              <GuestCounter
                label="Infants"
                sublabel="Under 2"
                value={guests.infants}
                onInc={() => incGuest("infants")}
                onDec={() => decGuest("infants")}
              />
              <GuestCounter
                label="Pets"
                sublabel="Bringing a service animal?"
                value={guests.pets}
                onInc={() => incGuest("pets")}
                onDec={() => decGuest("pets")}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SearchBar;