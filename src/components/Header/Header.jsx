import React, { useState, useEffect } from "react";
import DesktopHeader from "./DesktopHeader";
import MobileHeader from "../Mobileview/MobileHeader";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("Homes");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

      checkMobile();
    
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (isMobile) {
    return (
      <MobileHeader 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isScrolled={isScrolled}
      />
    );
  }

  return (
    <DesktopHeader
      isScrolled={isScrolled}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
}

export default Header;