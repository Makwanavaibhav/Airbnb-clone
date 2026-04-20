import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Star } from 'lucide-react';

/**
 * ReviewsList – fetches and displays reviews for any listing.
 * Props: { targetId, targetType }
 * Ref methods: { refetch() }
 */
const ReviewsList = forwardRef(function ReviewsList({ targetId, targetType }, ref) {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchReviews = useCallback(async () => {
    if (!targetId || !targetType) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5001/api/reviews/${targetType}/${targetId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Expose refetch to parent via ref
  useImperativeHandle(ref, () => ({ refetch: fetchReviews }), [fetchReviews]);

  // Compute average rating from actual reviews
  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2)
    : null;

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="py-8 border-b border-gray-200 dark:border-gray-800 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 border-b border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        {avgRating && (
          <Star size={22} fill="currentColor" className="text-gray-900 dark:text-white" />
        )}
        <h2 className="text-2xl font-bold dark:text-white">
          {avgRating
            ? `${avgRating} · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
            : `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
        </h2>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {reviews.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {reviews.map((review) => {
            const firstName = review.userId?.firstName || 'Guest';
            const lastName  = review.userId?.lastName  || '';
            const initial   = firstName.charAt(0).toUpperCase();

            return (
              <div key={review._id} className="flex flex-col">
                {/* Author row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 dark:bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-white dark:text-gray-900 font-semibold text-sm">{initial}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm dark:text-white">{firstName} {lastName}</div>
                    <div className="text-gray-400 text-xs">{formatDate(review.createdAt)}</div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-2">
                  {[1,2,3,4,5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      fill={review.rating >= s ? '#f59e0b' : 'none'}
                      className={review.rating >= s ? 'text-amber-500' : 'text-gray-300'}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {review.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default ReviewsList;
