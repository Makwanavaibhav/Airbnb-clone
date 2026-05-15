import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const ProfileSidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const initial = user?.firstName
    ? user.firstName[0].toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : '?';

  const tabs = [
    { id: 'about', label: 'About me', isAvatar: true },
    { id: 'trips', label: 'Past trips', icon: '💼' },
    { id: 'connections', label: 'Connections', icon: '👥' },
  ];

  return (
    <div className="w-full md:w-[320px] shrink-0 mb-8 md:mb-0 pr-0 md:pr-12">
      <h1 className="text-[32px] font-semibold text-gray-900 dark:text-white mb-6 pl-4">Profile</h1>
      <nav className="flex flex-col gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-semibold text-[15px] ${
              activeTab === tab.id
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs overflow-hidden ${activeTab === tab.id ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {tab.isAvatar ? (
                user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className={activeTab === tab.id ? 'text-white dark:text-black' : 'text-gray-700 dark:text-gray-300'}>
                    {initial}
                  </span>
                )
              ) : (
                tab.icon
              )}
            </div>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileSidebar;
