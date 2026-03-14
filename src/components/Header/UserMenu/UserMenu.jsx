import React, { useState } from "react";
import { Menu, CircleQuestionMark, User as UserIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../../ui/dropdown-menu.jsx";
import Host from "../../../assets/logo/host.png";
import AuthModal from "./Becomehost.jsx";

const UserMenu = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);

  const openModal = (transparent = false) => {
    setIsTransparent(transparent);
    setIsAuthModalOpen(true);
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
          className="w-64 z-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <DropdownMenuItem className="py-3 cursor-pointer">
            <CircleQuestionMark className="mr-2 h-4 w-4" />
            Help Center
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />

          {/* Become a host - Now opens the modal */}
          <DropdownMenuItem 
            className="py-3 cursor-pointer"
            onClick={() => openModal(false)}
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

          <DropdownMenuSeparator />

          <DropdownMenuItem className="py-3 cursor-pointer">
            <span>Refer a Host</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="py-3 cursor-pointer">
            <span>Find a co-host</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem 
            className="py-3 cursor-pointer font-semibold"
            onClick={() => openModal(true)} 
          >
            <div className="flex items-center gap-3">
              <UserIcon className="h-4 w-4" />
              <span>Log in or sign up</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        isTransparent={isTransparent}
      />
    </>
  );
};

export default UserMenu;