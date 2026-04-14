import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, MapPin, IndianRupee, ImagePlus, Loader2, Menu, Trash2, Edit2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import LongLogo from "../../assets/logo/long-logo.png";
import ListingCreationWizard from "./ListingCreationWizard.jsx";
import UserMenu from "../../components/Header/UserMenu/UserMenu.jsx";

const HostDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, getToken } = useAuth();
  const [showListingForm, setShowListingForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Today");
  
  const [properties, setProperties] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);

  useEffect(() => {
    if (activeTab === "Listings") {
      fetchListings();
    }
  }, [activeTab]);

  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const response = await fetch("http://localhost:5001/api/hotels/host/me", {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setProperties(data.properties);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const response = await fetch(`http://localhost:5001/api/hotels/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (response.ok) {
        fetchListings();
      } else {
        alert("Failed to delete listing.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  if (showListingForm) {
    return <ListingCreationWizard onClose={() => setShowListingForm(false)} />;
  }

  // Dashboard Main View
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 md:px-12 h-20 border-b border-gray-100">
        <div className="shrink-0 flex items-center">
          <img src={LongLogo} alt="Airbnb" className="h-8 w-auto cursor-pointer" onClick={() => navigate("/")} />
        </div>

        {/* Center Nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Today", "Calendar", "Listings", "Messages"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-7 pt-7 font-medium text-[15px] transition-colors relative ${activeTab === tab ? "text-black" : "text-gray-500 hover:text-gray-900"
                }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"></span>
              )}
            </button>
          ))}
        </div>

        {/* Right Nav */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="hidden md:block px-4 py-2 text-sm font-semibold hover:bg-gray-50 rounded-full transition-colors"
          >
            Switch to travelling
          </button>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
              V
            </div>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-10 flex flex-col items-center">

        {activeTab === "Today" ? (
          <>
            {/* Pill Toggles */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full mb-20 mt-4">
              <button className="px-6 py-2 bg-gray-800 text-white rounded-full text-sm font-medium shadow-sm transition-all">
                Today
              </button>
              <button className="px-6 py-2 text-gray-700 rounded-full text-sm font-medium hover:bg-white hover:shadow-sm transition-all">
                Upcoming
              </button>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center max-w-sm text-center">
              <div className="mb-6 relative">
                <div className="w-32 h-32 opacity-90 pl-3">
                  <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(10, 10) rotate(-15)">
                      <rect x="10" y="10" width="80" height="90" rx="4" fill="#fcfcfc" stroke="#dcdcdc" strokeWidth="2.5" />
                      <path d="M50 10 L50 100" stroke="#dcdcdc" strokeWidth="2.5" />
                      <path d="M 45 6 L 45 35 L 35 25 L 25 35 L 25 6 Z" fill="#E01561" />
                    </g>
                  </svg>
                </div>
              </div>
              <h2 className="text-[28px] font-semibold text-[#222222] mb-8">
                You don't have any reservations
              </h2>

              <button
                onClick={() => setShowListingForm(true)}
                className="px-8 py-3 bg-[#E01561] hover:bg-[#D70466] text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Get started
              </button>
            </div>
          </>
        ) : activeTab === "Listings" ? (
          <div className="w-full flex flex-col items-start mt-10">
            <div className="flex justify-between items-center w-full mb-8">
              <h2 className="text-[32px] font-semibold text-gray-900">Your Listings</h2>
              <button
                onClick={() => setShowListingForm(true)}
                className="px-6 py-2.5 flex items-center gap-2 bg-[#222222] hover:bg-black text-white font-medium rounded-[10px] transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5"/> Create new
              </button>
            </div>
            
            {loadingListings ? (
               <div className="w-full py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
            ) : properties.length === 0 ? (
              <div className="w-full bg-gray-50 py-20 rounded-2xl flex flex-col items-center text-center mt-10 border border-gray-100">
                  <p className="text-gray-500 mb-6 text-lg">You haven't created any listings yet.</p>
                  <button
                    onClick={() => setShowListingForm(true)}
                    className="px-8 py-3 bg-[#E01561] hover:bg-[#D70466] text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    Create a new listing
                  </button>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {properties.map(prop => (
                   <div key={prop._id} className="bg-white border hover:shadow-lg transition-shadow rounded-2xl overflow-hidden group">
                     <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                       <img src={prop.image || (prop.images && prop.images[0])} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute top-4 right-4 flex gap-2">
                          <button onClick={() => alert("Edit modal functionality coming soon!")} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow">
                            <Edit2 className="w-4 h-4 text-gray-700"/>
                          </button>
                          <button onClick={() => handleDelete(prop._id || prop.id)} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow">
                            <Trash2 className="w-4 h-4 text-red-600"/>
                          </button>
                       </div>
                     </div>
                     <div className="p-4">
                       <h3 className="font-semibold text-[17px] truncate">{prop.title}</h3>
                       <p className="text-gray-500 text-[15px] truncate">{prop.location}</p>
                       <div className="mt-2 text-[15px] font-semibold">₹{(prop.priceRaw || prop.pricePerNight).toLocaleString('en-IN')} <span className="font-normal text-gray-500">night</span></div>
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center mt-20 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">{activeTab}</h2>
            <p className="text-gray-500">This center is currently under development.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Plus Icon since it was omitted from HostDashboard imports originally
const Plus = ({...props}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export default HostDashboard;
