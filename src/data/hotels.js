import Uhotel from "../assets/hotels/hotel-1.jpeg";
import Uhotel2 from "../assets/hotels/hotel-2.jpeg";
import Uhotel3 from "../assets/hotels/hotel-3.jpeg";
import Uhotel4 from "../assets/hotels/hotel-4.jpeg";
import Uhotel5 from "../assets/hotels/hotel-5.jpeg";
import Uhotel6 from "../assets/hotels/Hotel-6.jpeg";
import Uhotel7 from "../assets/hotels/Hotel-7.jpeg";
import GHotel1 from "../assets/hotels/Hotel-8.jpeg";
import GHotel2 from "../assets/hotels/hotel-9.jpeg";
import GHotel3 from "../assets/hotels/hotel-10.jpeg";
import GHotel4 from "../assets/hotels/hotel-11.jpeg";
import GHotel5 from "../assets/hotels/Hotel-12.jpeg";
import GHotel6 from "../assets/hotels/Hotel-13.jpeg";
import GHotel7 from "../assets/hotels/Hotel-14.jpeg";
import GHotel8 from "../assets/hotels/Hotel-15.jpeg";
import MHotel1 from "../assets/hotels/Hotel-16.jpeg";
import MHotel2 from "../assets/hotels/Hotel-17.jpeg";
import MHotel3 from "../assets/hotels/Hotel-18.jpeg";
import MHotel4 from "../assets/hotels/Hotel-19.jpeg";
import MHotel5 from "../assets/hotels/Hotel-20.jpeg";
import MHotel6 from "../assets/hotels/Hotel-21.jpeg";
import MHotel7 from "../assets/hotels/Hotel-22.jpeg";

const commonDetails = {
  host: {
    name: "Host Name",
    joined: "Joined in 2020",
    image: "https://i.pravatar.cc/150?img=33"
  },
  guests: 4,
  bedrooms: 2,
  beds: 2,
  baths: 1,
  description: "Experience a wonderful stay in this beautiful location. This place offers a blend of modern amenities and local charm, perfect for your next getaway.",
  amenities: ["Wifi", "Kitchen", "Free parking", "Air conditioning"],
  coordinates: [24.5854, 73.7125] // Default coordinates
};

export const hotels = [
  // Udaipur Hotels (IDs 1-7)
  { id: 1, title: "Apartment in Udaipur", location: "Udaipur", price: "₹6,207", priceRaw: 6207, period: "2 nights", rating: "4.8", image: Uhotel, ...commonDetails, host: { ...commonDetails.host, name: "Vaibhav" } },
  { id: 2, title: "Room in Udaipur", location: "Udaipur", price: "₹7,989", priceRaw: 7989, period: "2 nights", rating: "4.9", image: Uhotel2, ...commonDetails },
  { id: 3, title: "Home in Udaipur", location: "Udaipur", price: "₹8,673", priceRaw: 8673, period: "4 nights", rating: "5.0", image: Uhotel3, ...commonDetails },
  { id: 4, title: "Room in Udaipur", location: "Udaipur", price: "₹6,000", priceRaw: 6000, period: "3 nights", rating: "4.8", image: Uhotel4, ...commonDetails },
  { id: 5, title: "Room in Pichola", location: "Pichola", price: "₹5,000", priceRaw: 5000, period: "2 nights", rating: "4.9", image: Uhotel5, ...commonDetails },
  { id: 6, title: "Home in pichola", location: "Pichola", price: "₹3,000", priceRaw: 3000, period: "2 nights", rating: "4.4", image: Uhotel6, ...commonDetails },
  { id: 7, title: "Place to stay in pichola", location: "Pichola", price: "₹4,600", priceRaw: 4600, period: "3 nights", rating: "4.7", image: Uhotel7, ...commonDetails },

  // Goa Hotels (IDs 8-15)
  { id: 8, title: "Beach Villa in Goa", location: "North Goa", price: "₹9,500", priceRaw: 9500, period: "2 nights", rating: "4.9", image: GHotel1, ...commonDetails },
  { id: 9, title: "Sea View Apartment", location: "Calangute", price: "₹7,200", priceRaw: 7200, period: "3 nights", rating: "4.7", image: GHotel2, ...commonDetails },
  { id: 10, title: "Luxury Resort", location: "Baga", price: "₹12,000", priceRaw: 12000, period: "2 nights", rating: "4.8", image: GHotel3, ...commonDetails },
  { id: 11, title: "Budget Stay", location: "Anjuna", price: "₹3,500", priceRaw: 3500, period: "2 nights", rating: "4.5", image: GHotel4, ...commonDetails },
  { id: 12, title: "Penthouse in Goa", location: "Panjim", price: "₹15,000", priceRaw: 15000, period: "3 nights", rating: "5.0", image: GHotel5, ...commonDetails },
  { id: 13, title: "Home in Anjuna", location: "Anjuna", price: "₹6,400", priceRaw: 6400, period: "2 nights", rating: "5.0", image: GHotel6, ...commonDetails },
  { id: 14, title: "Apartment in Siolim", location: "North Goa", price: "₹9,899", priceRaw: 9899, period: "2 nights", rating: "4.8", image: GHotel7, ...commonDetails },
  { id: 15, title: "Apartment in Varca", location: "South Goa", price: "₹6,159", priceRaw: 6159, period: "2 nights", rating: "4.9", image: GHotel8, ...commonDetails },

  // Mumbai Hotels (IDs 16-22)
  { id: 16, title: "Room in Bandra West", location: "Bandra", price: "₹7,532", priceRaw: 7532, period: "2 nights", rating: "4.9", image: MHotel1, ...commonDetails },
  { id: 17, title: "Room in Santacruz East", location: "Mumbai", price: "₹5,989", priceRaw: 5989, period: "2 nights", rating: "4.8", image: MHotel2, ...commonDetails },
  { id: 18, title: "Place to stay", location: "Bandra West", price: "₹8,973", priceRaw: 8973, period: "3 nights", rating: "4.8", image: MHotel3, ...commonDetails },
  { id: 19, title: "Flat in Goregaon West", location: "Mumbai", price: "₹8,000", priceRaw: 8000, period: "2 nights", rating: "4.9", image: MHotel4, ...commonDetails },
  { id: 20, title: "Studio Apartment", location: "Bandra West", price: "₹7,600", priceRaw: 7600, period: "2 nights", rating: "4.7", image: MHotel5, ...commonDetails },
  { id: 21, title: "Place to stay", location: "Andheri West", price: "₹5,900", priceRaw: 5900, period: "2 nights", rating: "4.4", image: MHotel6, ...commonDetails },
  { id: 22, title: "Apartment in Bandra", location: "Bandra East", price: "₹15,200", priceRaw: 15200, period: "4 nights", rating: "4.9", image: MHotel7, ...commonDetails },
];

export const udaipurHotels = hotels.filter(h => h.id <= 7);
export const goaHotels = hotels.filter(h => h.id > 7 && h.id <= 15);
export const mumbaiHotels = hotels.filter(h => h.id > 15);
