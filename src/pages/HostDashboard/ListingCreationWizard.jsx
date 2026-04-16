import React, { useState } from "react";
import { 
  Home, Building, Ship, Trees, Castle, Tent, Caravan, Box, Menu, 
  MapPin, Check, Plus, Minus, UploadCloud, Search, ShieldCheck, DollarSign, Camera, 
  ChevronLeft, Loader2, Users, Star, Info, Zap, AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Listing Form Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-10 text-center">
          <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">React App Crashed</h1>
          <p className="text-gray-500 max-w-lg mx-auto bg-gray-100 p-4 rounded-xl font-mono text-sm text-left whitespace-pre-wrap">
            {this.state.error?.toString()}
          </p>
          <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-black text-white rounded-lg">
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ListingCreationWizardWrapper({ onClose }) {
  return (
    <ErrorBoundary>
      <ListingCreationWizard onClose={onClose} />
    </ErrorBoundary>
  );
}

function ListingCreationWizard({ onClose, draftData }) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const STEPS = [
    "Intro",
    "PropertyType",
    "ListingType",
    "Location",
    "OtherPeople",
    "FloorPlan",       
    "Amenities",
    "Photos",
    "Highlights",
    "TextDetails",     
    "BookingSettings",    
    "WeekdayPrice",
    "WeekendPrice",
    "SafetyDetails"
  ];

  const [currentStep, setCurrentStep] = useState(draftData?.currentStep || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuperhostModal, setShowSuperhostModal] = useState(!draftData);
  
  const [showAddressModal1, setShowAddressModal1] = useState(false);
  const [showAddressModal2, setShowAddressModal2] = useState(false);

  // Search autocomplete state
  const [locationSearch, setLocationSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [formData, setFormData] = useState(draftData?.formData || {
    propertyType: "",
    listingType: "",
    location: "",
    addressDetails: { country: "India", flat: "", street: "", landmark: "", district: "", city: "", state: "", pin: "" },
    otherPeople: "",
    highlights: [],
    guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: [],
    safetyFeatures: [],
    images: [],
    imagePreviews: [],
    title: "",
    description: "",
    minNights: 1,
    maxNights: 365,
    bookingSettings: "approve",
    houseRules: [],
    weekdayPrice: "1889",
    weekendPremium: 10,
    cancellationPolicy: "Flexible",
    safetyDetails: { cameras: false, noise: false, weapons: false },
  });

  const handleNext = () => {
    if (STEPS[currentStep] === "Location" && !showAddressModal1 && !showAddressModal2) {
      if (!locationSearch) { alert("Please select an address or search specifically."); return; }
      setShowAddressModal1(true);
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSaveAndExit = () => {
    // Save a text-only snapshot (skip File objects — not serialisable)
    const snapshot = {
      currentStep,
      formData: { ...formData, images: [], imagePreviews: formData.imagePreviews },
      savedAt: new Date().toISOString(),
    };
    // Use a keyed draft so multiple drafts can exist
    const draftId = draftData?.draftId || `draft_${Date.now()}`;
    snapshot.draftId = draftId;
    // Save individual draft
    localStorage.setItem(`listing_draft_${draftId}`, JSON.stringify(snapshot));
    // Maintain a drafts index
    const idx = JSON.parse(localStorage.getItem('listing_drafts_index') || '[]');
    if (!idx.includes(draftId)) idx.push(draftId);
    localStorage.setItem('listing_drafts_index', JSON.stringify(idx));
    onClose();
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  React.useEffect(() => {
    if (locationSearch.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationSearch)}&format=json&addressdetails=1&limit=5`);
        const data = await res.json();
        const formatted = data.map(item => {
          // Identify a clean prominent title
          const title = item.address?.city || item.address?.town || item.address?.village || item.address?.suburb || item.name || "Location";
          return {
             title: title,
             sub: item.display_name,
             raw: item,
          };
        });
        setSearchResults(formatted);
      } catch (err) {
        console.error("Location search failed:", err);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 600); // 600ms Debounce
    return () => clearTimeout(timeoutId);
  }, [locationSearch]);

  const updateForm = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleArray = (field, value) => {
    setFormData((prev) => {
      const list = prev[field];
      if (list.includes(value)) return { ...prev, [field]: list.filter((i) => i !== value) };
      return { ...prev, [field]: [...list, value] };
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
      
      const newPreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setFormData(prev => ({ ...prev, imagePreviews: [...prev.imagePreviews, ...newPreviews] }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async () => {
    if (formData.imagePreviews.length === 0) {
      alert("Please upload at least one image first!");
      setCurrentStep(STEPS.indexOf("Photos")); // Go to photos
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const data = new FormData();
      data.append("name", formData.title || `${formData.listingType} in ${formData.location.split(',')[0] || locationSearch}`);
      data.append("title", formData.title || `${formData.listingType} in ${formData.location.split(',')[0] || locationSearch}`);
      data.append("location", formData.location || locationSearch);
      data.append("price", formData.weekdayPrice || "5000");
      data.append("priceRaw", formData.weekdayPrice || "5000");
      data.append("pricePerNight", formData.weekdayPrice || "5000");
      data.append("guests", formData.guests || "1");
      data.append("bedrooms", formData.bedrooms || "1");
      data.append("beds", formData.beds || "1");
      data.append("baths", formData.bathrooms || "1");
      data.append("description", formData.description || "A wonderful place to stay.");
      data.append("amenities", JSON.stringify(formData.amenities || []));
      data.append("rating", "5.0");
      data.append("hostName", "Host"); 
      formData.images.forEach(img => {
        data.append("images", img);
      });

      const response = await fetch("http://localhost:5001/api/hotels", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: data, 
      });

      if (!response.ok) throw new Error("Failed to create listing.");
      alert("Property published beautifully!");
      navigate("/"); 
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- UI COMPONENTS --------------------

  const AirbnbLogo = () => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#FF385C]" style={{display:'block', fill:'currentColor'}}>
      <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.218-3.044 7.806-7.502 7.806-3.875 0-6.195-2.022-7.534-4.82l-.464-.999-.464.999c-1.34 2.798-3.66 4.82-7.535 4.82-4.458 0-7.502-3.588-7.502-7.806 0-.825.176-1.745.719-3.238l.182-.468c.983-2.296 5.14-11.006 7.094-14.836l.534-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.005c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.836c-.427 1.071-.573 1.655-.605 2.24l-.009.217c0 2.924 1.956 5.8 5.5 5.8 2.645 0 4.343-1.428 5.485-3.816l.205-.445.696-1.572.696 1.572.205.445c1.142 2.388 2.84 3.816 5.485 3.816 3.544 0 5.5-2.876 5.5-5.8 0-.584-.131-1.16-.54-2.19l-.337-.81-7.037-14.733-.518-.996C18.053 3.539 17.24 3 16 3zm0 9c3.088 0 5.417 2.404 5.417 4.975 0 2.257-1.39 3.65-4.57 6.425l-.847.74-.847-.74c-3.18-2.775-4.57-4.168-4.57-6.425C10.583 14.404 12.912 12 16 12zm0 2c-1.859 0-3.333 1.39-3.333 2.975 0 1.258.825 2.241 3.208 4.364l.125.11.125-.11c2.383-2.123 3.208-3.106 3.208-4.364C19.333 15.39 17.859 14 16 14z" />
    </svg>
  );

  const renderStep = () => {
    if (showSuperhostModal) return (
      <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 fade-in duration-300">
        <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col slide-in-from-bottom-4 duration-500">
          <div className="h-48 bg-black relative flex flex-wrap items-center justify-center overflow-hidden">
             {/* Mocking the user collage */}
             <div className="absolute w-24 h-24 rounded-full bg-blue-100 border-4 border-black left-1/2 bottom-[-10px] transform -translate-x-1/2 flex items-center justify-center overflow-hidden z-10">
                <img src="https://i.pravatar.cc/150?img=47" className="w-full h-full object-cover" />
             </div>
             <div className="absolute w-16 h-16 rounded-full bg-red-100 border-2 border-black left-[20%] top-[40%] flex items-center justify-center overflow-hidden">
                <img src="https://i.pravatar.cc/150?img=11" className="w-full h-full object-cover" />
             </div>
             <div className="absolute w-14 h-14 rounded-full bg-green-100 border-2 border-black right-[15%] top-[20%] flex items-center justify-center overflow-hidden">
                <img src="https://i.pravatar.cc/150?img=32" className="w-full h-full object-cover" />
             </div>
          </div>
          <div className="p-8 pb-10">
            <h2 className="text-[28px] leading-tight font-semibold text-gray-900 mb-4">
              Get one-to-one guidance from a Superhost
            </h2>
            <p className="text-[#717171] text-base leading-relaxed mb-10">
              We'll match you with an experienced Host. They'll guide you over chat or video as you put your place on Airbnb. You can also start on your own and get matched later.
            </p>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => { setShowSuperhostModal(false); handleNext(); }}
                className="text-[#222222] font-semibold underline text-lg py-2 hover:bg-gray-50 rounded-lg px-2 -ml-2 transition-colors"
              >
                Start on your own
              </button>
              <button 
                onClick={() => { setShowSuperhostModal(false); handleNext(); }}
                className="bg-[#222222] hover:bg-black text-white px-6 py-3.5 rounded-lg font-semibold text-base transition-colors"
              >
                Match with a Superhost
              </button>
            </div>
          </div>
        </div>
      </div>
    );
    
    if (showAddressModal1) return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col h-[80vh] max-h-[700px] overflow-hidden slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
            <h2 className="text-xl font-bold">Confirm your address</h2>
            <button onClick={() => setShowAddressModal1(false)} className="hover:bg-gray-100 p-2 rounded-full">✕</button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            <div className="border border-gray-400 rounded-lg overflow-hidden">
              <div className="p-3 border-b text-sm text-gray-500 font-semibold bg-gray-50">Country/region</div>
              <select className="w-full p-3 font-medium outline-none bg-transparent">
                <option>India</option>
              </select>
            </div>
            <input placeholder="Flat/house (optional)" className="w-full p-4 border border-gray-400 rounded-lg outline-none focus:border-black font-medium" />
            <input placeholder="Street address" value={formData.addressDetails.street} onChange={e => setFormData(p => ({...p, addressDetails: {...p.addressDetails, street: e.target.value}}))} className="w-full p-4 border border-gray-400 rounded-lg outline-none focus:border-black font-medium" />
            <input placeholder="Nearby landmark (optional)" className="w-full p-4 border border-gray-400 rounded-lg outline-none focus:border-black font-medium" />
            <input placeholder="District/locality (optional)" className="w-full p-4 border border-gray-400 rounded-lg outline-none focus:border-black font-medium" />
            <div className="flex gap-4">
              <input placeholder="City/town" value={formData.addressDetails.city} onChange={e => setFormData(p => ({...p, addressDetails: {...p.addressDetails, city: e.target.value}}))} className="w-full p-4 border border-gray-400 rounded-lg outline-none focus:border-black font-medium text-gray-600 bg-gray-50" />
              <input placeholder="State/union territory" value={formData.addressDetails.state} onChange={e => setFormData(p => ({...p, addressDetails: {...p.addressDetails, state: e.target.value}}))} className="w-full p-4 border border-gray-400 rounded-lg outline-none focus:border-black font-medium text-gray-600 bg-gray-50" />
            </div>
            <input placeholder="PIN code" className="w-full p-4 border border-gray-400 rounded-lg outline-none focus:border-black font-medium" />
          </div>
          <div className="p-5 border-t bg-white">
            <button onClick={() => { setShowAddressModal1(false); setShowAddressModal2(true); }} className="w-full bg-[#222222] text-white py-3.5 rounded-lg font-semibold text-lg hover:bg-black transition">
              Next
            </button>
          </div>
        </div>
      </div>
    );

    if (showAddressModal2) return (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col h-[80vh] max-h-[700px] overflow-hidden slide-in-from-bottom-4 duration-300">
          <div className="relative h-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {/* Mock Map Background via iframe trick or image */}
            <img src="https://static.dezeen.com/uploads/2014/11/Dezeen_Mapbox_0.jpg" alt="map" className="w-full h-full object-cover scale-110 blur-[1px] opacity-80 mix-blend-multiply" />
            
            <div className="absolute top-4 left-4">
              <button onClick={() => { setShowAddressModal2(false); setShowAddressModal1(true); }} className="bg-white p-2 text-xl rounded-full shadow-md hover:bg-gray-50"><ChevronLeft className="w-6 h-6 text-black"/></button>
            </div>

            <div className="absolute text-center flex flex-col items-center">
              <div className="bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl mb-4 animate-bounce">
                Drag the map to reposition the pin
              </div>
              <div className="bg-[#FF385C] w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-2xl text-white transform -translate-y-4">
                <Home className="w-8 h-8" />
              </div>
            </div>
            <div className="absolute right-4 top-4 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
              <button className="p-3 border-b hover:bg-gray-50"><Plus className="w-5 h-5 text-black"/></button>
              <button className="p-3 hover:bg-gray-50"><Minus className="w-5 h-5 text-black"/></button>
            </div>
          </div>
          <div className="p-4 bg-white z-10 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="text-[17px] font-semibold text-gray-900">Is the pin in the right spot?</div>
            <button 
              onClick={() => { 
                setShowAddressModal2(false); 
                setCurrentStep(prev => prev + 1); // jump to next step
              }} 
              className="bg-[#222222] text-white px-8 py-3 rounded-xl font-semibold text-base hover:bg-black transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );

    const CounterRow = ({ label, field }) => (
      <div className="flex items-center justify-between py-6 border-b border-gray-200">
        <div className="text-[17px] text-[#222222] font-medium">{label}</div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => updateForm(field, Math.max(1, formData[field] - 1))}
            className={`w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-black ${formData[field] <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <span className="w-4 text-center font-medium bg-transparent text-[#222222]">
            {formData[field]}
          </span>
          <button 
            onClick={() => updateForm(field, formData[field] + 1)}
            className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-black"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    );

    switch (STEPS[currentStep]) {
      case "PropertyType": {
        const propertyTypes = [
          { id: "House", icon: Home },
          { id: "Flat/apartment", icon: Building },
          { id: "Barn", icon: Tent },
          { id: "Bed & breakfast", icon: Home },
          { id: "Boat", icon: Ship },
          { id: "Cabin", icon: Trees },
          { id: "Campervan/motorhome", icon: Caravan },
          { id: "Casa particular", icon: Home },
          { id: "Castle", icon: Castle },
          { id: "Cave", icon: Tent },
          { id: "Container", icon: Box },
          { id: "Cycladic home", icon: Home },
        ];
        return (
          <div className="max-w-3xl w-full mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-10 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold text-center mb-10">Which of these best describes your place?</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr">
              {propertyTypes.map((t) => {
                const isSelected = formData.propertyType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => updateForm("propertyType", t.id)}
                    className={`flex flex-col text-left justify-between p-4 h-28 rounded-xl transition-all outline-none border ${
                      isSelected ? 'border-[2px] border-black bg-[#F7F7F7]' : 'border-[#DDDDDD] hover:border-black bg-white'
                    }`}
                  >
                    <div className={`${isSelected ? 'text-black' : 'text-[#717171]'}`}>
                      <t.icon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div className="font-medium text-[#222222]">{t.id}</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }
      
      case "ListingType": {
        const listingTypes = [
          { id: "An entire place", desc: "Guests have the whole place to themselves.", i: Home },
          { id: "A room", desc: "Guests have他们的 own room in a home, plus access to shared spaces.", i: Building },
          { id: "A shared room in a hostel", desc: "Guests sleep in a shared room in a professionally managed hostel with staff on-site 24/7.", i: Tent }
        ];
        return (
          <div className="max-w-[650px] w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold text-center mb-10">What type of place will guests have?</h1>
            <div className="space-y-4">
              {listingTypes.map(t => {
                const isSelected = formData.listingType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => updateForm("listingType", t.id)}
                    className={`flex items-center justify-between w-full p-6 text-left rounded-xl transition-all outline-none border ${
                      isSelected ? 'border-[2px] border-black bg-[#F7F7F7]' : 'border-[#DDDDDD] hover:border-black bg-white'
                    }`}
                  >
                    <div className="pr-4">
                      <div className="text-[17px] font-semibold text-[#222222] mb-1">{t.id}</div>
                      <div className="text-[#717171] text-[15px]">{t.desc}</div>
                    </div>
                    <t.i className="w-8 h-8 text-[#222222] shrink-0" strokeWidth={1.5} />
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case "Location": {
        return (
          <div className="max-w-[650px] w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold text-center mb-4">Where's your place located?</h1>
            <p className="text-[#717171] text-lg text-center mb-10">
              We only share your address after guests book. Until then, they'll see an approximate location.
            </p>
    
            <div className="relative">
               <div className={`flex items-center w-full bg-white border ${locationSearch ? 'border-gray-400 border-b-gray-200 rounded-t-3xl shadow-lg' : 'border-[#DDDDDD] rounded-full hover:shadow-md'} transition-all px-5 py-4`}>
                 <Search className="w-5 h-5 text-[#222222] mr-4" />
                 <input 
                   autoFocus
                   type="text" 
                   placeholder="Enter your address"
                   value={locationSearch}
                   onChange={(e) => {
                     setLocationSearch(e.target.value);
                   }}
                   className="flex-1 bg-transparent border-none outline-none text-[#222222] text-lg font-medium"
                 />
               </div>
               
               {/* Dropdown Results list */}
               {(locationSearch || isSearchingLocation) && formData.location !== locationSearch && (
                 <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-400 rounded-b-3xl shadow-xl overflow-hidden z-10 p-2 pb-6 max-h-[300px] overflow-y-auto">
                   
                   {isSearchingLocation ? (
                      <div className="py-6 text-center text-gray-500">Searching...</div>
                   ) : searchResults.length > 0 ? (
                      searchResults.map((res, i) => (
                       <div 
                          key={i} 
                          onClick={() => {
                            updateForm("location", res.sub);
                            setLocationSearch(res.sub); // Sync the input box with full address
                            
                            // Pre-fill next address fields
                            const parts = res.sub.split(", ");
                            const stateParse = parts.length > 2 ? parts[parts.length - 2] : "";
                            const cityParse = res.title;
                            
                            setFormData(prev => ({
                                ...prev,
                                addressDetails: {
                                    ...prev.addressDetails,
                                    city: cityParse,
                                    state: stateParse,
                                    street: parts[0] !== res.title ? parts[0] : ""
                                }
                            }));
                            
                            // Immediately pop it up
                            setShowAddressModal1(true);
                          }}
                          className="flex items-center gap-4 px-4 py-4 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
                        >
                         <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                           <MapPin className="w-6 h-6 text-[#222222]" />
                         </div>
                         <div>
                           <div className="text-[17px] font-semibold text-[#222222]">{res.title}</div>
                           <div className="text-[#717171] text-[15px]">{res.sub}</div>
                         </div>
                       </div>
                     ))
                   ) : locationSearch.length >= 3 ? (
                      <div className="py-6 text-center text-gray-500">No results found for "{locationSearch}"</div>
                   ) : (
                      <div className="py-6 text-center text-gray-500">Type at least 3 characters...</div>
                   )}
                 </div>
               )}
            </div>
          </div>
        );
      }
      
      case "OtherPeople": {
        const ops = [
          {id: "Me", desc: "You'll be present", i: Home},
          {id: "My family", desc: "Your family will be present", i: Home},
          {id: "Other guests", desc: "Other guests might be there", i: Users},
          {id: "Flatmates/housemates", desc: "Your roommates", i: Users}
        ];
        return (
          <div className="max-w-[650px] w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold text-center mb-2">Who else might be there?</h1>
            <p className="text-[#717171] mb-10 text-lg text-center">Guests need to know whether they'll encounter other people during their stay.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ops.map(t => (
                <button
                  key={t.id}
                  onClick={() => updateForm("otherPeople", t.id)}
                  className={`flex flex-col text-left justify-between p-6 h-36 rounded-xl transition-all outline-none border ${
                    formData.otherPeople === t.id ? 'border-[2px] border-black bg-[#F7F7F7]' : 'border-[#DDDDDD] hover:border-black bg-white'
                  }`}
                >
                  <t.i className="w-8 h-8 text-[#222222]" strokeWidth={1.5} />
                  <div className="font-semibold text-[#222222] text-lg">{t.id}</div>
                </button>
              ))}
            </div>
            <div className="mt-8 text-gray-500 text-sm text-center font-medium">We'll show this information on your listing and in search results.</div>
          </div>
        )
      }
      
      // Step: Guests & Layout
      case "FloorPlan":
        return (
          <div className="max-w-2xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold text-center mb-8">Share some basics about your place</h1>
            <div className="text-left mt-8">
              <CounterRow label="Guests" field="guests" />
              <CounterRow label="Bedrooms" field="bedrooms" />
              <CounterRow label="Beds" field="beds" />
              <CounterRow label="Bathrooms" field="bathrooms" />
            </div>
          </div>
        );

      case "Amenities": {
        const ams = ["Wifi", "TV", "Kitchen", "Washer", "Free parking", "Paid parking", "Air conditioning", "Workspace"];
        return (
          <div className="max-w-3xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold text-center mb-8">Tell guests what your place has to offer</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {ams.map(am => (
                 <button key={am} onClick={() => toggleArray("amenities", am)} 
                    className={`p-6 border rounded-xl text-left font-semibold text-[17px] transition-all ${formData.amenities.includes(am) ? 'border-[2px] border-black bg-gray-50' : 'border-[#DDDDDD] hover:border-black'}`}>
                   {am}
                 </button>
               ))}
            </div>
          </div>
        );
      }
        
      case "Photos":
        return (
          <div className="max-w-3xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold text-center mb-4">Add some photos of your place</h1>
            <p className="text-[#717171] text-lg text-center mb-10">You'll need 5 photos to get started. You can add more or make changes later.</p>
            <div className="bg-white border border-dashed border-gray-400 rounded-3xl min-h-[350px] p-8 flex flex-col items-center justify-center relative bg-gray-50/50 hover:bg-gray-50 transition-colors">
               {formData.imagePreviews && formData.imagePreviews.length > 0 ? (
                 <div className="w-full">
                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                       {formData.imagePreviews.map((src, i) => (
                         <div key={i} className="relative aspect-square">
                           <img src={src} className="w-full h-full object-cover rounded-xl shadow-sm" />
                           <button onClick={(e) => {
                                e.stopPropagation();
                                const newImages = [...formData.images];
                                const newPreviews = [...formData.imagePreviews];
                                newImages.splice(i, 1);
                                newPreviews.splice(i, 1);
                                updateForm("images", newImages);
                                updateForm("imagePreviews", newPreviews);
                             }} 
                             className="absolute top-2 right-2 bg-white p-1.5 rounded-full font-semibold text-sm shadow hover:scale-105 transition-transform">
                              <Minus className="w-4 h-4 text-black"/>
                           </button>
                         </div>
                       ))}
                       <label className="flex flex-col items-center cursor-pointer aspect-square bg-white border border-dashed border-gray-400 rounded-xl justify-center hover:bg-gray-50 transition-colors">
                          <Plus className="w-8 h-8 text-gray-500 mb-2" />
                          <span className="text-sm text-gray-500 font-medium">Add more</span>
                          <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                       </label>
                   </div>
                 </div>
               ) : (
                 <label className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
                    <Camera className="w-16 h-16 text-gray-800 mb-6" strokeWidth={1} />
                    <h3 className="text-[22px] font-semibold mb-2">Drag your photos here</h3>
                    <p className="text-[#717171] mb-8">Choose at least 5 photos</p>
                    <div className="text-[#222222] font-semibold underline text-lg">Upload from your device</div>
                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                 </label>
               )}
            </div>
          </div>
        );

      case "Highlights": {
        const highlights = ["Peaceful", "Unique", "Family-friendly", "Stylish", "Central", "Spacious"];
        return (
          <div className="max-w-3xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold text-center mb-2">Next, let's describe your house</h1>
            <p className="text-[#717171] mb-10 text-lg text-center">Choose up to 2 highlights. We'll use these to get your description started.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {highlights.map(h => {
                const isSelected = formData.highlights.includes(h);
                return (
                  <button
                    key={h}
                    onClick={() => {
                       if (isSelected) {
                         setFormData(prev => ({...prev, highlights: prev.highlights.filter(x => x !== h)}));
                       } else if (formData.highlights.length < 2) {
                         setFormData(prev => ({...prev, highlights: [...prev.highlights, h]}));
                       }
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all text-[17px] font-medium ${
                       isSelected ? 'border-black border-[2px] bg-gray-50' : 'border-gray-300 hover:border-black bg-white'
                    }`}
                  >
                    <Star className="w-5 h-5 opacity-70" /> {h}
                  </button>
                )
              })}
            </div>
          </div>
        )
      }

      case "TextDetails":
         return (
           <div className="max-w-2xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
             <h1 className="text-4xl text-[#222222] font-semibold text-center mb-10">Now, let's give your place a title</h1>
             <p className="text-[#717171] mb-4 text-lg">Short titles work best. Have fun with it—you can always change it later.</p>
             <textarea 
               value={formData.title} 
               onChange={e => updateForm("title", e.target.value)}
               maxLength={32}
               rows={3}
               placeholder="Amazing apartment in the heart of the city"
               className="w-full border border-gray-400 rounded-2xl p-6 text-2xl font-semibold outline-none focus:border-black resize-none"
             />
             <div className="text-gray-500 font-semibold text-sm mt-2 mb-8">{formData.title.length}/32</div>
             
             <h2 className="text-2xl text-[#222222] font-semibold mb-4 text-center">Create your description</h2>
             <textarea 
               value={formData.description} 
               onChange={e => updateForm("description", e.target.value)}
               maxLength={500}
               rows={5}
               placeholder="Tell guests what makes your place special..."
               className="w-full border border-gray-400 rounded-2xl p-6 text-xl font-medium outline-none focus:border-black resize-none"
             />
           </div>
         );

      case "BookingSettings": {
        return (
          <div className="max-w-[650px] w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold text-center mb-2">Pick your booking settings</h1>
            <p className="text-[#717171] mb-10 text-lg text-center">You can change this at any time. <span className="underline font-semibold text-black cursor-pointer">Learn more.</span></p>
            <div className="space-y-4">
               <button
                  onClick={() => updateForm("bookingSettings", "approve")}
                  className={`flex justify-between items-center w-full p-6 text-left rounded-xl border transition-all ${formData.bookingSettings === 'approve' ? 'border-[2px] border-black bg-[#F7F7F7]' : 'border-gray-300 hover:border-black bg-white'}`}
               >
                 <div>
                   <div className="font-semibold text-[17px] text-[#222222] mb-1">Approve your first 3 bookings <span className="text-sm font-bold text-green-800 bg-green-100 px-2 py-0.5 rounded-md ml-2 relative -top-0.5">Recommended</span></div>
                   <div className="text-[#717171]">Welcome your first guests before your listing becomes available for instant bookings.</div>
                 </div>
                 <ShieldCheck className="w-8 h-8 ml-4 shrink-0 text-[#222222]" strokeWidth={1.5}/>
               </button>
               <button
                  onClick={() => updateForm("bookingSettings", "instant")}
                  className={`flex justify-between items-center w-full p-6 text-left rounded-xl border transition-all ${formData.bookingSettings === 'instant' ? 'border-[2px] border-black bg-[#F7F7F7]' : 'border-gray-300 hover:border-black bg-white'}`}
               >
                 <div>
                   <div className="font-semibold text-[17px] text-[#222222] mb-1">Use Instant Book</div>
                   <div className="text-[#717171]">Let guests book automatically.</div>
                 </div>
                 <Zap className="w-8 h-8 ml-4 shrink-0 text-[#222222]" strokeWidth={1.5}/>
               </button>
            </div>
          </div>
        )
      }

      case "WeekdayPrice": {
         return (
           <div className="max-w-2xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10 text-center">
             <h1 className="text-4xl text-[#222222] font-semibold mb-2">Now, set a weekday base price</h1>
             <p className="text-[#717171] mb-10 text-lg">Tip: ₹1,889. You'll set a weekend price next.</p>
             
             <div className="flex flex-col justify-center items-center">
                 <div className="flex items-center text-[80px] font-bold tracking-tighter text-[#222222] mb-8">
                    <span className="text-gray-400 mr-2 opacity-70">₹</span>
                    <input 
                      type="number" 
                      value={formData.weekdayPrice} 
                      onChange={e => updateForm("weekdayPrice", e.target.value)} 
                      className="bg-transparent outline-none w-[280px] text-center" 
                      placeholder="0"
                    />
                 </div>
                 
                 <div className="border border-gray-300 rounded-full px-6 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2 mb-10 text-gray-500">
                   <span className="font-medium">Guest price before taxes ₹{Math.round(Number(formData.weekdayPrice || 0) * 1.15).toLocaleString('en-IN')}</span>
                 </div>

                 <button className="px-6 py-3 border border-gray-900 rounded-full font-semibold hover:bg-gray-50 transition">
                   Show similar listings
                 </button>
                 <div className="mt-8 text-[15px] font-semibold underline text-[#222222] cursor-pointer">
                   Learn more about pricing
                 </div>
             </div>
           </div>
         )
      }

      case "WeekendPrice": {
         const base = Number(formData.weekdayPrice || 0);
         const prem = Number(formData.weekendPremium || 0);
         const total = Math.round(base * (1 + (prem / 100)));
         return (
           <div className="max-w-2xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10 text-center">
             <h1 className="text-4xl text-[#222222] font-semibold mb-2">Set a weekend price</h1>
             <p className="text-[#717171] mb-10 text-lg">Add a premium for Fridays and Saturdays.</p>
             
             <div className="flex flex-col justify-center items-center">
                 <div className="flex items-center text-[80px] font-bold tracking-tighter text-[#222222] mb-8">
                    <span className="text-gray-400 mr-2 opacity-70">₹</span>
                    <span>{total.toLocaleString('en-IN')}</span>
                 </div>
                 
                 <div className="border border-gray-300 rounded-full px-6 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2 mb-10 text-gray-500">
                   <span className="font-medium">Guest price before taxes ₹{Math.round(total * 1.15).toLocaleString('en-IN')}</span>
                 </div>

                 <div className="w-full max-w-md bg-[#F7F7F7] rounded-2xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                       <span className="font-medium text-[17px] text-left">Weekend premium</span>
                       <div className="flex items-center border border-gray-400 rounded-lg p-2 bg-white">
                         <input 
                           type="number"
                           value={formData.weekendPremium}
                           onChange={e => updateForm("weekendPremium", e.target.value)}
                           className="w-12 outline-none text-center font-medium"
                         />
                         <span className="text-gray-500 font-medium">%</span>
                       </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" max="99" 
                      value={formData.weekendPremium}
                      onChange={e => updateForm("weekendPremium", e.target.value)}
                      className="w-full accent-black cursor-pointer" 
                    />
                 </div>
             </div>
           </div>
         )
      }

      case "SafetyDetails": {
        return (
          <div className="max-w-[700px] w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold mt-2 mb-10">Share safety details</h1>
            <div className="mb-4">
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-[22px] font-semibold text-[#222222]">Does your place have any of these?</h2>
                 <Info className="w-6 h-6 text-[#222222]" strokeWidth={1.5} />
               </div>
               
               <div className="space-y-8">
                 <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[17px] font-medium text-[#222222]">Exterior security camera present</span>
                    <input type="checkbox" checked={formData.safetyDetails.cameras} onChange={(e) => setFormData(p => ({...p, safetyDetails: {...p.safetyDetails, cameras: e.target.checked}}))} className="w-6 h-6 accent-black rounded shadow-sm"/>
                 </label>
                 <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[17px] font-medium text-[#222222]">Noise decibel monitor present</span>
                    <input type="checkbox" checked={formData.safetyDetails.noise} onChange={(e) => setFormData(p => ({...p, safetyDetails: {...p.safetyDetails, noise: e.target.checked}}))} className="w-6 h-6 accent-black rounded shadow-sm"/>
                 </label>
                 <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-[17px] font-medium text-[#222222]">Weapon(s) on the property</span>
                    <input type="checkbox" checked={formData.safetyDetails.weapons} onChange={(e) => setFormData(p => ({...p, safetyDetails: {...p.safetyDetails, weapons: e.target.checked}}))} className="w-6 h-6 accent-black rounded shadow-sm"/>
                 </label>
               </div>
            </div>

            <hr className="my-10 border-gray-200" />

            <div>
               <h2 className="text-[22px] font-semibold text-[#222222] mb-6">Important things to know</h2>
               <div className="text-gray-500 space-y-5 text-[15px] leading-relaxed font-medium">
                 <p>Security cameras that monitor indoor spaces are not allowed even if they're turned off. All exterior security cameras must be disclosed.</p>
                 <p>Be sure to comply with your <span className="underline text-black font-semibold cursor-pointer">local laws</span> and review Airbnb's <span className="underline text-black font-semibold cursor-pointer">anti-discrimination policy</span> and <span className="underline text-black font-semibold cursor-pointer">guest and host fees</span>.</p>
               </div>
            </div>
          </div>
        )
      }

      default: return null;
    }
  };

  const totalSteps = STEPS.length - 1; 
  const currentProgress = currentStep === 0 ? 0 : currentStep;
  const progressPercentage = (currentProgress / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      
      {/* Header aligned with Airbnb */}
      <header className="flex-none px-6 md:px-12 h-[88px] flex items-center justify-between text-[#222222] bg-white">
        <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-full -ml-2 transition-colors">
          <AirbnbLogo />
        </button>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 border border-gray-200 hover:border-black rounded-full px-4 py-2 font-semibold text-[14px] transition-colors shadow-sm">
             <span className="w-5 h-5 rounded-full overflow-hidden shrink-0"><img src="https://i.pravatar.cc/150?img=3" alt="avatar" /></span>
             Questions?
          </button>
          <button onClick={handleSaveAndExit} className="border border-gray-200 hover:border-black rounded-full px-4 py-2 font-semibold text-[14px] shadow-sm transition-colors">
            Save &amp; exit
          </button>
        </div>
      </header>

      {/* Dynamic Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
         <div className="pt-8 pb-32 px-6">
           {renderStep()}
         </div>
      </main>

      {/* Footer & Progress */}
      <footer className="flex-none bg-white w-full border-t border-gray-200 relative pt-4 pb-6 px-6 md:px-12 z-10">
        {!showSuperhostModal && (
          <div className="absolute top-[-1px] left-0 right-0 h-[3px] bg-transparent flex">
             <div className="h-full bg-gray-200 flex-1 mx-1 rounded-r-lg overflow-hidden relative">
               <div className="absolute top-0 left-0 bottom-0 bg-[#222222] transition-all duration-500 ease-out" style={{width: `${Math.min(100, Math.max(0, (progressPercentage / 33) * 100))}%`}}/>
             </div>
             <div className="h-full bg-gray-200 flex-1 mx-1 overflow-hidden relative">
               <div className="absolute top-0 left-0 bottom-0 bg-[#222222] transition-all duration-500 ease-out" style={{width: `${Math.min(100, Math.max(0, ((progressPercentage - 33) / 33) * 100))}%`}}/>
             </div>
             <div className="h-full bg-gray-200 flex-1 mx-1 rounded-l-lg overflow-hidden relative">
               <div className="absolute top-0 left-0 bottom-0 bg-[#222222] transition-all duration-500 ease-out" style={{width: `${Math.min(100, Math.max(0, ((progressPercentage - 66) / 34) * 100))}%`}}/>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between max-w-3xl mx-auto w-full mt-2">
           <button 
             onClick={handleBack}
             className={`font-semibold underline transition-colors px-4 py-3 rounded-xl hover:bg-gray-50 text-[16px] ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-[#222222]'}`}
           >
             Back
           </button>
           <button 
             onClick={handleNext}
             disabled={loading}
             className={`px-8 py-3.5 rounded-xl text-[16px] font-semibold transition-transform active:scale-95 flex items-center min-w-[120px] justify-center text-white ${loading ? 'bg-gray-400' : 'bg-[#222222] hover:bg-black'}`}
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : STEPS[currentStep] === "SafetyDetails" ? "Publish listing" : "Next"}
           </button>
        </div>
      </footer>
    </div>
  );
}

