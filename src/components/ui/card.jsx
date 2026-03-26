import React from "react";
import { BsHeartFill, BsHeart } from "react-icons/bs";
import { FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";

export function HotelCard({ hotel }) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleHeartClick = (e) => {
    e.preventDefault(); // Prevent navigating when clicking heart
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link to={`/hotel/${hotel.id}`} className="flex flex-col gap-3 group cursor-pointer w-[300px] shrink-0">
      {/* Image container - Exact square */}
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img 
          src={hotel.image} 
          alt={hotel.title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleHeartClick}
          className="absolute top-3 right-3 p-2 z-20 hover:scale-110 active:scale-95 transition-all"
        >
          {isFavorite ? (
            <BsHeartFill className="w-6 h-6 text-airbnb drop-shadow-md" style={{ color: '#FF385C' }} />
          ) : (
            <BsHeart className="w-6 h-6 text-white drop-shadow-md" style={{ strokeWidth: 1 }} />
          )}
        </button>
      </div>
      
      {/* Text Details Container */}
      <div className="flex flex-col text-left">
        <div className="flex justify-between items-start">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">{hotel.location}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <FiStar className="w-[14px] h-[14px] fill-current text-gray-900 dark:text-gray-100" />
            <span className="text-[15px] text-gray-900 dark:text-gray-100 font-light">{hotel.rating}</span>
          </div>
        </div>
        
        <p className="text-[15px] text-gray-500 dark:text-gray-400 font-light truncate">{hotel.title}</p>
        <p className="text-[15px] text-gray-500 dark:text-gray-400 font-light truncate">{hotel.period}</p>
        
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{hotel.price}</span>
          <span className="text-[15px] text-gray-900 dark:text-gray-100 font-light">night</span>
        </div>
      </div>
    </Link>
  );
}

function Card({ hotels, title }) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <div className="mb-10">
      {title && <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title}</h2>}
      <div className="flex space-x-5 overflow-x-auto scrollbar-hide">
        {hotels.map((hotel) => (
          <HotelCard
            key={`hotel-${hotel.id}`}
            hotel={hotel}
          />
        ))}
      </div>
    </div>
  );
}

export default Card;