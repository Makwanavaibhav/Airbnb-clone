import React from "react";
import Logo from "../../assets/logo/long-logo.png";

function Header() {
  return (
    <div className="flex items-center justify-between px-12 py-6">
      <img src={Logo} alt="Logo" className="h-8 w-auto" />
      <div></div>
      <div></div>
    </div>
  );
}
export default Header;