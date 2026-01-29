// components/Header/components/HostDialog/HostDialog.jsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog.jsx";
import House from "../../../assets/logo/house.png";
import Experiences from "../../../assets/logo/Experience.png";
import Services from "../../../assets/logo/Services.png";

function HostDialog({ selectedHostType, setSelectedHostType }) {
  const hostOptions = [
    { id: "home", label: "Home", icon: House, description: "Rent out your property" },
    { id: "experience", label: "Experience", icon: Experiences, description: "Host activities and tours" },
    { id: "service", label: "Service", icon: Services, description: "Offer professional services" },
  ];

  const handleNext = () => {
    console.log("Selected:", selectedHostType);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-sm font-semibold py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          Become a host
        </button>
      </DialogTrigger>
      
      <DialogContent className="w-[90vw] max-w-5xl min-h-100 rounded-2xl p-8 md:p-12 bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold text-center text-gray-900 dark:text-gray-100">
            What would you like to host?
          </DialogTitle>
        </DialogHeader>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {hostOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedHostType(option.id)}
              className={`border-2 rounded-2xl p-8 md:p-10 flex flex-col items-center gap-4 hover:border-black dark:hover:border-white transition-all duration-200 ${
                selectedHostType === option.id 
                  ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700 shadow-md" 
                  : "border-gray-200 dark:border-gray-600"
              }`}
            >
              <img 
                src={option.icon} 
                alt={option.label} 
                className="h-24 w-auto object-contain" 
              />
              
              <div className="text-center">
                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{option.label}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{option.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedHostType}
            className={`px-8 py-3 rounded-lg transition-colors ${
              selectedHostType
                ? "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default HostDialog;