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

  const FALLBACK = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";

  const handleError = () => {
    if (hasError || !imgSrc) {
      // Already tried once — use the Unsplash fallback
      setImgSrc(FALLBACK);
      return;
    }
    setHasError(true);
    // Try swapping letter-case of hotel-N.jpeg
    if (imgSrc.includes('/hotel-')) {
      setImgSrc(imgSrc.replace('/hotel-', '/Hotel-'));
    } else if (imgSrc.includes('/Hotel-')) {
      setImgSrc(imgSrc.replace('/Hotel-', '/hotel-'));
    } else {
      setImgSrc(FALLBACK);
    }
  };

  return (
    <Link to={hotel._isExperience ? `/experience/${hotel._id || hotel.id}` : `/hotel/${hotel._id || hotel.id}`} className="flex flex-col gap-3 group cursor-pointer w-full">
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
        
        {/* Host Info */}
        {(hotel.host?.name || hotel.hostName) && (
          <div className="flex items-center gap-2 mt-1 mb-1">
            <img 
              src={hotel.host?.image || 'https://a0.muscache.com/im/pictures/user/User-83344331-50e5-4f38-bc06-2d3fb84cdbd7.jpg'} 
              alt={hotel.host?.name || hotel.hostName}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-[13px] text-gray-600 dark:text-gray-300">Hosted by {hotel.host?.name || hotel.hostName}</span>
          </div>
        )}
        
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{hotel.price || (hotel.priceRaw ? `₹${hotel.priceRaw}` : '₹0')}</span>
          <span className="text-[15px] text-gray-900 dark:text-gray-100 font-light">{hotel._isExperience ? 'person' : 'night'}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              navigate(`/checkout/${hotel._id || hotel.id}`);
            }}
            className="flex-1 bg-airbnb hover:bg-rose-600 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
          >
            Book Now
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (!isLoggedIn) {
                navigate('/login');
              } else {
                navigate(`/messages?hostId=${hotel.hostId}`);
              }
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
          >
            Chat with Host
          </button>
        </div>
      </div>
    </Link>
  );
}

function Card({ hotels, title, layout = "scroll" }) {
  if (!hotels || hotels.length === 0) return null;

  if (layout === "grid") {
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

export default Card;