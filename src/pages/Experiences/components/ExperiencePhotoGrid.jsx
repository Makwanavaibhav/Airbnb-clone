import React from 'react';

const ExperiencePhotoGrid = ({ images }) => {
  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, 5);

  return (
    <div className="relative w-full max-w-[1120px] mx-auto px-4 md:px-6 h-[300px] md:h-[450px]">
      {/* Mobile view: Horizontal Scroll Snap */}
      <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory h-full w-full rounded-2xl gap-2">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Image ${idx + 1}`}
            className="snap-center w-full h-full object-cover flex-shrink-0 rounded-2xl"
          />
        ))}
      </div>

      {/* Desktop view: 5-Image Grid */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-full rounded-2xl overflow-hidden">
        {/* Main large image */}
        <div className={`relative w-full h-full ${displayImages.length === 1 ? 'col-span-4 row-span-2' : displayImages.length <= 3 ? 'col-span-2 row-span-2' : 'col-span-2 row-span-2'}`}>
          <img src={displayImages[0]} alt="Cover" className="w-full h-full object-cover hover:brightness-95 transition cursor-pointer" />
        </div>
        
        {/* Secondary images */}
        {displayImages.slice(1, 5).map((img, idx) => (
          <div key={idx + 1} className={`relative w-full h-full ${displayImages.length === 2 ? 'col-span-2 row-span-2' : displayImages.length === 3 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'}`}>
            <img src={img} alt={`Image ${idx + 2}`} className="w-full h-full object-cover hover:brightness-95 transition cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperiencePhotoGrid;
