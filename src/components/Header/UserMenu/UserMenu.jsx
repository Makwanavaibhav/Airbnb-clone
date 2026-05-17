import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, CircleQuestionMark, Heart, MessageSquare, Settings, Globe, LogOut, User as UserIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../../ui/dropdown-menu.jsx";
import Host from "../../../assets/logo/host.png";
import { useAuth } from "../../../context/AuthContext.jsx";

const AirbnbIcon = ({ className }) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className} 
       style={{display:'block', fill:'none', stroke:'currentColor', strokeWidth:3, overflow:'visible'}}>
    <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.011.315c0 4.218-3.044 7.806-7.502 7.806-3.875 0-6.195-2.022-7.534-4.82l-.464-.999-.464.999c-1.34 2.798-3.66 4.82-7.535 4.82-4.458 0-7.502-3.588-7.502-7.806 0-.825.176-1.745.719-3.238l.182-.468c.983-2.296 5.14-11.006 7.094-14.836l.534-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.239 0-2.053.539-2.987 2.21l-.523 1.005c-1.926 3.776-6.06 12.43-7.031 14.692l-.345.836c-.427 1.071-.573 1.655-.605 2.24l-.009.217c0 2.924 1.956 5.8 5.5 5.8 2.645 0 4.343-1.428 5.485-3.816l.205-.445.696-1.572.696 1.572.205.445c1.142 2.388 2.84 3.816 5.485 3.816 3.544 0 5.5-2.876 5.5-5.8 0-.584-.131-1.16-.54-2.19l-.337-.81-7.037-14.733-.518-.996C18.053 3.539 17.24 3 16 3zm0 9c3.088 0 5.417 2.404 5.417 4.975 0 2.257-1.39 3.65-4.57 6.425l-.847.74-.847-.74c-3.18-2.775-4.57-4.168-4.57-6.425C10.583 14.404 12.912 12 16 12zm0 2c-1.859 0-3.333 1.39-3.333 2.975 0 1.258.825 2.241 3.208 4.364l.125.11.125-.11c2.383-2.123 3.208-3.106 3.208-4.364C19.333 15.39 17.859 14 16 14z" />
  </svg>
);

const UserMenu = ({ onOpenLanguageModal }) => {
  const navigate = useNavigate();
  const { isLoggedIn, logout, user } = useAuth();

  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer focus-visible:outline-none transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-900 dark:text-gray-100" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          sideOffset={8} 
          className="w-[260px] z-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl py-2"
        >
          {isLoggedIn ? (
            <>
              {/* Section 1 (guest actions) */}
              <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/wishlists")}>
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4" />
                  <span className="font-medium">Wishlists</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/trips")}>
                <div className="flex items-center gap-3">
                  <AirbnbIcon className="h-4 w-4" />
                  <span className="font-medium">Trips</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/messages")}>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">Messages</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/profile")}>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold">{userInitial}</span>
                    )}
                  </div>
                  <span className="font-medium">Profile</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              {/* Section 2 (account) */}
              <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/account-settings")}>
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  <span>Account settings</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="py-3 cursor-pointer"
                onClick={() => {
                  if(onOpenLanguageModal) onOpenLanguageModal();
                }}
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4" />
                  <span>Languages & currency</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer">
                <div className="flex items-center gap-3">
                  <CircleQuestionMark className="h-4 w-4" />
                  <span>Help Centre</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              {/* Section 3 (host) */}
              <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate(isLoggedIn ? "/host-dashboard" : "/register")}>
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 block">Become a host</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isLoggedIn ? "Go to your host dashboard." : "It's easy to start hosting and earn extra income."}
                    </p>
                  </div>
                  <img src={Host} alt="Host" className="w-10 h-10 object-contain" />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer">
                <span>Refer a Host</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-3 cursor-pointer">
                <span>Find a co-host</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              {/* Section 4 */}
              <DropdownMenuItem 
                className="py-3 cursor-pointer"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </div>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              {/* Before Login Menu */}
              <DropdownMenuItem className="py-3 cursor-pointer">
                <CircleQuestionMark className="mr-2 h-4 w-4" />
                Help Center
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuItem 
                className="py-3 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 block">Become a host</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      It's easy to start hosting and earn extra income.
                    </p>
                  </div>
                  <img src={Host} alt="Host" className="w-10 h-10 object-contain" />
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/login")}>
                <span>Refer a Host</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => navigate("/login")}>
                <span>Find a co-host</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuItem 
                className="py-3 cursor-pointer font-semibold"
                onClick={() => navigate("/login")} 
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="h-4 w-4" />
                  <span>Log in or sign up</span>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default UserMenu;