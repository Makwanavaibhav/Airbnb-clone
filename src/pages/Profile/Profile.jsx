import React, { useState } from 'react';
import ProfileSidebar from './components/ProfileSidebar';
import AboutMeTab from './components/AboutMeTab';
import PastTripsTab from './components/PastTripsTab';
import ConnectionsTab from './components/ConnectionsTab';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col md:flex-row">
      <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'about' && <AboutMeTab />}
      {activeTab === 'trips' && <PastTripsTab />}
      {activeTab === 'connections' && <ConnectionsTab />}
    </div>
  );
};

export default Profile;
