import Cards from "../src/components/Cards/hotels.jsx";
import Header from "./components/Header/Header.jsx";
import { useState } from "react";

function App(){
  const [activtab, setActivtab] = useState("Homes");

  return<div className="app">
    <Header activeTab={activtab} setActiveTab={setActivtab} />
    <Cards />
  </div>
}
export default App;
