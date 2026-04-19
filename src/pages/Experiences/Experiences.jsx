import React from 'react';
import { useSearch } from "../../context/SearchContext";

const items = [
  {
    id: 1,
    title: "Guided Meditation in Nature",
    host: "Elena",
    price: 35,
    rating: 4.95,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1541535650810-10d26f5c2ab3?auto=format&fit=crop&q=80",
    tags: ["Wellness", "Nature"]
  },
  {
    id: 2,
    title: "Authentic Local Cooking Class",
    host: "Marco",
    price: 65,
    rating: 4.98,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&q=80",
    tags: ["Food & Drink", "Culture"]
  },
  {
    id: 3,
    title: "Masterclass: Specialty Coffee",
    host: "James",
    price: 45,
    rating: 4.89,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80",
    tags: ["Food & Drink"]
  },
  {
    id: 4,
    title: "Sunset Sailboat Tour",
    host: "Captain Sarah",
    price: 120,
    rating: 5.0,
    reviews: 430,
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80",
    tags: ["Sightseeing", "Water"]
  }
];

export default function Experiences() {
  const { appliedSearch } = useSearch();
  const destination = appliedSearch?.destination || "your area";

  return (
    <div className="w-full px-8 py-10 min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Unforgettable experiences in {destination}
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            Led by locals who love where they're from and what they do.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-md shadow-sm text-gray-900">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-sm font-medium mb-1">
                 <span className="text-gray-900 dark:text-white pb-1 shrink-0">★</span>
                 <span className="text-gray-900 dark:text-white">{item.rating}</span>
                 <span className="text-gray-500">({item.reviews})</span>
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium truncate mb-1">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm mb-2">
                Hosted by {item.host}
              </p>
              <div className="text-gray-900 dark:text-white text-sm">
                <span className="font-semibold">From ${item.price}</span> / person
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
