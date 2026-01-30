import Cards from "../src/components/Cards/hotels.jsx";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import { useState } from "react";

function App() {
  const [activtab, setActivtab] = useState("Homes");

  return (
    <div className="app flex flex-col min-h-screen">
      <Header activeTab={activtab} setActiveTab={setActivtab} />
      <main className="grow">
        <Cards />
      </main>
      <Footer />
    </div>
  );
}

export default App;