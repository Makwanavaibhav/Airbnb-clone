import React from "react";
import { Sun, Moon } from "lucide-react";

function ThemeToggle({ isDarkMode, setIsDarkMode }) {
  return (
    <button 
      onClick={() => setIsDarkMode(!isDarkMode)} 
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <Sun className="h-4 w-4 text-gray-900 dark:text-gray-100" />
      ) : (
        <Moon className="h-4 w-4 text-gray-900 dark:text-gray-100" />
      )}
    </button>
  );
}

export default ThemeToggle;