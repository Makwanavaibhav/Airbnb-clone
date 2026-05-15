import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AboutMeTab = () => {
  const { user, updateUser, getToken } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const initial = user?.firstName
    ? user.firstName[0].toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : '?';

  const name = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.email
    ? user.email.split('@')[0]
    : 'Guest';

  const role = user?.isHost ? 'Host' : 'Guest';
  const joinedYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : '';

  // Keep preview in sync if user changes from another tab
  useEffect(() => {
    setPhotoPreview(user?.profilePhoto || null);
  }, [user?.profilePhoto]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?._id) return;
      try {
        const res = await axios.get(`http://localhost:5001/api/reviews/user/${user._id}`);
        setReviews(res.data.reviews || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [user]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setPhotoError('Only JPG, PNG, or WEBP images are allowed.');
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be smaller than 5MB.');
      return;
    }

    setPhotoError(null);

    // Read as base64 for immediate preview
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setPhotoPreview(base64);

      // Upload to backend
      setUploadingPhoto(true);
      try {
        const res = await axios.patch(
          'http://localhost:5001/api/users/photo',
          { profilePhoto: base64 },
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        if (res.data.success) {
          updateUser({ profilePhoto: base64 });
        }
      } catch (err) {
        setPhotoError('Failed to save photo. Please try again.');
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 max-w-[800px]">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-[32px] font-semibold text-gray-900 dark:text-white">About me</h2>
        <button
          onClick={() => navigate('/account-settings')}
          className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-[14px] font-semibold hover:border-black dark:hover:border-white transition-colors"
        >
          Edit
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-16 mb-16">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 border border-transparent shadow-[0_6px_16px_rgba(0,0,0,0.12)] rounded-3xl p-8 flex flex-col items-center justify-center w-[300px]">
          {/* Avatar with upload button */}
          <div className="relative mb-4 group">
            <div className="w-24 h-24 rounded-full bg-[#222222] text-white flex items-center justify-center text-4xl overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="profile" className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>

            {/* Upload overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute inset-0 w-24 h-24 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Upload profile photo"
            >
              {uploadingPhoto ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5 text-white mb-0.5" />
                  <span className="text-white text-[10px] font-semibold">Change</span>
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {photoError && (
            <p className="text-red-500 text-xs text-center mb-2">{photoError}</p>
          )}

          <h3 className="text-2xl font-semibold mb-1 dark:text-white">{name}</h3>
          <p className="text-gray-500 font-light text-sm">{role}</p>
          {joinedYear && <p className="text-gray-500 font-light text-sm mt-1">Joined in {joinedYear}</p>}
        </div>

        {/* Complete your profile card */}
        <div className="flex-1 mt-4 lg:mt-6">
          <h3 className="text-[22px] font-semibold mb-2 text-gray-900 dark:text-white">Complete your profile</h3>
          <p className="text-[16px] text-gray-600 dark:text-gray-400 font-light mb-6 leading-relaxed">
            Your Airbnb profile is an important part of every reservation. Create yours to help other hosts and guests get to know you.
          </p>
          <button
            onClick={() => navigate('/account-settings')}
            className="bg-[#FF385C] hover:bg-[#D90B63] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Get started
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
        <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-6">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" style={{display:'block', fill:'none', stroke:'currentColor', strokeWidth:2, overflow:'visible'}}>
            <path d="M28 6H17V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h4v6l6-6h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" />
          </svg>
          <span className="text-[16px] font-semibold">Reviews I've written ({reviews.length})</span>
        </div>
        {loadingReviews ? (
          <p className="text-gray-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500">You haven't written any reviews yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => {
              // The backend enriches hotel reviews with a hotelId object
              const hotel = review.hotelId;
              const thumb = hotel?.images?.[0] || hotel?.image;
              const listingTitle = hotel?.title || (review.targetType !== 'hotel' ? `${review.targetType} booking` : 'Unknown stay');
              const stars = Math.round(review.rating || 0);

              return (
                <div
                  key={review._id}
                  className="border border-gray-200 dark:border-gray-700 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div
                      className={`flex gap-4 items-center mb-3 ${hotel ? 'cursor-pointer' : ''}`}
                      onClick={() => hotel && navigate(`/hotel/${hotel._id || review.targetId}`)}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        {thumb ? (
                          <img src={thumb} alt={listingTitle} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{listingTitle}</h4>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-base ${s <= stars ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>★</span>
                          ))}
                          <span className="text-xs text-gray-500 ml-1">{review.rating}/5</span>
                        </div>
                        <span className="text-xs text-gray-400 capitalize">{review.targetType}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm italic leading-relaxed">
                      "{review.comment || review.text}"
                    </p>
                  </div>
                  <p className="text-gray-400 text-xs mt-4">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutMeTab;
