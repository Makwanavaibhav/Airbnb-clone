import Cards from "../src/components/Cards/hotels.jsx";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HotelDetails from "./components/Cards/HotelDetails.jsx";
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import HostDashboard from "./pages/HostDashboard/HostDashboard.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import Messages from "./pages/Messages/Messages.jsx";
import Trips from "./pages/Trips/Trips.jsx";
import Wishlists from "./pages/Wishlists/Wishlists.jsx";
import AccountSettings from "./pages/AccountSettings/AccountSettings.jsx";
import BookingSuccess from "./pages/BookingSuccess/BookingSuccess.jsx";

const Placeholder = ({ title }) => <div className="max-w-[1120px] mx-auto px-6 py-24 text-2xl font-semibold">{title} coming soon...</div>;

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
    <AuthProvider>
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
          
          {/* Protected Routes */}
          <Route path="/host-dashboard" element={
            <ProtectedRoute requireHost={true}>
              <HostDashboard />
            </ProtectedRoute>
          } />

          <Route path="/checkout/:hotelId" element={
            <ProtectedRoute>
              <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
                <Checkout />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/trips" element={
            <ProtectedRoute>
              <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
                <Trips />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/wishlists" element={
            <ProtectedRoute>
              <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
                <Wishlists />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/messages" element={
            <ProtectedRoute>
              <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
                <Messages />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/account-settings" element={
            <ProtectedRoute>
              <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
                <AccountSettings />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/booking-success" element={
            <ProtectedRoute>
              <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
                <BookingSuccess />
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;