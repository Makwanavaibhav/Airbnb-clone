import React from "react";
import { BsHeartFill, BsHeart } from "react-icons/bs";
import { FiMapPin, FiStar } from "react-icons/fi";
import Uhotel from "../../assets/hotels/hotel-1.jpeg";
import Uhotel2 from "../../assets/hotels/hotel-2.jpeg";
import Uhotel3 from "../../assets/hotels/hotel-3.jpeg";
import Uhotel4 from "../../assets/hotels/hotel-4.jpeg";
import Uhotel5 from "../../assets/hotels/hotel-5.jpeg";
import Uhotel6 from "../../assets/hotels/Hotel-6.jpeg";
import Uhotel7 from "../../assets/hotels/Hotel-7.jpeg";
import GHotel1 from "../../assets/hotels/Hotel-8.jpeg";
import GHotel2 from "../../assets/hotels/hotel-9.jpeg";
import GHotel3 from "../../assets/hotels/hotel-10.jpeg";
import GHotel4 from "../../assets/hotels/hotel-11.jpeg";
import GHotel5 from "../../assets/hotels/Hotel-12.jpeg";
import GHotel6 from "../../assets/hotels/Hotel-13.jpeg";
import GHotel7 from "../../assets/hotels/Hotel-14.jpeg";
import GHotel8 from "../../assets/hotels/Hotel-15.jpeg";
import MHotel1 from "../../assets/hotels/Hotel-16.jpeg";
import MHotel2 from "../../assets/hotels/Hotel-17.jpeg";
import MHotel3 from "../../assets/hotels/Hotel-18.jpeg";
import MHotel4 from "../../assets/hotels/Hotel-19.jpeg";
import MHotel5 from "../../assets/hotels/Hotel-20.jpeg";
import MHotel6 from "../../assets/hotels/Hotel-21.jpeg";
import MHotel7 from "../../assets/hotels/Hotel-22.jpeg";


import { Link } from "react-router-dom";

function HotelCard({ image, details, index }) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleHeartClick = (e) => {
    e.preventDefault(); // Prevent navigating when clicking heart
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link to={`/hotel/${index + 1}`} className="flex flex-col gap-3 group cursor-pointer w-[300px] shrink-0">
      {/* Image container - Exact square */}
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img 
          src={image} 
          alt={`Hotel ${index + 1}`} 
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
          <h3 className="text-[15px] font-semibold text-gray-900 truncate pr-2">{details.location}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <FiStar className="w-[14px] h-[14px] fill-current text-gray-900" />
            <span className="text-[15px] text-gray-900 font-light">{details.rating}</span>
          </div>
        </div>
        
        <p className="text-[15px] text-gray-500 font-light truncate">{details.title}</p>
        <p className="text-[15px] text-gray-500 font-light truncate">{details.period}</p>
        
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-[15px] font-semibold text-gray-900">{details.price}</span>
          <span className="text-[15px] text-gray-900 font-light">night</span>
        </div>
      </div>
    </Link>
  );
}

function Card() {
  // Udaipur Hotels
  const udaipurHotelImages = [Uhotel, Uhotel2, Uhotel3, Uhotel4, Uhotel5, Uhotel6, Uhotel7];
  
  const udaipurHotelDetails = [
    { title: "Apartment in Udaipur", location: "Udaipur", price: "₹6,207", period: "2 nights", rating: "4.8" },
    { title: "Room in Udaipur", location: "Udaipur", price: "₹7,989", period: "2 nights", rating: "4.9" },
    { title: "Home in Udaipur", location: "Udaipur", price: "₹8,673", period: "4 nights", rating: "5.0" },
    { title: "Room in Udaipur", location: "Udaipur", price: "₹6,000", period: "3 nights", rating: "4.8" },
    { title: "Room in Pichola", location: "Pichola", price: "₹5,000", period: "2 nights", rating: "4.9" },
    { title: "Home in pichola", location: "Pichola", price: "₹3,000", period: "2 nights", rating: "4.4" },
    { title: "Place to stay in pichola", location: "Pichola", price: "₹4,600", period: "3 nights", rating: "4.7" },
  ];

  // Goa Hotels 
  const goaHotelImages = [GHotel1, GHotel2, GHotel3, GHotel4, GHotel5, GHotel6, GHotel7, GHotel8];
  
  const goaHotelDetails = [
    { title: "Beach Villa in Goa", location: "North Goa", price: "₹9,500", period: "2 nights", rating: "4.9" },
    { title: "Sea View Apartment", location: "Calangute", price: "₹7,200", period: "3 nights", rating: "4.7" },
    { title: "Luxury Resort", location: "Baga", price: "₹12,000", period: "2 nights", rating: "4.8" },
    { title: "Budget Stay", location: "Anjuna", price: "₹3,500", period: "2 nights", rating: "4.5" },
    { title: "Penthouse in Goa", location: "Panjim", price: "₹15,000", period: "3 nights", rating: "5.0" },
    { title: "Home in Anjuna", location: "Anjuna", price: "₹6,400", period: "2 nights", rating: "5.0" },
    { title: "Apartment in Siolim", location: "North Goa", price: "₹9,899", period: "2 nights", rating: "4.8" },
    { title: "Apartment in Varca", location: "South Goa", price: "₹6,159", period: "2 nights", rating: "4.9" },
  ];

  //Mumbai Hotels
  const mumbaiHotelImages = [MHotel1, MHotel2, MHotel3, MHotel4, MHotel5, MHotel6, MHotel7];
  
  const mumbaiHotelDetails = [
    { title: "Room in Bandra West", location: "Bandra", price: "₹7,532", period: "2 nights", rating: "4.9" },
    { title: "Room in Santacruz East", location: "Mumbai", price: "₹5,989", period: "2 nights", rating: "4.8" },
    { title: "Place to stay", location: "Bandra West", price: "₹8,973", period: "3 nights", rating: "4.8" },
    { title: "Flat in Goregaon West", location: "Mumbai", price: "₹8,000", period: "2 nights", rating: "4.9" },
    { title: "Studio Apartment", location: "Bandra West", price: "₹7,600", period: "2 nights", rating: "4.7" },
    { title: "Place to stay", location: "Andheri West", price: "₹5,900", period: "2 nights", rating: "4.4" },
    { title: "Apartment in Bandra", location: "Bandra East", price: "₹15,200", period: "4 nights", rating: "4.9" },
  ];


  return (
    <div>
      {/* Udaipur Hotels Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Popular homes in Udaipur</h2>
        <div className="flex space-x-5 overflow-x-auto scrollbar-hide">
          {udaipurHotelImages.map((image, index) => {
            const details = udaipurHotelDetails[index] || udaipurHotelDetails[0];
            
            return (
              <HotelCard
                key={`udaipur-hotel-${index}`}
                image={image}
                details={details}
                index={index}
              />
            );
          })}
        </div>
      </div>
      
      {/* Goa Hotels Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Top Picks in Goa</h2>
        <div className="flex space-x-5 overflow-x-auto scrollbar-hide">
          {goaHotelImages.map((image, index) => {
            const details = goaHotelDetails[index] || goaHotelDetails[0];
            
            return (
              <HotelCard
                key={`goa-hotel-${index}`}
                image={image}
                details={details}
                index={index}
              />
            );
          })}
        </div>
      </div>

      {/* Mumbai Hotels Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Places to stay in Mumbai</h2>
        <div className="flex space-x-5 overflow-x-auto scrollbar-hide">
          {mumbaiHotelImages.map((image, index) => {
            const details = mumbaiHotelDetails[index] || mumbaiHotelDetails[0];
            
            return (
              <HotelCard
                key={`mumbai-hotel-${index}`}
                image={image}
                details={details}
                index={index}
              />
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default Card;