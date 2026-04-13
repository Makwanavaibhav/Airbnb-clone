import React, { useState } from 'react';
import MessagesList from './components/MessagesList';
import EmptyState from './components/EmptyState';
import { Search, Settings } from 'lucide-react';

const Messages = () => {
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState([]); // Empty array initially

  return (
    <div className="flex">
      {/* Left Sidebar (Thread List) */}
      <div className="w-full md:w-[350px] border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-80px)] flex flex-col">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[32px] font-semibold text-gray-900 dark:text-white">Messages</h1>
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-full text-[14px] font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-1.5 rounded-full text-[14px] font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-gray-300'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {messages.length > 0 ? (
            <MessagesList messages={messages} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      
      {/* Right Content Area (Message Thread view) - Hidden on mobile when just listing */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900/50">
         {/* Placeholder for future thread view */}
      </div>
    </div>
  );
};

export default Messages;
