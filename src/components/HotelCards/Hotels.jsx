import React from "react";
import { BsHeartFill, BsHeart } from "react-icons/bs";
import { FiMapPin, FiBed, FiBath } from "react-icons/fi";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "../ui/card.jsx";

function HotelCard({ 
  image, 
  title, 
  location, 
  beds, 
  baths, 
  price, 
  availability 
}) {
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [showPopup, setShowPopup] = React.useState(false);

  const handleHeartClick = () => {
    setIsFavorite(!isFavorite);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 500);
  };

  return (
    <Card className="w-70 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover rounded-t-xl"
        />
        <CardAction className="absolute! top-3! right-3! z-10">
          <button
            onClick={handleHeartClick}
            className={`p-2 rounded-full transition-all duration-200 ${
              isFavorite
                ? "bg-white shadow-lg text-red-500 scale-110"
                : "bg-white/80 hover:bg-white text-gray-600 hover:scale-110"
            }`}
          >
            {isFavorite ? <BsHeartFill className="w-5 h-5" /> : <BsHeart className="w-5 h-5" />}
          </button>
        </CardAction>
        {availability && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs font-medium">
            {availability}
          </div>
        )}
        {showPopup && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-red-500 text-4xl animate-ping scale-0 opacity-0 [animation-delay:0.1s,animation-duration:0.5s]">
              💖
            </div>
          </div>
        )}
      </div>
      <CardHeader className="pb-2 pt-3 px-4 gap-1">
        <CardTitle className="text-lg leading-tight font-semibold">{title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm">
          <FiMapPin className="w-4 h-4" />
          {location}
        </CardDescription>
        {beds !== undefined && baths !== undefined && (
          <CardDescription className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1">
              <FiBed className="w-4 h-4" /> {beds} beds
            </span>
            <span className="flex items-center gap-1">
              <FiBath className="w-4 h-4" /> {baths} baths
            </span>
          </CardDescription>
        )}
        <div className="flex items-baseline gap-1">
          <CardTitle className="text-xl font-bold">{price}</CardTitle>
          <CardDescription className="text-xs">night</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

// Main Hotels component that displays multiple hotel cards
function Hotels() {
  const hotels = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop",
      title: "Modern Luxury Hotel",
      location: "New York, NY",
      beds: 3,
      baths: 2,
      price: "$299",
      availability: "Available Now"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&auto=format&fit=crop",
      title: "Beachfront Villa",
      location: "Miami, FL",
      beds: 4,
      baths: 3,
      price: "$450",
      availability: "Booked"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop",
      title: "Downtown Apartment",
      location: "Chicago, IL",
      beds: 2,
      baths: 1,
      price: "$189",
      availability: "Available"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop",
      title: "Mountain Resort",
      location: "Aspen, CO",
      beds: 5,
      baths: 4,
      price: "$650",
      availability: "Available Now"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&auto=format&fit=crop",
      title: "City View Penthouse",
      location: "Los Angeles, CA",
      beds: 3,
      baths: 3,
      price: "$525",
      availability: "Limited"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&auto=format&fit=crop",
      title: "Budget Inn",
      location: "Orlando, FL",
      beds: 2,
      baths: 1,
      price: "$89",
      availability: "Available"
    }
  ];

  return (
    <div className="hotels-container">
      <h2 className="text-2xl font-bold mb-6 text-center">Featured Hotels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            image={hotel.image}
            title={hotel.title}
            location={hotel.location}
            beds={hotel.beds}
            baths={hotel.baths}
            price={hotel.price}
            availability={hotel.availability}
          />
        ))}
      </div>
    </div>
  );
}

export default Hotels;