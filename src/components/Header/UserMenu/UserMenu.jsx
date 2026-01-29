// components/Header/components/UserMenu/UserMenu.jsx
import React from "react";
import { Menu, CircleQuestionMark, User as UserIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu.jsx";
import Host from "../../../assets/logo/host.png";

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer focus-visible:outline-none transition-colors"
        >
          <Menu className="h-5 w-5 text-gray-900 dark:text-gray-100" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64 z-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DropdownMenuItem className="py-3 text-gray-900 dark:text-gray-100">
          <CircleQuestionMark className="mr-2 h-4 w-4" />Help Center
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="py-3 focus:bg-gray-100 dark:focus:bg-gray-700">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">Become a host</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">It's easy to start hosting and earn extra income.</p>
            </div>
            <img src={Host} alt="Host" className="w-10 h-10 object-contain" />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="py-3 focus:bg-gray-100 dark:focus:bg-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-gray-900 dark:text-gray-100">Refer a Host</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="py-3 focus:bg-gray-100 dark:focus:bg-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-gray-900 dark:text-gray-100">Find a co-host</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="py-3 focus:bg-gray-100 dark:focus:bg-gray-700">
          <div className="flex items-center gap-3">
            <UserIcon className="h-4 w-4" />
            <span className="text-gray-900 dark:text-gray-100">Log in or sign up</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserMenu;