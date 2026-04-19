import React from 'react';

const ExperienceItinerary = ({ itinerary, duration }) => {
  return (
    <div className="py-12 border-b border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-2 dark:text-white">What you'll do</h2>
      <p className="text-gray-500 mb-8 font-medium">Total duration: {duration}</p>
      
      <div className="relative pl-6">
        {/* Continuous vertical line connecting all dots */}
        <div className="absolute left-[35px] top-4 bottom-0 w-[2px] bg-gray-200 dark:bg-gray-800 z-0"></div>

        <div className="flex flex-col gap-10">
          {itinerary.map((step, idx) => (
            <div key={idx} className="relative z-10 flex gap-6">
              {/* Dot */}
              <div className="absolute left-[5px] top-6 w-[12px] h-[12px] bg-gray-400 dark:bg-gray-600 border-2 border-white dark:border-gray-950 rounded-full z-10"></div>
              
              <img src={step.image} alt={step.title} className="w-20 h-20 rounded-lg object-cover bg-gray-100 flex-shrink-0 z-10 ml-6" />
              
              <div className="flex-1">
                <h3 className="font-bold text-lg dark:text-white mb-1">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceItinerary;
