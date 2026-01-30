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


function HotelCard({ image, details, index }) {
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div 
      className="relative shrink-0 w-60 h-70 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer">
      <img 
        src={image} 
        alt={`Hotel ${index + 1}`} 
        className="absolute inset-0 w-full h-full object-cover"/>
      
      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />
      
      <button
        onClick={handleHeartClick}
        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-20 ${
          isFavorite
            ? "bg-white shadow-lg text-red-600 scale-100"
            : "bg-white/80 hover:bg-white text-gray-600 hover:scale-110 group-hover:bg-white"
        }`}>
        {isFavorite ? <BsHeartFill className="w-5 h-5" /> : <BsHeart className="w-5 h-5" />}
      </button>
      
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white z-10">
        <h3 className="text-xl font-bold mb-1">{details.title}</h3>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-200">
            <FiMapPin className="w-4 h-4" />
            <span>{details.location}</span>
          </div>
          
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md">
            <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold">{details.rating}</span>
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{details.price}</span>
          <span className="text-sm text-gray-200">for {details.period}</span>
        </div>
      </div>
    </div>
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
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Popular homes in Udaipur</h2>
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
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Top Picks in Goa</h2>
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
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Places to stay in Mumbai</h2>
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