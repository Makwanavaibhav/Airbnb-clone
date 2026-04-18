import React, { useState, useEffect } from 'react';
import MessagesList from './components/MessagesList';
import EmptyState from './components/EmptyState';
import { Search, Settings, Send } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';

import { useAuth } from '../../context/AuthContext';

let socket;

const Messages = () => {
  const { user } = useAuth();
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;
  
  const [filter, setFilter] = useState('all');
  const [messages, setMessages] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [currentConversation, setCurrentConversation] = useState(null);
  const [inputText, setInputText] = useState('');

  // Fetch messages from backend
  useEffect(() => {
    if (!currentUserId) return;
    axios.get(`http://localhost:5001/api/messages/${currentUserId}`)
      .then(res => {
        setMessages(res.data.messages);
        setUserMap(res.data.userMap);
      })
      .catch(err => console.error("Could not fetch messages", err));
  }, [currentUserId]);

  // Capture hostId from URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hostId = params.get('hostId');
    const hotelId = params.get('hotelId') || 'general';
    
    if (hostId && hostId !== currentUserId) {
       const newThreadId = `${hotelId}_${currentUserId}_${hostId}`;
       setCurrentConversation(newThreadId);
    }
  }, [currentUserId]);

  useEffect(() => {
    socket = io('http://localhost:5001');
    if (currentConversation) {
      socket.emit('join_conversation', currentConversation);
    }
    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentConversation]);

  const selectConversation = (convoId) => {
    setCurrentConversation(convoId);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !currentConversation || !currentUserId) return;

    let receiverId = 'placeholder';
    const parts = currentConversation.split('_');
    if (parts.length >= 3) {
      // convention: hotelId_guestId_hostId
      receiverId = parts[1] === currentUserId ? parts[2] : parts[1];
    } else {
      const threadMsg = messages.find(m => m.conversationId === currentConversation);
      if (threadMsg) {
         receiverId = threadMsg.senderId === currentUserId ? threadMsg.receiverId : threadMsg.senderId;
      }
    }

    socket.emit('send_message', {
      conversationId: currentConversation,
      senderId: currentUserId,
      receiverId: receiverId,
      message: inputText
    });

    setInputText('');
  };

  // Group messages for MessagesList
  const threads = Object.values(messages.reduce((acc, msg) => {
    if (!acc[msg.conversationId]) acc[msg.conversationId] = msg;
    else if (new Date(msg.timestamp) > new Date(acc[msg.conversationId].timestamp)) {
      acc[msg.conversationId] = msg;
    }
    return acc;
  }, {}));

  // Force rendering of pending conversation if there's no message yet
  if (currentConversation && !threads.find(t => t.conversationId === currentConversation)) {
    const parts = currentConversation.split('_');
    if (parts.length >= 3) {
      threads.unshift({
        conversationId: currentConversation,
        senderId: currentUserId,
        receiverId: parts[1] === currentUserId ? parts[2] : parts[1],
        message: 'Start a conversation...',
        timestamp: new Date()
      });
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white">
      {/* Left Sidebar (Thread List) */}
      <div className="w-full md:w-[350px] border-r border-gray-200 dark:border-gray-800 flex flex-col h-full bg-white dark:bg-gray-900">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[32px] font-semibold text-gray-900 dark:text-white">Messages</h1>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {threads.length > 0 ? (
            <MessagesList 
              threads={threads} 
              currentUserId={currentUserId}
              userMap={userMap}
              currentConversation={currentConversation}
              onSelect={selectConversation} 
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      
      {/* Right Content Area (Message Thread view) */}
      <div className="hidden md:flex flex-1 flex-col bg-gray-50 dark:bg-gray-800 relative h-full">
        {currentConversation ? (
          <>
            {(() => {
              const parts = currentConversation.split('_');
              let otherUserId = parts[1] === currentUserId ? parts[2] : parts[1];
              const otherUser = userMap[otherUserId] || { firstName: 'User' };
              return (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 font-semibold dark:text-white flex items-center gap-3 shadow-sm z-10">
                  <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden shrink-0">
                    <img src={otherUser.image || 'https://a0.muscache.com/im/pictures/user/User-83344331-50e5-4f38-bc06-2d3fb84cdbd7.jpg'} alt="" className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white">{otherUser.firstName}</h3>
                  </div>
                </div>
              );
            })()}
            <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden flex flex-col gap-3 pb-24">
              {messages.filter(m => m.conversationId === currentConversation).map((msg, i) => (
                <div key={i} className={`p-4 rounded-2xl max-w-[75%] shadow-sm ${
                  msg.senderId === currentUserId 
                    ? 'bg-[#FF385C] text-white self-end rounded-br-sm' 
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white self-start rounded-bl-sm border dark:border-none'
                }`}>
                  {msg.message}
                </div>
              ))}
            </div>
            {/* Input form */}
            <form onSubmit={sendMessage} className="absolute bottom-0 w-full p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <input 
                type="text" 
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-full outline-none focus:ring-2 focus:ring-gray-300 transition-all border-none"
              />
              <button type="submit" className="w-12 h-12 bg-[#FF385C] hover:bg-[#E31C5F] transition-colors rounded-full text-white flex items-center justify-center shrink-0 shadow-md">
                <Send className="w-5 h-5 ml-[-2px]"/>
              </button>
            </form>
          </>
        ) : (
          <div className="m-auto text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
               <Send className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white">Your Messages</h2>
            <p className="text-gray-500 mt-1">Select a conversation to start reading or sending messages.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
