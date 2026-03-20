import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiShare, FiHeart, FiStar } from 'react-icons/fi';
import { BsCheckCircle } from 'react-icons/bs';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Mock Data (In a real app, this would be fetched based on the ID)
const hotelData = {
  id: 1,
  title: "Entire villa hosted by Vaibhav",
  location: "Udaipur, Rajasthan, India",
  rating: 4.8,
  reviews: 124,
  host: {
    name: "Vaibhav",
    joined: "Joined in 2020",
    image: "https://i.pravatar.cc/150?img=33"
  },
  guests: 6,
  bedrooms: 3,
  beds: 3,
  baths: 2,
  price: 6207,
  description: "Experience the magic of Udaipur in this stunning villa overlooking the city. Perfect for families or a group of friends, this place offers a blend of modern amenities with traditional Rajasthani architecture.",
  images: [
    "https://a0.muscache.com/im/pictures/miso/Hosting-52410312/original/a0a19491-bdfc-4573-ae09-0d19bc2a16d5.jpeg?im_w=1200",
    "https://a0.muscache.com/im/pictures/miso/Hosting-52410312/original/c41de454-0466-41f2-98ed-7389a0f0bc6a.jpeg?im_w=720",
    "https://a0.muscache.com/im/pictures/miso/Hosting-52410312/original/87b4712c-47fc-48eb-aa2d-b73373adfb9c.jpeg?im_w=720",
    "https://a0.muscache.com/im/pictures/miso/Hosting-52410312/original/cd0b0dcd-d877-4402-ae2b-7be71981a329.jpeg?im_w=720",
    "https://a0.muscache.com/im/pictures/miso/Hosting-52410312/original/61f5f922-a9b8-4d6d-abd4-2ebfc1a2a464.jpeg?im_w=720"
  ],
  amenities: [
    "Wifi", "Pool", "Kitchen", "Free parking", "Air conditioning", "Pet friendly"
  ],
  coordinates: [24.5854, 73.7125]
};

const HotelDetails = () => {
  const { id } = useParams();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // In real app, fetch data here based on `id`
  const data = hotelData;

  const calculateDays = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate - startDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 1;
  };

  const days = calculateDays();
  const totalPrice = data.price * days;
  const serviceFee = Math.round(totalPrice * 0.14); // 14% Airbnb fee approx
  const total = totalPrice + serviceFee;

  return (
    <div className="max-w-[1120px] mx-auto px-6 pt-6 pb-24 text-gray-900">
      
      {/* Title & Header section */}
      <h1 className="text-[26px] font-semibold mb-2">{data.title}</h1>
      
      <div className="flex justify-between items-end mb-6">
        <div className="flex items-center gap-1 text-[15px] font-medium underline">
          <span>{data.location}</span>
        </div>
        
        <div className="flex gap-4">
          <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-md font-medium text-sm transition">
            <FiShare className="w-5 h-5" />
            <span className="underline">Share</span>
          </button>
          <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-md font-medium text-sm transition">
            <FiHeart className="w-5 h-5" />
            <span className="underline">Save</span>
          </button>
        </div>
      </div>

      {/* 5-Image Gallery Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[460px] rounded-xl overflow-hidden mb-12">
        <div className="col-span-2 row-span-2">
          <img src={data.images[0]} alt="Main" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={data.images[1]} alt="Gallery 1" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={data.images[2]} alt="Gallery 2" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1">
          <img src={data.images[3]} alt="Gallery 3" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
        </div>
        <div className="col-span-1 row-span-1 relative">
          <img src={data.images[4]} alt="Gallery 4" className="w-full h-full object-cover hover:brightness-90 transition cursor-pointer" />
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
              <h2 className="text-[22px] font-semibold mb-1">Entire home hosted by {data.host.name}</h2>
              <div className="text-[15px] text-gray-700 flex gap-1">
                <span>{data.guests} guests</span> ·
                <span>{data.bedrooms} bedrooms</span> ·
                <span>{data.beds} beds</span> ·
                <span>{data.baths} baths</span>
              </div>
            </div>
            <img src={data.host.image} alt={data.host.name} className="w-14 h-14 rounded-full object-cover" />
          </div>

          {/* Description */}
          <div className="py-8 border-b">
            <p className="text-[16px] text-gray-800 leading-relaxed font-light">
              {data.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="py-8 border-b">
            <h2 className="text-[22px] font-semibold mb-6">What this place offers</h2>
            <div className="grid grid-cols-2 gap-y-4">
              {data.amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 text-[16px] text-gray-800">
                  <BsCheckCircle className="w-6 h-6 text-gray-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Location */}
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
        </div>

        {/* Right Column - Sticky Reservation Card */}
        <div className="w-[330px]">
          <div className="sticky top-28 bg-white border border-gray-200 rounded-xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] p-6 z-10">
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-[22px] font-semibold">₹{data.price.toLocaleString('en-IN')}</span>
              <span className="text-[15px] font-light text-gray-600">night</span>
            </div>

            {/* Date Picker Input */}
            <div className="border border-gray-400 rounded-lg overflow-hidden mb-4">
              <div className="flex border-b border-gray-400">
                <div className="w-1/2 p-3 border-r border-gray-400 hover:bg-gray-50 cursor-pointer">
                  <div className="text-[10px] uppercase font-bold text-gray-800 mb-1">Check-in</div>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Add date"
                    className="w-full outline-none bg-transparent text-sm text-gray-700"
                  />
                </div>
                <div className="w-1/2 p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="text-[10px] uppercase font-bold text-gray-800 mb-1">Checkout</div>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    placeholderText="Add date"
                    className="w-full outline-none bg-transparent text-sm text-gray-700"
                  />
                </div>
              </div>
              <div className="p-3 w-full hover:bg-gray-50 cursor-pointer">
                <div className="text-[10px] uppercase font-bold text-gray-800 mb-1">Guests</div>
                <div className="text-sm text-gray-700">1 guest</div>
              </div>
            </div>

            <button className="w-full bg-[#FF385C] hover:bg-[#d90b63] text-white font-semibold py-3.5 rounded-lg transition text-[16px] mb-4">
              Reserve
            </button>
            <div className="text-center text-sm text-gray-500 mb-6 font-light">
              You won't be charged yet
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-[16px] text-gray-700 font-light">
                <span className="underline">₹{data.price.toLocaleString('en-IN')} x {days} nights</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[16px] text-gray-700 font-light">
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
