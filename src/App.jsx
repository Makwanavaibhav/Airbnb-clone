import Cards from "../src/components/Cards/hotels.jsx";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import { useState } from "react";
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
import ExperienceDetail from "./pages/Experiences/ExperienceDetail.jsx";
import ServiceDetail from "./pages/Services/ServiceDetail.jsx";

const Placeholder = ({ title }) => <div className="max-w-[1120px] mx-auto px-6 py-24 text-2xl font-semibold">{title} coming soon...</div>;

// Create a layout component to share Header and Footer
function MainLayout({ children, activeTab, setActiveTab, hideFooter = false }) {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="grow">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  const [activtab, setActivtab] = useState("Homes");

  // Booking success handled natively via BookingSuccess component

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

            {/* Experience + Service detail routes */}
            <Route path="/experiences/:id" element={
              <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
                <ExperienceDetail />
              </MainLayout>
            } />
            <Route path="/services/:id" element={
              <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
                <ServiceDetail />
              </MainLayout>
            } />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/host-dashboard" element={
              <ProtectedRoute>
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
                <MainLayout activeTab={activtab} setActiveTab={setActivtab} hideFooter={true}>
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

            {/* 404 Route */}
            <Route path="*" element={
              <MainLayout activeTab={activtab} setActiveTab={setActivtab}>
                <div className="max-w-[1120px] mx-auto px-6 py-24 text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-xl text-gray-500">Page not found</p>
                </div>
              </MainLayout>
            } />
          </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;