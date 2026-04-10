import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, MapPin, IndianRupee, ImagePlus, Loader2, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import LongLogo from "../../assets/logo/long-logo.png";
import ListingCreationWizard from "./ListingCreationWizard.jsx";
import UserMenu from "../../components/Header/UserMenu/UserMenu.jsx";

const HostDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, getToken } = useAuth();
  const [showListingForm, setShowListingForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Today");

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
                  {/* Custom Book SVG */}
                  <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(10, 10) rotate(-15)">
                      <rect x="10" y="10" width="80" height="90" rx="4" fill="#fcfcfc" stroke="#dcdcdc" strokeWidth="2.5" />
                      <path d="M50 10 L50 100" stroke="#dcdcdc" strokeWidth="2.5" />

                      {/* Red Ribbon Bookmark */}
                      <path d="M 45 6 L 45 35 L 35 25 L 25 35 L 25 6 Z" fill="#E01561" />

                      {/* Pseudo text lines */}
                      <line x1="18" y1="22" x2="33" y2="22" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
                      <line x1="18" y1="32" x2="33" y2="32" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
                      <line x1="18" y1="42" x2="42" y2="42" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
                      <line x1="18" y1="52" x2="42" y2="52" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
                      <line x1="18" y1="62" x2="42" y2="62" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
                      <line x1="18" y1="72" x2="42" y2="72" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />

                      <line x1="58" y1="22" x2="82" y2="22" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
                      <line x1="58" y1="32" x2="82" y2="32" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
                      <line x1="58" y1="42" x2="82" y2="42" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
                      <line x1="58" y1="52" x2="82" y2="52" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
                      <line x1="58" y1="62" x2="82" y2="62" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
                      <line x1="58" y1="72" x2="72" y2="72" stroke="#dcdcdc" strokeWidth="2" strokeLinecap="round" />
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
        ) : (
          <div className="flex flex-col items-center mt-20 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">
              {activeTab}
            </h2>
            {activeTab === "Listings" ? (
              <div className="max-w-md w-full">
                <p className="text-gray-500 mb-6">Manage your property listings here. If you haven't created one, get started now.</p>
                <button
                  onClick={() => setShowListingForm(true)}
                  className="px-8 py-3 bg-[#E01561] hover:bg-[#D70466] text-white font-medium rounded-lg transition-colors w-full shadow-sm"
                >
                  Create a new listing
                </button>
              </div>
            ) : (
              <p className="text-gray-500">This center is currently under development.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
