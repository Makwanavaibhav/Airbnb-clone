import React from 'react';

const MessagesList = ({ threads, currentUserId, userMap, currentConversation, onSelect }) => {
  return (
    <div className="w-full flex-col">
      {threads.map(msg => {
        const parts = msg.conversationId.split('_');
        let otherUserId = 'unknown';
        if (parts.length >= 3) {
          otherUserId = parts[1] === currentUserId ? parts[2] : parts[1];
        } else {
          otherUserId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
        }

        const otherUser = userMap[otherUserId] || { firstName: 'User', lastName: '' };
        const isActive = currentConversation === msg.conversationId;

        return (
          <div 
            key={msg.conversationId} 
            onClick={() => onSelect(msg.conversationId)}
            className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors duration-200 flex items-center gap-4 ${
              isActive ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-200">
              <img 
                src={otherUser.image || 'https://a0.muscache.com/im/pictures/user/User-83344331-50e5-4f38-bc06-2d3fb84cdbd7.jpg'} 
                alt={otherUser.firstName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {otherUser.firstName} {otherUser.lastName}
                </h4>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {new Date(msg.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className={`text-sm truncate ${msg.read === false && msg.receiverId === currentUserId ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}`}>
                {msg.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesList;
