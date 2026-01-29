import React from "react";
import { BsHeartFill, BsHeart } from "react-icons/bs";
import { FiMapPin, FiStar } from "react-icons/fi";
import hotel from "../../assets/hotels/hotel-1.jpeg";
import hotel2 from "../../assets/hotels/hotel-2.jpeg";
import hotel3 from "../../assets/hotels/hotel-3.jpeg";
import hotel4 from "../../assets/hotels/hotel-4.jpeg";
import hotel5 from "../../assets/hotels/hotel-5.jpeg";
import hotel6 from "../../assets/hotels/Hotel-6.jpeg";

function HotelCard({ image, details, index }) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div 
      className="relative shrink-0 w-60 h-70 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
    >
      {/* Background Image */}
      <img 
        src={image} 
        alt={`Hotel ${index + 1}`} 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
      
      {/* Heart Button */}
      <button
        onClick={handleHeartClick}
        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-20 ${
          isFavorite
            ? "bg-white shadow-lg text-red-600 scale-100"
            : "bg-white/80 hover:bg-white text-gray-600 hover:scale-110 group-hover:bg-white"
        }`}
      >
        {isFavorite ? <BsHeartFill className="w-5 h-5" /> : <BsHeart className="w-5 h-5" />}
      </button>
      
      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold mb-1">{details.title}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-200">
              <FiMapPin className="w-4 h-4" />
              <span>{details.location}</span>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md">
            <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold">{details.rating}</span>
          </div>
        </div>
        
        {/* Price and Period */}
        <div className="flex items-baseline gap-2 mt-3 pt-3 border-t border-white/20">
          <span className="text-2xl font-bold">{details.price}</span>
          <span className="text-sm text-gray-200">for {details.period}</span>
        </div>
      </div>
    </div>
  );
}

function Card() {
  const hotelImages = [hotel, hotel2, hotel3, hotel4, hotel5, hotel6];
  
  const hotelDetails = [
    { title: "Apartment in Udaipur", location: "Udaipur", price: "₹6,207", period: "2 nights", rating: "4.8" },
    { title: "Room in Udaipur", location: "Udaipur", price: "₹7,989", period: "2 nights", rating: "4.9" },
    { title: "Home in Udaipur", location: "Udaipur", price: "₹8,673", period: "4 nights", rating: "5.0" },
    { title: "Room in Udaipur", location: "Udaipur", price: "₹6,000", period: "3 nights", rating: "4.8" },
    { title: "Room in Pichola", location: "Pichola", price: "₹5,000", period: "2 nights", rating: "4.9" },
    { title: "Home in pichola", location: "Pichola", price: "₹3,000", period: "2 nights", rating: "4.4" },
  ];

  return (
    <div className="flex space-x-5 overflow-x-auto scrollbar-hide">
      {hotelImages.map((image, index) => {
        const details = hotelDetails[index] || hotelDetails[0];
        
        return (
          <HotelCard
            key={`hotel-${index}`}
            image={image}
            details={details}
            index={index}
          />
        );
      })}
    </div>
  );
}

export default Card;