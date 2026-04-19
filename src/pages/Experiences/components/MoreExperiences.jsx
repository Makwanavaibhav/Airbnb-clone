import React from 'react';
import { experienceData } from '../experienceData';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight, ChevronLeft } from 'lucide-react';

const MoreExperiences = ({ currentCity, currentId }) => {
  const navigate = useNavigate();
  const more = experienceData.filter(e => e.id !== currentId);

  if (more.length === 0) return null;

  return (
    <div className="w-full max-w-[1120px] mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">More experiences</h2>
        <div className="flex gap-2">
            <button className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center dark:text-white hover:border-gray-500 hover:shadow-md transition">
                <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center dark:text-white hover:border-gray-500 hover:shadow-md transition">
                <ChevronRight size={16} />
            </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x">
        {more.map((exp) => (
          <div 
            key={exp.id} 
            className="min-w-[200px] md:min-w-[250px] cursor-pointer snap-start"
            onClick={() => {
                navigate(`/experience/${exp.id}`);
                window.scrollTo(0, 0);
            }}
          >
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 relative">
              <img src={exp.images[0]} alt={exp.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
            </div>
            <div className="flex items-center gap-1 mb-1">
                <Star size={12} fill="currentColor" className="dark:text-white" />
                <span className="text-sm font-semibold dark:text-white">{exp.rating}</span>
                <span className="text-sm text-gray-500">({exp.reviewCount})</span>
            </div>
            <h3 className="text-[15px] dark:text-white font-medium line-clamp-2 leading-tight mb-1">{exp.title}</h3>
            <p className="text-[15px] dark:text-gray-300 font-semibold">From ₹{exp.pricePerGuest} <span className="font-normal text-gray-500">/ person</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoreExperiences;
