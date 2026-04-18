import React from "react";
import { BsHeartFill, BsHeart } from "react-icons/bs";
import { FiStar } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function HotelCard({ hotel }) {
  const { isLoggedIn, wishlistIds, toggleWishlist } = useAuth();
  const hotelId = String(hotel._id || hotel.id);
  const isFavorite = wishlistIds.has(hotelId);

  const [imgSrc, setImgSrc] = React.useState(hotel.image || (hotel.images && hotel.images[0]));
  const [hasError, setHasError] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setImgSrc(hotel.image || (hotel.images && hotel.images[0]));
    setHasError(false);
  }, [hotel]);

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    await toggleWishlist(hotelId);
  };

  const handleError = () => {
    if (!hasError && imgSrc) {
      setHasError(true);
      if (imgSrc.includes('/hotel-')) {
        setImgSrc(imgSrc.replace('/hotel-', '/Hotel-'));
      } else if (imgSrc.includes('/Hotel-')) {
        setImgSrc(imgSrc.replace('/Hotel-', '/hotel-'));
      }
    }
  };

  return (
    <Link to={`/hotel/${hotel._id || hotel.id}`} className="flex flex-col gap-3 group cursor-pointer w-full">
      {/* Image container - 16:9 on Mobile, Square on Tablet+ */}
      <div className="relative aspect-[16/9] md:aspect-square overflow-hidden rounded-xl">
        <img 
          src={imgSrc} 
          onError={handleError}
          alt={hotel.title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleHeartClick}
          className="absolute top-4 right-4 p-2 z-20 hover:scale-110 active:scale-95 transition-all w-[44px] h-[44px] flex items-center justify-center"
        >
          {isFavorite ? (
            <BsHeartFill className="w-7 h-7 text-airbnb drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" style={{ color: '#FF385C' }} />
          ) : (
            <BsHeart className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ strokeWidth: 1.5 }} />
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

function Card({ hotels, title, layout = "grid" }) {
  if (!hotels || hotels.length === 0) return null;

  if (layout === "scroll") {
    return (
      <div className="mb-10 w-full overflow-hidden">
        {title && <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title}</h2>}
        <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x">
          {hotels.map((hotel) => (
            <div key={`hotel-${hotel.id || hotel._id}`} className="min-w-[280px] md:min-w-[320px] snap-start">
              <HotelCard hotel={hotel} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 w-full">
      {title && <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xs:gap-8">
        {hotels.map((hotel) => (
          <HotelCard
            key={`hotel-${hotel.id || hotel._id}`}
            hotel={hotel}
          />
        ))}
      </div>
    </div>
  );
}

export default Card;