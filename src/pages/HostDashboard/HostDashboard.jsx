import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Loader2, Trash2, Edit2, Calendar, Clock, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import LongLogo from "../../assets/logo/long-logo.png";
import ListingCreationWizard from "./ListingCreationWizard.jsx";
import UserMenu from "../../components/Header/UserMenu/UserMenu.jsx";
import axios from "axios";

const HostDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, getToken, user } = useAuth();
  const [showListingForm, setShowListingForm] = useState(false);
  const [resumeDraft, setResumeDraft] = useState(null);
  const [activeTab, setActiveTab] = useState("Today");

  const [properties, setProperties] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [drafts, setDrafts] = useState([]);

  // Today tab
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [todayFilter, setTodayFilter] = useState("today"); // Fix #7

  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"; // Fix #2

  const loadDrafts = () => {
    const idx = JSON.parse(localStorage.getItem("listing_drafts_index") || "[]");
    const loaded = idx.map(id => {
      try { return JSON.parse(localStorage.getItem(`listing_draft_${id}`) || "null"); }
      catch { return null; }
    }).filter(Boolean);
    setDrafts(loaded);
  };

  useEffect(() => {
    if (activeTab === "Listings") { fetchListings(); loadDrafts(); }
    if (activeTab === "Today") fetchHostBookings();
  }, [activeTab]);

  // Fix #7: refetch when filter changes
  useEffect(() => {
    if (activeTab === "Today") fetchHostBookings();
  }, [todayFilter]);

  // Fix #1: call host-reservations not my-trips
  const fetchHostBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await axios.get("http://localhost:5001/api/bookings/host-reservations", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const all = res.data.trips || [];

      // Fix #7: filter by today vs upcoming
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const filtered = todayFilter === "today"
        ? all.filter(t => {
            const ci = new Date(t.checkInDate);
            return ci >= today && ci < tomorrow;
          })
        : all.filter(t => new Date(t.checkInDate) >= tomorrow);

      setBookings(filtered);
    } catch (err) {
      console.error("Error fetching host reservations:", err);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const response = await fetch("http://localhost:5001/api/hotels/host/me", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.success) setProperties(data.properties);
    } catch (err) { console.error(err); }
    finally { setLoadingListings(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch(`http://localhost:5001/api/hotels/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) fetchListings();
      else alert("Failed to delete listing.");
    } catch (err) { console.error(err); }
  };

  const handleDeleteDraft = (draftId) => {
    localStorage.removeItem(`listing_draft_${draftId}`);
    const idx = JSON.parse(localStorage.getItem("listing_drafts_index") || "[]");
    localStorage.setItem("listing_drafts_index", JSON.stringify(idx.filter(id => id !== draftId)));
    loadDrafts();
  };

  const handleResumeDraft = (draft) => { setResumeDraft(draft); setShowListingForm(true); };

  if (!isLoggedIn) { navigate("/login"); return null; }

  if (showListingForm) {
    return (
      <ListingCreationWizard
        onClose={() => {
          setShowListingForm(false);
          setResumeDraft(null);
          fetchListings();
          loadDrafts();
          setActiveTab("Listings");
        }}
        draftData={resumeDraft}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-12 h-20 border-b border-gray-100 sticky top-0 bg-white z-40">
        <img src={LongLogo} alt="Airbnb" className="h-8 w-auto cursor-pointer" onClick={() => navigate("/")} />

        <div className="hidden md:flex items-center gap-8">
          {["Today", "Calendar", "Listings", "Messages"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-7 pt-7 font-medium text-[15px] relative transition-colors ${activeTab === tab ? "text-black" : "text-gray-500 hover:text-gray-900"}`}>
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-full" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/")}
            className="hidden md:block px-4 py-2 text-sm font-semibold hover:bg-gray-50 rounded-full transition-colors">
            Switch to travelling
          </button>
          <div className="flex items-center gap-2 shrink-0">
            {/* Fix #2: real user initial */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {userInitial}
            </div>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-10 pb-40 flex flex-col items-center min-h-[calc(100vh-80px)]">

        {/* ── TODAY TAB ── */}
        {activeTab === "Today" && (
          <>
            {/* Fix #7: functional Today / Upcoming pill toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full mb-12 mt-4">
              {["today", "upcoming"].map(f => (
                <button key={f} onClick={() => setTodayFilter(f)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${todayFilter === f ? "bg-gray-800 text-white shadow-sm" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {loadingBookings ? (
              <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            ) : bookings.length > 0 ? (
              <div className="w-full max-w-2xl space-y-4">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  {todayFilter === "today" ? "Today's check-ins" : "Upcoming reservations"}
                </h2>
                {bookings.map(trip => {
                  const hotel = trip.hotelId || {};
                  const guest = trip.userId || {};
                  const checkIn = new Date(trip.checkInDate);
                  const checkOut = new Date(trip.checkOutDate);
                  const nights = Math.round((checkOut - checkIn) / 86400000);
                  return (
                    <div key={trip._id} className="flex items-start gap-5 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow bg-white">
                      <div className="w-20 h-20 rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/hotel/${hotel._id || hotel.id}`)}>
                        {(hotel.images?.[0] || hotel.image) && (
                          <img src={hotel.images?.[0] || hotel.image} alt={hotel.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[17px] text-gray-900 mb-0.5">{hotel.title || "Booking"}</h3>
                        <p className="text-gray-500 text-sm mb-2">
                          Guest: <span className="font-medium text-gray-800">{guest.firstName} {guest.lastName}</span>
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                          <Calendar className="w-4 h-4 text-[#FF385C]" />
                          <span>Check-in: <span className="font-semibold text-gray-900">
                            {checkIn.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                          </span></span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>Check-out: {checkOut.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {nights} night{nights !== 1 ? "s" : ""}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        trip.status === "confirmed" ? "bg-green-100 text-green-800" :
                        trip.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center max-w-sm text-center mt-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  {todayFilter === "today" ? "No check-ins today" : "No upcoming reservations"}
                </h2>
                <p className="text-gray-500 mb-8">Start hosting to receive bookings from guests.</p>
                <button onClick={() => { setResumeDraft(null); setShowListingForm(true); }}
                  className="px-8 py-3 bg-[#E01561] hover:bg-[#D70466] text-white font-medium rounded-lg transition-colors shadow-sm">
                  Create a listing
                </button>
              </div>
            )}
          </>
        )}

        {/* ── LISTINGS TAB ── */}
        {activeTab === "Listings" && (
          <div className="w-full flex flex-col items-start mt-6">
            <div className="flex justify-between items-center w-full mb-8">
              <h2 className="text-[32px] font-semibold text-gray-900">Your Listings</h2>
              <button onClick={() => { setResumeDraft(null); setShowListingForm(true); }}
                className="px-6 py-2.5 flex items-center gap-2 bg-[#222222] hover:bg-black text-white font-medium rounded-[10px] transition-colors shadow-sm">
                <PlusIcon className="w-5 h-5" /> Create new
              </button>
            </div>

            {loadingListings ? (
              <div className="w-full py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
            ) : (
              <>
                {/* Draft Cards */}
                {drafts.length > 0 && (
                  <div className="w-full mb-10">
                    <h3 className="text-base font-semibold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      Drafts ({drafts.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {drafts.map(draft => (
                        <div key={draft.draftId}
                          className="bg-white border-2 border-dashed border-amber-300 hover:border-amber-500 hover:shadow-md transition-all rounded-2xl overflow-hidden cursor-pointer group"
                          onClick={() => handleResumeDraft(draft)}>
                          <div className="relative aspect-[4/3] bg-amber-50 flex flex-col items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                              <Home className="w-7 h-7 text-amber-500" />
                            </div>
                            <span className="text-amber-600 font-semibold text-sm">Draft — Click to continue</span>
                            <button onClick={e => { e.stopPropagation(); handleDeleteDraft(draft.draftId); }}
                              className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-[15px] text-gray-700 truncate">
                              {draft.formData?.title || draft.formData?.location || "Untitled listing"}
                            </h3>
                            <p className="text-gray-400 text-[13px] mt-1">
                              Saved {new Date(draft.savedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              {" · "}Step {(draft.currentStep || 0) + 1} of 14
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Published listings */}
                {properties.length === 0 && drafts.length === 0 ? (
                  <div className="w-full bg-gray-50 py-24 rounded-2xl flex flex-col items-center border border-gray-100">
                    <p className="text-gray-500 mb-6 text-lg">You haven't created any listings yet.</p>
                    <button onClick={() => { setResumeDraft(null); setShowListingForm(true); }}
                      className="px-8 py-3 bg-[#E01561] hover:bg-[#D70466] text-white font-medium rounded-lg transition-colors shadow-sm">
                      Create a new listing
                    </button>
                  </div>
                ) : properties.length > 0 && (
                  <div className="w-full">
                    <h3 className="text-base font-semibold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      Published ({properties.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {properties.map(prop => (
                        <div key={prop._id} className="bg-white border hover:shadow-lg transition-shadow rounded-2xl overflow-hidden group">
                          <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                            <img src={prop.image || prop.images?.[0]} alt={prop.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-4 right-4 flex gap-2">
                              <button onClick={() => alert("Edit functionality coming soon!")}
                                className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow">
                                <Edit2 className="w-4 h-4 text-gray-700" />
                              </button>
                              <button onClick={() => handleDelete(prop._id || prop.id)}
                                className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-[17px] truncate">{prop.title}</h3>
                            <p className="text-gray-500 text-[15px] truncate">{prop.location}</p>
                            <div className="mt-2 text-[15px] font-semibold">
                              ₹{(prop.priceRaw || prop.pricePerNight || 0).toLocaleString("en-IN")}{" "}
                              <span className="font-normal text-gray-500">/ night</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── OTHER TABS ── */}
        {activeTab !== "Today" && activeTab !== "Listings" && (
          <div className="flex flex-col items-center mt-20 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <ChevronRight className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{activeTab}</h2>
            <p className="text-gray-500">This section is under development.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PlusIcon = ({ ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);

export default HostDashboard;
