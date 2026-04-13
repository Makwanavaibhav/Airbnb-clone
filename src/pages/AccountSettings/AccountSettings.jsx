import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PersonalInfo from './components/PersonalInfo';
import LoginSecurity from './components/LoginSecurity';
import GlobalPreferences from './components/GlobalPreferences';

const AccountSettings = () => {
  const [activeSection, setActiveSection] = useState('personal-info');
  const navigate = useNavigate();

  // Basic auth check
  React.useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  const renderContent = () => {
    switch(activeSection) {
      case 'personal-info':
        return <PersonalInfo />;
      case 'login-security':
        return <LoginSecurity />;
      case 'preferences':
        return <GlobalPreferences />;
      default:
        return <PersonalInfo />;
    }
  };

  const menuItems = [
    { id: 'personal-info', label: 'Personal info', icon: '👤' },
    { id: 'login-security', label: 'Login & security', icon: '🛡️' },
    { id: 'preferences', label: 'Global preferences', icon: '🌍' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
      <div className="w-full md:w-1/4">
        <h1 className="text-3xl font-semibold mb-8">Account</h1>
        <nav className="flex flex-col gap-2">
          {menuItems.map(item => (
            <button 
              key={item.id}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === item.id 
                  ? 'bg-gray-100 font-semibold text-black' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default AccountSettings;
