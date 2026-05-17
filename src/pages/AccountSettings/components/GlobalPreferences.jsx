import React, { useState } from 'react';
import axios from 'axios';

const GlobalPreferences = () => {
  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'INR - ₹',
    timezone: 'Asia/Kolkata'
  });

  const handleUpdate = async (field, value) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/preferences`, 
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setPreferences({...preferences, [field]: value});
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Global preferences</h2>
      
      <div className="py-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">Preferred language</h3>
          <p className="text-gray-500 mt-1">{preferences.language}</p>
        </div>
        <select 
          className="p-2 border rounded-lg bg-white"
          value={preferences.language}
          onChange={(e) => handleUpdate('language', e.target.value)}
        >
          <option>English</option>
          <option>Hindi</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>

      <div className="py-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">Currency</h3>
          <p className="text-gray-500 mt-1">{preferences.currency}</p>
        </div>
        <select 
          className="p-2 border rounded-lg bg-white"
          value={preferences.currency}
          onChange={(e) => handleUpdate('currency', e.target.value)}
        >
          <option value="INR - ₹">INR - ₹</option>
          <option value="USD - $">USD - $</option>
          <option value="EUR - €">EUR - €</option>
          <option value="GBP - £">GBP - £</option>
        </select>
      </div>

      <div className="py-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">Timezone</h3>
          <p className="text-gray-500 mt-1">{preferences.timezone} (GMT+5:30)</p>
        </div>
        <select 
          className="p-2 border rounded-lg bg-white"
          value={preferences.timezone}
          onChange={(e) => handleUpdate('timezone', e.target.value)}
        >
          <option value="Asia/Kolkata">Asia/Kolkata</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
        </select>
      </div>
    </div>
  );
};

export default GlobalPreferences;
