import React from 'react';

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-32 px-4">
      <div className="mb-6 text-gray-800 dark:text-gray-200">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" style={{display:'block', fill:'none', stroke:'currentColor', strokeWidth:2, overflow:'visible'}}>
          <path d="M26 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4v5l5-5h11a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          <path d="M9 11h14" />
          <path d="M9 15h10" />
        </svg>
      </div>
      <h2 className="text-[20px] font-semibold text-gray-900 dark:text-gray-100 mb-2">You don't have any messages</h2>
      <p className="text-[#717171] text-[15px] font-light max-w-sm leading-relaxed">
        When you receive a new message, it will appear here.
      </p>
    </div>
  );
};

export default EmptyState;
