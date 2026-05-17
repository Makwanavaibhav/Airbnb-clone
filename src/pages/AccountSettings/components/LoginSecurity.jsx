import React, { useState } from 'react';
import axios from 'axios';

const LoginSecurity = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/change-password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Login & security</h2>
      
      <div className="py-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-1">Password</h3>
        <p className="text-gray-500 text-sm mb-6">Last updated: Never</p>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 max-w-sm">
          <input 
            type="password"
            className="p-3 border rounded-lg"
            placeholder="Current password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            required
          />
          <input 
            type="password"
            className="p-3 border rounded-lg"
            placeholder="New password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            required
            minLength="8"
          />
          <input 
            type="password"
            className="p-3 border rounded-lg"
            placeholder="Confirm new password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            required
          />
          <button type="submit" className="px-6 py-3 bg-[#FF385C] hover:bg-[#D70466] text-white rounded-lg font-semibold transition-colors mt-2">
            Update password
          </button>
        </form>
      </div>

      <div className="py-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">Two-factor authentication</h3>
          <p className="text-gray-500 text-sm mt-1">Add an extra layer of security to your account</p>
        </div>
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium transition-colors">Set up</button>
      </div>

      <div className="py-6 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-900">Active sessions</h3>
          <p className="text-gray-500 text-sm mt-1">Manage devices where you're currently logged in</p>
        </div>
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium transition-colors">View sessions</button>
      </div>
    </div>
  );
};

export default LoginSecurity;
