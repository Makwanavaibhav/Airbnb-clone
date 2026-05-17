import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Star, XCircle, FileText, MessageSquare } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";

const API = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`;

const ICON_MAP = {
  listing_approved: { icon: Star, bg: "bg-green-100", color: "text-green-600" },
  listing_rejected: { icon: XCircle, bg: "bg-red-100", color: "text-red-600" },
  listing_submitted: { icon: FileText, bg: "bg-blue-100", color: "text-blue-600" },
  new_message: { icon: MessageSquare, bg: "bg-purple-100", color: "text-purple-600" },
  general: { icon: Bell, bg: "bg-gray-100", color: "text-gray-600" },
};

export default function NotificationBell() {
  const { getToken, isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef();

  const fetch = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await axios.get(`${API}/api/listings/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setNotifs(res.data.notifications || []);
      setUnread(res.data.unreadCount || 0);
    } catch {}
  };

  useEffect(() => { fetch(); }, [isLoggedIn]);
  useEffect(() => {
    if (!isLoggedIn) return;
    const id = setInterval(fetch, 30000); // poll every 30s
    return () => clearInterval(id);
  }, [isLoggedIn]);

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    try {
      await axios.patch(`${API}/api/listings/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setUnread(0);
      setNotifs(n => n.map(x => ({ ...x, read: true })));
    } catch {}
  };

  const toggle = () => {
    setOpen(o => !o);
    if (!open && unread > 0) markAllRead();
  };

  if (!isLoggedIn) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle}
        className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
        <Bell className="w-5 h-5 text-gray-700" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E01561] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            {notifs.some(n => !n.read) && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#E01561] hover:underline font-medium">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">No notifications yet</div>
            ) : notifs.map(n => {
              const cfg = ICON_MAP[n.type] || ICON_MAP.general;
              const Icon = cfg.icon;
              return (
                <div key={n._id} className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${n.read ? "bg-white" : "bg-pink-50/40"}`}>
                  <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 bg-[#E01561] rounded-full shrink-0 mt-2" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
