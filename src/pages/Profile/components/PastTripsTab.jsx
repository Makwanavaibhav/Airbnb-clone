import React from 'react';

const PastTripsTab = () => {
  return (
    <div className="flex-1 max-w-[800px]">
      <h2 className="text-[32px] font-semibold text-gray-900 dark:text-white mb-8">Past trips</h2>
      <div className="p-8 border border-gray-200 dark:border-gray-700 rounded-2xl text-center">
        <p className="text-gray-500">You don't have any past trips yet.</p>
      </div>
    </div>
  );
};

export default PastTripsTab;
