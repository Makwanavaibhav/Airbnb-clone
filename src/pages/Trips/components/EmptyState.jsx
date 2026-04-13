import React from 'react';
import { useNavigate } from 'react-router-dom';

const EmptyState = ({ type }) => {
  const navigate = useNavigate();

  const states = {
    upcoming: {
      icon: "✈️",
      title: "No trips booked... yet!",
      subtitle: "Time to dust off your bags and start planning your next adventure",
      cta: {
        text: "Start exploring",
        action: () => navigate('/')
      }
    },
    completed: {
      icon: "📸",
      title: "No completed trips",
      subtitle: "Your past adventures will appear here"
    },
    cancelled: {
      icon: "❌",
      title: "No cancelled bookings",
      subtitle: "Cancelled reservations will show here"
    }
  };

  const current = states[type];

  return (
    <div className="empty-state flex flex-col items-center justify-center p-12 text-center">
      <div className="text-6xl mb-6">{current.icon}</div>
      <h2 className="text-2xl font-semibold mb-2">{current.title}</h2>
      <p className="text-gray-500 mb-6">{current.subtitle}</p>
      {current.cta && (
        <button 
          onClick={current.cta.action}
          className="px-6 py-3 bg-[#FF385C] text-white rounded-lg hover:bg-[#D70466] font-semibold transition-colors"
        >
          {current.cta.text}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
