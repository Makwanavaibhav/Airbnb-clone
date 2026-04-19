import React from 'react';

const ExperiencePhotoGrid = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full max-w-[1120px] mx-auto px-6 h-[400px] md:h-[500px]">
      {/* Mobile view: Horizontal Scroll Snap */}
      <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory h-full w-full rounded-2xl">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Experience Image ${idx + 1}`}
            className="snap-center w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Desktop view: 2x2 Grid */}
      <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-[2px] h-[500px] rounded-2xl overflow-hidden">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-full h-full">
            <img src={img} alt={`Experience Image ${idx + 1}`} className="w-full h-full object-cover hover:brightness-90 transition" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperiencePhotoGrid;
