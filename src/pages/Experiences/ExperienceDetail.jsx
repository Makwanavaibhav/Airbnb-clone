import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { experienceData } from './experienceData';
import ExperiencePhotoGrid from './components/ExperiencePhotoGrid';
import ExperienceBookingCard from './components/ExperienceBookingCard';
import ExperienceItinerary from './components/ExperienceItinerary';
import ExperienceReviews from './components/ExperienceReviews';
import ExperienceMeetingMap from './components/ExperienceMeetingMap';
import MoreExperiences from './components/MoreExperiences';
import { Share, Heart, Star, ChevronLeft } from 'lucide-react';

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5001/api/hotels/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error && data._id) {
          const adaptedExp = {
            id: data._id || data.id,
            title: data.title,
            description: data.description,
            rating: data.rating || 4.96,
            reviewCount: Math.floor(Math.random() * 50) + 10,
            city: (data.location || "").split(',')[0],
            category: "Experience",
            pricePerGuest: data.pricePerNight,
            freeCancellation: true,
            images: data.images?.length > 0 ? data.images : [data.image],
            host: {
              name: data.hostName || "Host",
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.hostName || "Host")}&background=random`,
              tagline: "Local Guide",
              about: data.description,
            },
            meetingPoint: {
              name: "Meeting Point",
              address: data.location,
              coordinates: [data.lat || 18.9220, data.lng || 72.8347]
            },
            itinerary: [
              { title: "Introduction", description: "Meet and greet.", image: data.images?.[0] || 'https://images.unsplash.com/photo-1544551763-92ab472cad5d?w=300' },
              { title: "The Experience", description: data.description?.substring(0, 50) + "...", image: data.images?.[1] || 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=300' }
            ],
            duration: "2 hours",
            guestRequirements: `Up to ${data.guests || 2} guests can attend.`,
            activityLevel: "Moderate",
            accessibility: "Varies",
          };
          setExperience(adaptedExp);
          window.scrollTo(0, 0);
        } else {
          fallbackToMock();
        }
      })
      .catch(err => {
        fallbackToMock();
      });

    function fallbackToMock() {
      const exp = experienceData.find((e) => e.id === id);
      if (exp) {
        setExperience(exp);
        window.scrollTo(0, 0);
      }
    }
  }, [id]);

  if (!experience) return <div className="p-20 text-center text-xl dark:text-white min-h-screen dark:bg-gray-950">Loading...</div>;

  return (
    <div className="relative font-sans bg-white dark:bg-gray-950 min-h-screen pb-32">
      <div className="w-full max-w-[1120px] mx-auto md:px-6 md:mt-8 mb-6 flex justify-between items-center px-4 pt-4 md:pt-0">
        <div className="md:hidden cursor-pointer" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} className="dark:text-white" />
        </div>
        <div className="hidden md:block"></div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition dark:text-white">
            <Share size={18} /> <span className="hidden md:inline">Share</span>
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition dark:text-white">
            <Heart size={18} /> <span className="hidden md:inline">Save</span>
          </button>
        </div>
      </div>

      <ExperiencePhotoGrid images={experience.images} />

      <div className="w-full max-w-[1120px] mx-auto px-6 mt-8 flex flex-col md:flex-row gap-12 relative">
        <div className="w-full md:w-2/3">
          {/* Title Section */}
          <div className="pb-8 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-[26px] md:text-3xl font-bold mb-4 dark:text-white">{experience.title}</h1>
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-300 font-medium text-sm md:text-base">
              <Star size={16} fill="currentColor" />
              <span>{experience.rating} · <span className="underline cursor-pointer">{experience.reviewCount} reviews</span></span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">{experience.city} · {experience.category}</span>
            </div>
          </div>

          {/* Host Info Bar */}
          <div className="py-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold dark:text-white mb-1">Hosted by {experience.host.name}</h2>
              <p className="text-gray-500 text-sm md:text-base">{experience.host.tagline}</p>
            </div>
            <img src={experience.host.avatar} alt={experience.host.name} className="w-14 h-14 rounded-full cursor-pointer ml-4 flex-shrink-0" />
          </div>

          {/* Itinerary */}
          <ExperienceItinerary itinerary={experience.itinerary} duration={experience.duration} />

          {/* About Host */}
          <div className="py-12 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">About your host</h2>
            <div className="flex flex-col md:flex-row gap-8">
               <div className="md:w-1/3 flex flex-col items-center">
                    <img src={experience.host.avatar} alt="host" className="w-24 h-24 rounded-full mb-4" />
                    <h3 className="font-bold text-center dark:text-white mb-2">{experience.host.name}</h3>
                    <button className="mt-4 border border-black dark:border-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition dark:text-white w-full max-w-[200px]">Contact Host</button>
                    <p className="text-xs text-gray-500 mt-4 text-center max-w-[200px]">To help protect your payment, never transfer money or communicate outside of the Airbnb website or app.</p>
               </div>
               <div className="md:w-2/3">
                    <p className="whitespace-pre-wrap dark:text-gray-300 text-base md:text-lg leading-relaxed">{experience.host.about}</p>
               </div>
            </div>
          </div>

          {/* Reviews Section */}
          <ExperienceReviews rating={experience.rating} count={experience.reviewCount} />

          {/* Meeting Point Map */}
          <ExperienceMeetingMap meetingPoint={experience.meetingPoint} />
          
          {/* Things to Know */}
          <div className="py-12 border-b border-gray-200 dark:border-gray-800">
             <h2 className="text-2xl font-bold mb-6 dark:text-white">Things to know</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 className="font-semibold dark:text-white mb-2">Guest requirements</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">{experience.guestRequirements}</p>
                </div>
                <div>
                    <h4 className="font-semibold dark:text-white mb-2">What to bring / Activity</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">{experience.activityLevel}</p>
                </div>
                <div>
                    <h4 className="font-semibold dark:text-white mb-2">Accessibility</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">{experience.accessibility}</p>
                </div>
             </div>
          </div>

        </div>

        {/* Right Column / Sticky Booking Card */}
        <div className="w-full md:w-1/3 relative">
          <ExperienceBookingCard experience={experience} />
        </div>
      </div>
      
      {/* More Experiences */}
      <MoreExperiences currentCity={experience.city} currentId={experience.id} />
    </div>
  );
};

export default ExperienceDetail;
