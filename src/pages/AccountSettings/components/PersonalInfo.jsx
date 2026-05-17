import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const PersonalInfo = () => {
  const { getToken, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: ''
  });
  const [editing, setEditing] = useState(null);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.user) {
          const u = res.data.user;
          setFormData(prev => ({
            ...prev,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            phoneNumber: u.phoneNumber || '',
            dateOfBirth: u.dateOfBirth?.split('T')[0] || '',
            address: u.address || ''
          }));
        }
      } catch {
        // Fallback to local storage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.email) {
          setFormData(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || ''
          }));
        }
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const token = getToken();
      const res = await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/profile`, 
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      if (res.data.success) {
        const updatedUser = res.data.user;
        // Sync AuthContext so navbar & profile photo update instantly
        updateUser(updatedUser);
      }
      setEditing(null);
      setSaveMsg('Saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (error) {
      console.error(error);
      setSaveMsg('Update failed. Please try again.');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6">Personal info</h2>
      {saveMsg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          saveMsg.includes('failed') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>{saveMsg}</div>
      )}
      {/* Legal name */}
      <div className="py-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Legal name</h3>
            {editing === 'name' ? (
              <div className="mt-4 flex flex-col gap-4 max-w-sm">
                <input 
                  className="p-3 border rounded-lg"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="First name"
                />
                <input 
                  className="p-3 border rounded-lg"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Last name"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleSave()} className="px-6 py-2 bg-black text-white rounded-lg font-medium">Save</button>
                  <button onClick={() => setEditing(null)} className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mt-1">{formData.firstName} {formData.lastName}</p>
            )}
          </div>
          {editing !== 'name' && (
            <button onClick={() => setEditing('name')} className="font-semibold underline">Edit</button>
          )}
        </div>
      </div>

      {/* Email address */}
      <div className="py-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Email address</h3>
            <p className="text-gray-500 mt-1">{formData.email}</p>
          </div>
        </div>
      </div>

      {/* Phone number */}
      <div className="py-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Phone number</h3>
            {editing === 'phone' ? (
              <div className="mt-4 flex flex-col gap-4 max-w-sm">
                <input 
                  className="p-3 border rounded-lg"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="Add your phone number"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleSave()} className="px-6 py-2 bg-black text-white rounded-lg font-medium">Save</button>
                  <button onClick={() => setEditing(null)} className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mt-1">{formData.phoneNumber || 'Add your phone number'}</p>
            )}
          </div>
          {editing !== 'phone' && (
            <button onClick={() => setEditing('phone')} className="font-semibold underline">Edit</button>
          )}
        </div>
      </div>

      {/* Date of birth */}
      <div className="py-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Date of birth</h3>
            {editing === 'dob' ? (
              <div className="mt-4 flex flex-col gap-4 max-w-sm">
                <input 
                  type="date"
                  className="p-3 border rounded-lg"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
                <div className="flex gap-2">
                  <button onClick={() => handleSave()} className="px-6 py-2 bg-black text-white rounded-lg font-medium">Save</button>
                  <button onClick={() => setEditing(null)} className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mt-1">{formData.dateOfBirth || 'Add your birthday'}</p>
            )}
          </div>
          {editing !== 'dob' && (
            <button onClick={() => setEditing('dob')} className="font-semibold underline">Edit</button>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="py-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Address</h3>
            {editing === 'address' ? (
              <div className="mt-4 flex flex-col gap-4 max-w-sm">
                <input 
                  className="p-3 border rounded-lg"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Add your address"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleSave('address')} className="px-6 py-2 bg-black text-white rounded-lg font-medium">Save</button>
                  <button onClick={() => setEditing(null)} className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mt-1">{formData.address || 'Add your address'}</p>
            )}
          </div>
          {editing !== 'address' && (
            <button onClick={() => setEditing('address')} className="font-semibold underline">Edit</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
