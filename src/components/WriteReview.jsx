import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

/**
 * WriteReview – interactive review form.
 * Props: { targetId, targetType, onReviewPosted }
 */
export default function WriteReview({ targetId, targetType, onReviewPosted }) {
  const { isLoggedIn } = useAuth();
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]       = useState(null);
  const [inlineError, setInlineError] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    setInlineError(null);
    if (rating === 0) {
      setInlineError('Please select a star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      setInlineError('Review must be at least 10 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetId, targetType, rating, comment: comment.trim() }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setInlineError("You've already reviewed this listing.");
        return;
      }
      if (res.status === 403) {
        setInlineError("You can't review your own listing.");
        return;
      }
      if (!res.ok) {
        setInlineError(data.message || 'Failed to post review.');
        return;
      }

      showToast('Review posted! 🎉');
      setRating(0);
      setComment('');
      if (onReviewPosted) onReviewPosted();
    } catch (err) {
      setInlineError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="py-6">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          <Link to="/login" className="underline font-semibold text-gray-900 dark:text-white">
            Log in
          </Link>{' '}
          to write a review.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 border-b border-gray-200 dark:border-gray-800 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-2xl shadow-xl font-semibold text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.msg}
        </div>
      )}

      <h3 className="text-xl font-bold dark:text-white mb-5">Write a review</h3>

      {/* Star selector */}
      <div className="flex items-center gap-1 mb-4">
        {[1,2,3,4,5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(s)}
            className="focus:outline-none"
            aria-label={`Rate ${s} star${s > 1 ? 's' : ''}`}
          >
            <Star
              size={28}
              fill={(hovered || rating) >= s ? '#f59e0b' : 'none'}
              className={(hovered || rating) >= s ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600'}
              strokeWidth={1.5}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][rating]}
          </span>
        )}
      </div>

      {/* Textarea */}
      <div className="relative mb-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, 1000))}
          placeholder="Share your experience (min 10 characters)..."
          rows={4}
          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-400 transition"
        />
        <div className="absolute bottom-3 right-4 text-xs text-gray-400 select-none">
          {comment.length}/1000
        </div>
      </div>

      {/* Inline error */}
      {inlineError && (
        <p className="text-red-500 text-sm mb-3">{inlineError}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Post Review'}
      </button>
    </div>
  );
}
