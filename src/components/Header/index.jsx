import React from "react";
import LongLogo from "../../assets/logo/long-logo.png";
import ShortLogo from "../../assets/logo/logo.png";
import House  from "../../assets/logo/house.png";
import { Search, Globe, Menu  } from "lucide-react";

function Header() {
  return (
    <div className="flex items-center justify-between px-8 py-5 border-b bg-white">
      <div className="relative h-8 w-auto cursor-pointer group">
        
        <img 
          src={LongLogo} 
          alt="Logo" 
          className="h-8 w-auto hidden md:block transition-opacity duration-300 ease-in-out" 
        />
          <img 
          src={ShortLogo} 
          alt="Logo" 
          className="h-10 w-auto block md:hidden transition-opacity duration-300 ease-in-out" 
        />
        
      </div>
      <div className="flex items-center px-3 py-1.5 space-x-3 rounded-full border-2 border-gray-300 shadow-md hover:shadow-xl transition-shadow duration-200 ease-in-out cursor-pointer">
        <img src={House} alt="House Icon" className="h-8 w-8 mr-1" />
       <div className="font-medium text-sm pr-3  border-r border-gray-300 flex-items-center">
        Anywhere</div>
       <div className="font-medium text-sm pr-3 border-r border-gray-300 flex-items-center">
        Anytime</div>
       <div className="font-medium text-sm pr-2 border-gray-300 flex-items-center">
        Add guests</div>
        <div className="bg-airbnb p-2 rounded-full"> <Search className="h-4 w-4 text-white"/>
        </div>
      </div>

    
      <div className="flex justify-end px-4 gap-2">
        <button type="button" className="font-medium text-sm px-3 py-1 hover:bg-gray-100 rounded-full cursor-pointer">Become a host</button>
        <div className="bg-gray-100 p-3 rounded-full hover:bg-gray-200"> <Globe className="h-5 w-5 text-black"/>
        </div>
        <div className="bg-gray-100 p-3 rounded-full hover:bg-gray-200"> <Menu className="h-5 w-5 text-black"/>
        </div>
      </div>
    </div>
  );
}

export default Header;