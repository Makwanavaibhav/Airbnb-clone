import Cards from "../src/components/Cards/hotels.jsx";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HotelDetails from "./components/Cards/HotelDetails.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";

// Create a layout component to share Header and Footer
function MainLayout({ children, activeTab, setActiveTab }) {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [activtab, setActivtab] = useState("Homes");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("booking_success")) {
      alert("Booking confirmed successfully! Have a great trip.");
      window.history.replaceState({}, document.title, "/");
    }
    if (params.get("booking_error")) {
      alert("There was an issue processing your booking.");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
            <Cards activeTab={activtab} />
          </MainLayout>
        } />
        
        {/* Detail Route */}
        <Route path="/hotel/:id" element={
          <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
            <HotelDetails />
          </MainLayout>
        } />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;