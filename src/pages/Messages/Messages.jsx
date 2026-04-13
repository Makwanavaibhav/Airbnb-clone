import React, { useState, useEffect } from 'react';
import MessagesList from './components/MessagesList';
import EmptyState from './components/EmptyState';
import { Search, Settings, Send } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

let socket;

const Messages = () => {
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [inputText, setInputText] = useState('');
  
  // Real implementaton uses AuthContext/localStorage config
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id; 

  useEffect(() => {
    socket = io('http://localhost:5001');

    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const selectConversation = (convoId) => {
    setCurrentConversation(convoId);
    socket.emit('join_conversation', convoId);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentConversation) return;

    socket.emit('send_message', {
      conversationId: currentConversation,
      senderId: currentUserId,
      receiverId: 'recipient_id_placeholder', // Requires proper recipient logic in full app
      message: inputText
    });

    setInputText('');
  };

  return (
    <div className="flex h-screen bg-white">
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
            <MessagesList messages={messages} onSelect={selectConversation} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      
      {/* Right Content Area (Message Thread view) */}
      <div className="hidden md:flex flex-1 flex-col bg-gray-50 dark:bg-gray-900 relative">
        {currentConversation ? (
          <>
            <div className="p-6 border-b bg-white font-semibold">Active Conversation</div>
            <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden flex flex-col gap-3 pb-24">
              {messages.filter(m => m.conversationId === currentConversation).map((msg, i) => (
                <div key={i} className={`p-4 rounded-xl max-w-[80%] ${
                  msg.senderId === currentUserId 
                    ? 'bg-blue-600 text-white self-end rounded-br-none' 
                    : 'bg-gray-200 text-gray-900 self-start rounded-bl-none'
                }`}>
                  {msg.message}
                </div>
              ))}
            </div>
            {/* Input form */}
            <form onSubmit={sendMessage} className="absolute bottom-0 w-full p-4 bg-white border-t flex gap-3">
              <input 
                type="text" 
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 p-3 border rounded-full outline-none focus:border-black"
              />
              <button type="submit" className="w-12 h-12 bg-[#FF385C] rounded-full text-white flex items-center justify-center">
                <Send className="w-5 h-5"/>
              </button>
            </form>
          </>
        ) : (
          <div className="m-auto text-center">
            <h2 className="text-xl font-medium">Select a conversation</h2>
            <p className="text-gray-500">Pick an active thread to continue messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
