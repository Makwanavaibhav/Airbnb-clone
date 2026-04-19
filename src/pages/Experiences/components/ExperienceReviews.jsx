import React from 'react';
import { Star } from 'lucide-react';

const ExperienceReviews = ({ rating, count }) => {
  // Mock generated reviews
  const mockReviews = [
    {
      id: 1,
      name: "Alex",
      location: "London, UK",
      avatar: "https://i.pravatar.cc/150?u=a",
      text: "This was the highlight of our trip! We learned so much and got a completely different perspective.",
      time: "2 weeks ago"
    },
    {
      id: 2,
      name: "Priya",
      location: "Delhi, India",
      avatar: "https://i.pravatar.cc/150?u=p",
      text: "Our host was fantastic. So deeply knowledgeable and really made an effort to ensure everyone was comfortable.",
      time: "1 month ago"
    },
    {
      id: 3,
      name: "John",
      location: "Sydney, Australia",
      avatar: "https://i.pravatar.cc/150?u=j",
      text: "Highly recommended! Excellent pace, great storytelling, and the food stop was incredible.",
      time: "2 months ago"
    },
    {
      id: 4,
      name: "Sophie",
      location: "Paris, France",
      avatar: "https://i.pravatar.cc/150?u=s",
      text: "Really enjoyed the authentic vibe. Not just a tourist trap, you actually feel like you're exploring with a friend.",
      time: "3 months ago"
    }
  ];

  return (
    <div className="py-12 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-8">
        <Star size={24} fill="currentColor" className="dark:text-white" />
        <h2 className="text-2xl font-bold dark:text-white">{rating} · {count} reviews</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {mockReviews.map((review) => (
          <div key={review.id} className="flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full" />
              <div>
                <h4 className="font-semibold dark:text-white">{review.name}</h4>
                <p className="text-gray-500 text-sm">{review.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <div className="flex text-gray-900 dark:text-white">
                {[...Array(5)].map((_, i) => (
                   <Star key={i} size={10} fill="currentColor" />
                ))}
              </div>
              <span className="text-sm font-semibold ml-2 dark:text-gray-300">·</span>
              <span className="text-sm text-gray-500 font-semibold ml-1">{review.time}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-lg mb-2">
              {review.text}
            </p>
            <button className="font-semibold underline dark:text-white self-start">Show more</button>
          </div>
        ))}
      </div>
      
      <button className="mt-10 border border-black dark:border-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-white">
        Show all {count} reviews
      </button>
    </div>
  );
};

export default ExperienceReviews;
