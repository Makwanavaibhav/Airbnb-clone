import React from 'react';
import { useSearch } from "../../context/SearchContext";

const servicesList = [
  {
    id: 1,
    title: "Private Chef & Catering",
    description: "Enjoy gourmet meals prepared in your rental by a professional local chef.",
    price: "From $150/meal",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80",
    rating: 4.9
  },
  {
    id: 2,
    title: "In-home Spa & Massage",
    description: "Relax with a premium massage or spa treatment without leaving your room.",
    price: "From $90/hr",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80",
    rating: 5.0
  },
  {
    id: 3,
    title: "Daily Housekeeping",
    description: "Keep your space spotless with our trusted daily cleaning professionals.",
    price: "From $40/day",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80",
    rating: 4.8
  }
];

export default function Services() {
  const { appliedSearch } = useSearch();
  const destination = appliedSearch?.destination || "your area";

  return (
    <div className="w-full px-8 py-10 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
           <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Elevate your stay in {destination}
           </h1>
           <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto dark:text-gray-400">
              Transform your Airbnb trip into a 5-star hotel experience with our vetted professional services. 
           </p>
        </div>

        <div className="flex flex-col gap-10">
          {servicesList.map((service, index) => (
            <div 
              key={service.id} 
              className={`flex flex-col md:flex-row gap-8 items-center bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow p-6 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shrink-0">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center px-4 md:px-8">
                <div className="flex items-center gap-2 mb-3">
                   <span className="text-[#FF385C]">★</span>
                   <span className="text-gray-900 dark:text-white font-medium">{service.rating}</span>
                </div>
                <h3 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-300 text-lg mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-medium text-gray-900 dark:text-white">
                    {service.price}
                  </span>
                  <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 transition-colors text-white font-semibold rounded-lg shadow-sm">
                    Book Service
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
