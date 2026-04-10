import React, { useState } from "react";
import { 
  Home, Building, Ship, Trees, Castle, Tent, Caravan, Box, Menu, 
  MapPin, Check, Plus, Minus, UploadCloud, Search, ShieldCheck, DollarSign, Camera
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function ListingCreationWizard({ onClose }) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  // Flattened steps to match the screenshots exactly while incorporating the full flow requested earlier.
  const STEPS = [
    "Intro",
    "PropertyType",
    "ListingType",
    "Location",
    "FloorPlan",       
    "Amenities",
    "Photos",
    "TextDetails",     
    "BookingRules",    
    "Pricing",
    "Review"
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuperhostModal, setShowSuperhostModal] = useState(true);

  // Search autocomplete mock state
  const [locationSearch, setLocationSearch] = useState("");

  const [formData, setFormData] = useState({
    propertyType: "",
    listingType: "",
    location: "Ahmedabad, Gujarat, India", // Set default for ease, updated via input
    guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: [],
    safetyFeatures: [],
    image: null,
    imagePreview: null,
    title: "",
    description: "",
    minNights: 1,
    maxNights: 365,
    instantBook: false,
    houseRules: [],
    price: "",
    cancellationPolicy: "Flexible",
    hasCameras: false,
    hasWeapons: false,
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  const updateForm = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleArray = (field, value) => {
    setFormData((prev) => {
      const list = prev[field];
      if (list.includes(value)) return { ...prev, [field]: list.filter((i) => i !== value) };
      return { ...prev, [field]: [...list, value] };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateForm("image", file);
        updateForm("imagePreview", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.imagePreview) {
      alert("Please upload an image first!");
      setCurrentStep(6); // Go to photos
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const data = new FormData();
      data.append("name", formData.title || `${formData.listingType} in ${formData.location.split(',')[0]}`);
      data.append("location", formData.location);
      data.append("price", formData.price || "5000");
      data.append("rating", "5.0");
      data.append("hostName", "Host"); 
      if (formData.image) data.append("image", formData.image);

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
          { id: "A room", desc: "Guests have their own room in a home, plus access to shared spaces.", i: Building },
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
        const searchResults = [
          { title: "Ahmedabad", sub: "Gujarat, India" },
          { title: "Ahmedabad Railway Station Car Parking", sub: "Laxmi Bazar, Khadia, Ahmedabad, Gujarat, India" },
          { title: "Asarva Railway station Ahmedabad", sub: "Chamanpura Road, Aditya Nagar, D Colony, Ahmedabad, Gujarat, India" },
          { title: "Adalaj", sub: "Gujarat, India" }
        ];

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
                     updateForm("location", e.target.value); // keep it synced
                   }}
                   className="flex-1 bg-transparent border-none outline-none text-[#222222] text-lg font-medium"
                 />
               </div>
               
               {/* Dropdown Results list */}
               {locationSearch && (
                 <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-400 rounded-b-3xl shadow-xl overflow-hidden z-10 p-2 pb-6 max-h-[300px] overflow-y-auto">
                   {searchResults.map((res, i) => (
                     <div 
                        key={i} 
                        onClick={() => {
                          updateForm("location", `${res.title}, ${res.sub}`);
                          setLocationSearch(`${res.title}, ${res.sub}`);
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
                   ))}
                 </div>
               )}
            </div>
          </div>
        );
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

      case "Amenities":
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

      case "Photos":
        return (
          <div className="max-w-3xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
            <h1 className="text-4xl text-[#222222] font-semibold text-center mb-4">Add some photos of your place</h1>
            <p className="text-[#717171] text-lg text-center mb-10">You'll need 5 photos to get started. You can add more or make changes later.</p>
            <div className="bg-white border border-dashed border-gray-400 rounded-3xl min-h-[350px] p-8 flex flex-col items-center justify-center relative bg-gray-50/50 hover:bg-gray-50 transition-colors">
               {formData.imagePreview ? (
                 <div className="w-full relative">
                   <img src={formData.imagePreview} className="w-full h-[400px] object-cover rounded-xl shadow-sm" />
                   <button onClick={() => {updateForm("image", null); updateForm("imagePreview", null)}} className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full font-semibold text-sm shadow hover:scale-105 transition-transform">
                      Delete
                   </button>
                 </div>
               ) : (
                 <label className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
                    <Camera className="w-16 h-16 text-gray-800 mb-6" strokeWidth={1} />
                    <h3 className="text-[22px] font-semibold mb-2">Drag your photos here</h3>
                    <p className="text-[#717171] mb-8">Choose at least 5 photos</p>
                    <div className="text-[#222222] font-semibold underline text-lg">Upload from your device</div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                 </label>
               )}
            </div>
          </div>
        );

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
               className="w-full border border-gray-400 rounded-2xl p-6 text-2xl font-semibold outline-none focus:border-black resize-none"
             />
             <div className="text-gray-500 font-semibold text-sm mt-2">{formData.title.length}/32</div>
           </div>
         );

      case "BookingRules":
      case "Pricing":
         return (
           <div className="max-w-2xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
             <h1 className="text-4xl text-[#222222] font-semibold text-center mb-10">Now, set your price</h1>
             <p className="text-[#717171] mb-10 text-lg text-center">You can change it anytime.</p>
             
             <div className="flex justify-center items-center">
                <div className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-[0_6px_16px_rgba(0,0,0,0.12)] max-w-sm w-full mx-auto flex flex-col items-center">
                  <div className="flex items-center text-7xl font-bold tracking-tighter text-[#222222]">
                    <span className="text-gray-400 mr-1 opacity-70 scale-90">₹</span>
                    <input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => updateForm("price", e.target.value)} 
                      className="bg-transparent outline-none w-[180px] text-center" 
                      placeholder="0"
                    />
                  </div>
                </div>
             </div>
           </div>
         );

      case "Review":
         return (
           <div className="max-w-3xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10 mb-20 text-center">
              <h1 className="text-4xl text-[#222222] font-semibold text-center mb-10">Review your listing</h1>
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 max-w-4xl text-left">
                 <div className="w-full md:w-1/2 aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                   {formData.imagePreview ? <img src={formData.imagePreview} className="w-full h-full object-cover" /> : <span className="text-gray-400">No Image</span>}
                 </div>
                 <div className="w-full md:w-1/2 py-4 flex flex-col justify-center">
                   <div className="flex justify-between items-start mb-2">
                     <h2 className="text-[26px] font-semibold leading-tight">{formData.title || "Your awesome property"}</h2>
                   </div>
                   <div className="text-[19px] font-semibold mb-6 flex items-baseline gap-1">
                     ₹{formData.price || "0"} <span className="text-[15px] font-normal text-gray-600">night</span>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 text-[#222222]">
                        <Home className="w-6 h-6" strokeWidth={1.5} />
                        <div>
                          <div className="font-semibold">{formData.listingType || "Entire place"}</div>
                          <div className="text-sm text-gray-500 break-words">{formData.guests} guests · {formData.bedrooms} bedrooms · {formData.bathrooms} baths</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[#222222]">
                        <MapPin className="w-6 h-6" strokeWidth={1.5} />
                        <div>
                          <div className="font-semibold">{formData.location ? formData.location.split(',')[0] : "Location"}</div>
                        </div>
                      </div>
                   </div>
                 </div>
              </div>
           </div>
         );
      default: return null;
    }
  };

  // Skip the Intro step length for progress calculation
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
          <button onClick={onClose} className="border border-gray-200 hover:border-black rounded-full px-4 py-2 font-semibold text-[14px] shadow-sm transition-colors">
            Save & exit
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
      <footer className="flex-none bg-white w-full border-t border-gray-200 relative pt-4 pb-6 px-6 md:px-12">
        {/* Progress Bar (at exactly top edge of footer) */}
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
             {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : currentStep === STEPS.length - 1 ? "Publish" : "Next"}
           </button>
        </div>
      </footer>
    </div>
  );
}
