import React from "react";
import Card from "../ui/card";

function Cards() {
  return (
    <div className="w-full px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-2xl font-bold text-gray-900">Popular homes in Udaipur &gt;</p>
        <p className="text-gray-600 mt-1">Stay near Baga Beach</p>
      </div>
      
      {/* Card component handles the horizontal layout */}
      <Card />
      
      {/* Custom scrollbar styling */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
          scroll-behavior: smooth;
          padding: 10px 5px;
          margin: -10px -5px;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Cards;