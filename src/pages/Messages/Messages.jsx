import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { socket, connectSocket } from '../../lib/socket';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5001';

// ─── Helpers ────────────────────────────────────────────────────────────────
/**
 * Build a stable conversation ID from two user IDs (order-independent).
 * Format: "dm_{smallerId}_{largerId}"
 */
function buildConvoId(userA, userB) {
  const ids = [String(userA), String(userB)].sort();
  return `dm_${ids[0]}_${ids[1]}`;
}

function getOtherUserId(convoId, currentUserId) {
  const parts = convoId.split('_');
  // dm_id1_id2
  if (parts[0] === 'dm') {
    return parts[1] === currentUserId ? parts[2] : parts[1];
  }
  // legacy: hotelId_guestId_hostId
  if (parts.length >= 3) {
    return parts[1] === currentUserId ? parts[2] : parts[1];
  }
  return null;
}

// ─── Timestamp ──────────────────────────────────────────────────────────────
function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Messages Component ──────────────────────────────────────────────────────
const Messages = () => {
  const { user, getToken } = useAuth();
  
  let tempId = user?.id || user?._id;
  if (!tempId && localStorage.getItem('token')) {
    try { tempId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).userId; } catch(e) {}
  }
  const currentUserId = String(tempId || '');
  const token = getToken?.() || localStorage.getItem('token') || '';

  const [threads, setThreads] = useState([]);      // [{conversationId, lastMsg, otherUser}]
  const [allMessages, setAllMessages] = useState({}); // {convoId: [msgs]}
  const [userMap, setUserMap] = useState({});
  const [activeConvo, setActiveConvo] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── 1. Fetch all messages for this user on mount ─────────────────────────
  const loadMessages = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await axios.get(`${API}/api/messages/${currentUserId}`);
      const msgs = res.data.messages || [];
      const map = res.data.userMap || {};
      setUserMap(map);

      // Group by conversationId
      const grouped = {};
      msgs.forEach(m => {
        if (!grouped[m.conversationId]) grouped[m.conversationId] = [];
        grouped[m.conversationId].push(m);
      });
      setAllMessages(grouped);

      // Build thread list (one per conversation, sorted by latest msg)
      const threadList = Object.entries(grouped).map(([convoId, msgs]) => {
        const sorted = [...msgs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const last = sorted[0];
        const otherId = getOtherUserId(convoId, currentUserId);
        return { conversationId: convoId, lastMsg: last, otherUserId: otherId };
      }).sort((a, b) => new Date(b.lastMsg.timestamp) - new Date(a.lastMsg.timestamp));

      setThreads(threadList);
    } catch (err) {
      console.error('Failed to load messages:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // ── 2. Handle URL query params (coming from "Chat with Host" button) ──────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hostId = params.get('hostId');
    if (hostId && hostId !== currentUserId) {
      const convoId = buildConvoId(currentUserId, hostId);
      setActiveConvo(convoId);
      // Load the other user's info if not in map
      if (!userMap[hostId]) {
        axios.get(`${API}/api/users/${hostId}`).then(res => {
          if (res.data) setUserMap(prev => ({ ...prev, [hostId]: res.data }));
        }).catch(() => {});
      }
    }
  }, [currentUserId]);

  // ── 3. Socket.io setup ───────────────────────────────────────────────────
  useEffect(() => {
    // Connect with JWT so the server middleware can authenticate us
    connectSocket(token);

    const handleReceiveMessage = (newMsg) => {
      const convoId = newMsg.conversationId;
      setAllMessages(prev => {
        const existing = prev[convoId] || [];
        // Deduplicate: if a temp message with same content+sender exists, replace it
        const hasDuplicate = existing.some(
          m => m.message === newMsg.message &&
               String(m.senderId) === String(newMsg.senderId) &&
               Math.abs(new Date(m.timestamp) - new Date(newMsg.timestamp)) < 10000
        );
        const filtered = hasDuplicate
          ? existing.filter(m => !(
              m.message === newMsg.message &&
              String(m.senderId) === String(newMsg.senderId) &&
              Math.abs(new Date(m.timestamp) - new Date(newMsg.timestamp)) < 10000
            ))
          : existing;
        return { ...prev, [convoId]: [...filtered, newMsg] };
      });
      setThreads(prev => {
        const existing = prev.find(t => t.conversationId === convoId);
        const otherId = getOtherUserId(convoId, currentUserId);
        if (existing) {
          return [
            { ...existing, lastMsg: newMsg },
            ...prev.filter(t => t.conversationId !== convoId)
          ];
        }
        return [{ conversationId: convoId, lastMsg: newMsg, otherUserId: otherId }, ...prev];
      });
    };

    // Join ALL existing conversation rooms when the socket connects/reconnects
    // This is critical — without this the host never receives messages in rooms
    // they haven't actively clicked in this session.
    const joinAllRooms = () => {
      setThreads(prev => {
        prev.forEach(t => socket.emit('join_room', t.conversationId));
        return prev;
      });
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('connect', joinAllRooms);

    return () => {
      // Bug #10 fix: only remove our specific listeners — do NOT call disconnectSocket()
      // because socket is a module-level singleton shared across the app.
      // Disconnecting here would sever it for all components and cause missed messages on re-mount.
      socket.off('receive_message', handleReceiveMessage);
      socket.off('connect', joinAllRooms);
    };
  }, [currentUserId, token]); // eslint-disable-line

  // ── 4. Join socket room when active conversation changes ─────────────────
  useEffect(() => {
    if (activeConvo) {
      // Ensure we're connected with auth before joining room
      if (!socket.connected) connectSocket(token);
      socket.emit('join_room', activeConvo);
    }
    // Scroll to bottom
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [activeConvo, token]); // eslint-disable-line

  // ── 4b. Once threads load, join all existing rooms ───────────────────────
  useEffect(() => {
    if (threads.length === 0) return;
    if (!socket.connected) connectSocket(token);
    threads.forEach(t => socket.emit('join_room', t.conversationId));
  }, [threads.length]); // eslint-disable-line

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  // ── 5. Send message ──────────────────────────────────────────────────────
  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !activeConvo || !currentUserId) return;

    const otherId = getOtherUserId(activeConvo, currentUserId);
    if (!otherId) return;

    const messageData = {
      roomId: activeConvo,
      senderId: currentUserId,
      receiverId: otherId,
      message: text
    };

    socket.emit('send_message', messageData);

    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const activeMessages = (allMessages[activeConvo] || []).sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const activeName = (() => {
    if (!activeConvo) return '';
    const otherId = getOtherUserId(activeConvo, currentUserId);
    const u = userMap[otherId];
    return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'User';
  })();

  const activeAvatar = (() => {
    if (!activeConvo) return '';
    const otherId = getOtherUserId(activeConvo, currentUserId);
    return userMap[otherId]?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeName)}&background=random&size=80`;
  })();

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white dark:bg-gray-900 overflow-hidden">

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <div className={`
        ${activeConvo ? 'hidden md:flex' : 'flex'}
        w-full md:w-[360px] flex-col border-r border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-900 flex-shrink-0 h-full
      `}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-white">Messages</h1>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-1 p-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-20 px-6 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">No messages yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start a conversation by clicking "Chat with Host" on any listing.
              </p>
            </div>
          ) : (
            threads.map(thread => {
              const otherId = thread.otherUserId;
              const u = userMap[otherId] || {};
              const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User';
              const avatar = u.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=80`;
              const isActive = activeConvo === thread.conversationId;
              const isOwn = String(thread.lastMsg.senderId) === currentUserId;

              return (
                <button
                  key={thread.conversationId}
                  onClick={() => setActiveConvo(thread.conversationId)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors
                    ${isActive ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                  `}
                >
                  <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 bg-gray-200" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-[15px] text-gray-900 dark:text-gray-100 truncate">{name}</span>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatTime(thread.lastMsg.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {isOwn ? 'You: ' : ''}{thread.lastMsg.message}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <div className={`
        ${activeConvo ? 'flex' : 'hidden md:flex'}
        flex-1 flex-col h-full min-w-0
      `}>
        {activeConvo ? (
          <>
            {/* Conversation header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm z-10 flex-shrink-0">
              {/* Back button (mobile) */}
              <button
                className="md:hidden p-1 mr-1 text-gray-500 hover:text-gray-900"
                onClick={() => setActiveConvo(null)}
              >
                ←
              </button>
              <img src={activeAvatar} alt={activeName} className="w-10 h-10 rounded-full object-cover bg-gray-200 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{activeName}</h3>
                <p className="text-xs text-green-500 font-medium">Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-2 bg-gray-50 dark:bg-gray-800">
              {activeMessages.length === 0 && (
                <div className="m-auto text-center text-sm text-gray-400 dark:text-gray-500 py-12">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  Say hello! Start the conversation.
                </div>
              )}
              {activeMessages.map((msg, i) => {
                const isOwn = String(msg.senderId) === currentUserId;
                const showTime = i === 0 || 
                  new Date(msg.timestamp) - new Date(activeMessages[i-1]?.timestamp) > 5 * 60 * 1000;
                return (
                  <React.Fragment key={msg._id || i}>
                    {showTime && (
                      <div className="text-center text-xs text-gray-400 dark:text-gray-500 my-1">
                        {formatTime(msg.timestamp)}
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`
                        max-w-[70%] px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                        ${isOwn
                          ? 'bg-[#FF385C] text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-none'
                        }
                      `}>
                        {msg.message}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="flex-shrink-0 px-4 md:px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message... (Enter to send)"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-full outline-none focus:ring-2 focus:ring-[#FF385C]/40 transition-all text-[15px]"
                  autoFocus
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim()}
                  className="w-11 h-11 bg-[#FF385C] hover:bg-[#E31C5F] disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-full text-white flex items-center justify-center shrink-0 shadow-md active:scale-95"
                >
                  <Send className="w-4 h-4 ml-[-1px]" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="m-auto text-center px-6">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Messages</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">
              Select a conversation from the list, or click "Chat with Host" on any listing to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
