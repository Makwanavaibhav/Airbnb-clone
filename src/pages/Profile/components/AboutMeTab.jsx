import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const AboutMeTab = () => {
  const { user } = useAuth();
  
  const initial = user?.firstName ? user.firstName[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'V');
  const name = user?.firstName ? `${user.firstName}` : 'Vaibhav';

  return (
    <div className="flex-1 max-w-[800px]">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-[32px] font-semibold text-gray-900 dark:text-white">About me</h2>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-[14px] font-semibold hover:border-black dark:hover:border-white transition-colors">
          Edit
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 mb-16">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 border border-transparent shadow-[0_6px_16px_rgba(0,0,0,0.12)] rounded-3xl p-8 flex flex-col items-center justify-center w-[300px]">
          <div className="w-24 h-24 rounded-full bg-[#222222] text-white flex items-center justify-center text-4xl mb-4">
            {initial}
          </div>
          <h3 className="text-2xl font-semibold mb-1">{name}</h3>
          <p className="text-gray-500 font-light text-sm">Guest</p>
        </div>

        {/* Complete your profile card */}
        <div className="flex-1 mt-4 lg:mt-6">
          <h3 className="text-[22px] font-semibold mb-2 text-gray-900 dark:text-white">Complete your profile</h3>
          <p className="text-[16px] text-gray-600 dark:text-gray-400 font-light mb-6 leading-relaxed">
            Your Airbnb profile is an important part of every reservation. Create yours to help other hosts and guests get to know you.
          </p>
          <button className="bg-[#FF385C] hover:bg-[#D90B63] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Get started
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" style={{display:'block', fill:'none', stroke:'currentColor', strokeWidth:2, overflow:'visible'}}>
            <path d="M28 6H17V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h4v6l6-6h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" />
          </svg>
          <span className="text-[16px] font-semibold">Reviews I've written</span>
        </div>
      </div>
    </div>
  );
};

export default AboutMeTab;
