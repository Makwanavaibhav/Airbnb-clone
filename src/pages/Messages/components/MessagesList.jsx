import React from 'react';

const MessagesList = ({ messages }) => {
  return (
    <div className="w-full">
      {messages.map(msg => (
        <div key={msg.id} className="p-4 border-b border-gray-200">
          <p>{msg.text}</p>
        </div>
      ))}
    </div>
  );
};

export default MessagesList;
