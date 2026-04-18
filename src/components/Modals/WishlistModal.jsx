import React, { useState } from 'react';
import { X } from 'lucide-react';

const WishlistModal = ({ isOpen, onClose, onSave, hotelInfo }) => {
  const [listName, setListName] = useState("My Trip");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 font-sans" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
        onClick={e => { e.preventDefault(); e.stopPropagation(); }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          </button>
          <h2 className="font-semibold text-gray-900 dark:text-white flex-1 text-center pr-9">Name this wishlist</h2>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            {hotelInfo?.image && (
              <img src={hotelInfo.image} alt="hotel preview" className="w-16 h-16 rounded-lg object-cover" />
            )}
            <div className="flex flex-col justify-center">
              <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{hotelInfo?.location || "Property"}</p>
              <p className="text-gray-500 text-sm line-clamp-1">{hotelInfo?.title}</p>
            </div>
          </div>
          
          <div className="relative border border-gray-400 dark:border-gray-600 rounded-lg p-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black dark:focus-within:border-white">
            <label className="text-xs text-gray-500 font-semibold uppercase absolute top-2">Name</label>
            <input 
               type="text" 
               value={listName} 
               onChange={e => setListName(e.target.value)}
               maxLength={50}
               className="w-full mt-4 bg-transparent outline-none text-gray-900 dark:text-white font-medium"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{listName.length}/50 characters maximum</p>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setListName(""); }}
            className="font-semibold underline text-gray-900 dark:text-white hover:text-gray-600 rounded-md py-2 px-3"
          >
            Clear
          </button>
          <button 
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await onSave(listName);
              onClose();
            }}
            disabled={!listName.trim()}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistModal;
