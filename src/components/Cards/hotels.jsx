import React from "react";
import Card from "../ui/card";

function Cards() {
  return (
    <div className="w-full px-6 py-8">
      {/* Header */}
      <div className="mb-6">
      </div>
      
      <Card />
      
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