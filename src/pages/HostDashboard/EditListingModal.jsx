import React, { useState } from 'react';
import axios from 'axios';
import { X, Plus, Trash2 } from 'lucide-react';

const EditListingModal = ({ property, onClose, getToken, onSuccess }) => {
  const [formData, setFormData] = useState({ ...property });
  const [newImage, setNewImage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };
      const res = await axios.put(`http://localhost:5001/api/hotels/${property._id || property.id}`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.data.success) {
        onSuccess();
      }
    } catch (err) {
      alert("Failed to update listing.");
    }
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), newImage.trim()]
      }));
      setNewImage("");
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-0 flex flex-col relative shadow-xl max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-2xl font-semibold">Edit Listing Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* COLUMN 1: Basic Details & Location */}
            <div className="space-y-6 flex flex-col">
              <section>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Listing Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                    <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows={3} value={formData.description || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Summary</label>
                    <textarea name="summary" rows={2} value={formData.summary || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none resize-none" placeholder="Brief summary of the place"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Property Type</label>
                      <input type="text" name="propertyType" value={formData.propertyType || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" placeholder="e.g. Apartment, House, Experience" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Room Type</label>
                      <input type="text" name="roomType" value={formData.roomType || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" placeholder="Entire home, Private room" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Amenities (comma separated)</label>
                    <input type="text" name="amenitiesStr" value={Array.isArray(formData.amenities) ? formData.amenities.join(", ") : formData.amenities || ''} onChange={(e) => setFormData({...formData, amenities: e.target.value.split(',').map(s=>s.trim())})} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" placeholder="Wifi, Pool, Kitchen..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">House Rules</label>
                    <textarea name="houseRules" rows={2} value={formData.houseRules || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none resize-none" placeholder="No smoking, no pets..."/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Check-in Time</label>
                      <input type="time" name="checkInTime" value={formData.checkInTime || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Check-out Time</label>
                      <input type="time" name="checkOutTime" value={formData.checkOutTime || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Max Guests</label>
                    <input type="number" name="guests" value={formData.guests || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Location</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Exact Address</label>
                    <input type="text" name="exactAddress" value={formData.exactAddress || formData.location || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Neighborhood Description</label>
                    <textarea name="neighborhoodDesc" rows={2} value={formData.neighborhoodDesc || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none resize-none" />
                  </div>
                </div>
              </section>
              
              {/* Photo Management */}
              <section>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Photos</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {(formData.images || [formData.image]).filter(Boolean).map((img, idx) => (
                      <div key={idx} className="relative aspect-square group">
                        <img src={img} alt="listing" className="w-full h-full object-cover rounded-lg border" />
                        <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white hover:bg-red-50 p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 text-sm">
                    <input type="url" value={newImage} onChange={e => setNewImage(e.target.value)} placeholder="Add image URL..." className="flex-1 p-2 border rounded-lg outline-none" />
                    <button onClick={addImage} className="px-3 bg-gray-900 text-white rounded-lg hover:bg-black font-semibold flex items-center justify-center">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* COLUMN 2: Pricing, Settings */}
            <div className="space-y-6 flex flex-col">
              <section>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Pricing & Availability</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Base Price /Night</label>
                      <input type="number" name="priceRaw" value={formData.priceRaw || formData.pricePerNight || ''} onChange={e => setFormData({...formData, priceRaw: e.target.value, pricePerNight: e.target.value})} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Weekend Price</label>
                      <input type="number" name="weekendPrice" value={formData.weekendPrice || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Security Deposit</label>
                      <input type="number" name="securityDeposit" value={formData.securityDeposit || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Discount %</label>
                      <input type="number" name="discountPercent" value={formData.discountPercent || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Seasonal/Special Dates Pricing rules</label>
                    <textarea name="seasonalPricing" rows={2} value={formData.seasonalPricing || ''} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none resize-none" placeholder="e.g. increase 20% in December" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Min Nights</label>
                      <input type="number" name="minNights" value={formData.minNights || 1} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Max Nights</label>
                      <input type="number" name="maxNights" value={formData.maxNights || 30} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none" />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Guest Requirements & Policies</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                    <input type="checkbox" name="instantBook" checked={formData.instantBook || false} onChange={handleChange} className="w-4 h-4 cursor-pointer" id="instantBook" />
                    <label htmlFor="instantBook" className="font-semibold text-gray-800 cursor-pointer">Allow Instant Bookings without approval</label>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                    <input type="checkbox" name="requiresVerifiedId" checked={formData.requiresVerifiedId || false} onChange={handleChange} className="w-4 h-4 cursor-pointer" id="requiresVerifiedId" />
                    <label htmlFor="requiresVerifiedId" className="font-semibold text-gray-800 cursor-pointer">Require Verified ID</label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cancellation Policy</label>
                    <select name="cancellationPolicy" value={formData.cancellationPolicy || 'Flexible'} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none bg-white">
                      <option value="Flexible">Flexible - Full refund up to 1 day prior</option>
                      <option value="Moderate">Moderate - Full refund up to 5 days prior</option>
                      <option value="Strict">Strict - Partial refund up to 7 days prior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Advance notice required</label>
                    <select name="advanceNotice" value={formData.advanceNotice || 'Same day'} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none bg-white">
                      <option value="Same day">Same day</option>
                      <option value="1 day">1 day prior</option>
                      <option value="2 days">2 days prior</option>
                      <option value="7 days">7 days prior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Preparation time between bookings</label>
                    <select name="prepTime" value={formData.prepTime || 'None'} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:border-black outline-none bg-white">
                      <option value="None">None</option>
                      <option value="1 night">Block 1 night between bookings</option>
                      <option value="2 nights">Block 2 nights between bookings</option>
                    </select>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl flex justify-end gap-4 sticky bottom-0">
          <button onClick={onClose} className="px-6 py-3 font-semibold rounded-lg hover:bg-gray-100 transition">
            Cancel
          </button>
          <button onClick={handleSave} className="px-8 py-3 bg-[#E01561] hover:bg-[#D70466] text-white font-semibold rounded-lg transition">
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditListingModal;
