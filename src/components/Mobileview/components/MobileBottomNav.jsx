import React from "react";
import { Search, Heart, MessageCircle, Map, CircleUserRound } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function MobileBottomNav({ bottomNavVisible }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Explore", icon: Search, path: "/" },
    { label: "Wishlists", icon: Heart, path: "/wishlists" },
    { label: "Trips", icon: Map, path: "/trips" },
    { label: "Messages", icon: MessageCircle, path: "/messages" },
    { label: "Profile", icon: CircleUserRound, path: "/profile" },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-800/50 z-40 transition-transform duration-300 pb-safe ${
      bottomNavVisible ? "translate-y-0" : "translate-y-full"
    }`}>
      <div className="flex items-center h-[65px] px-2 mb-[env(safe-area-inset-bottom)]">
        <div className="flex-1 flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center w-full min-h-[44px] min-w-[44px] gap-1 transition-colors ${
                  isActive ? "text-airbnb" : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                <Icon className={`h-6 w-6 mb-0.5 ${isActive ? "fill-airbnb/10" : ""}`} />
                <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MobileBottomNav;