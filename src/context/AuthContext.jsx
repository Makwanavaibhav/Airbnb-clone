import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  // Set of hotel IDs in the user's wishlist — shared globally for heart-sync
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const getToken = () => localStorage.getItem("token");

  const login = (token, userData) => {
    localStorage.setItem("token", token || "dummy_token");
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setWishlistIds(new Set());
  };

  // Fetch wishlist IDs from backend when logged in
  const fetchWishlistIds = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5001/api/users/wishlist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = res.data.wishlist || [];
      setWishlistIds(new Set(items.map(h => String(h._id || h.id))));
    } catch (e) {
      // silently ignore if backend unavailable
    }
  }, []);

  // Toggle wishlist: returns new state (true = now liked)
  const toggleWishlist = useCallback(async (hotelId) => {
    const token = getToken();
    if (!token) return false;
    const idStr = String(hotelId);
    const isLiked = wishlistIds.has(idStr);
    try {
      if (isLiked) {
        await axios.delete(`http://localhost:5001/api/users/wishlist/${idStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistIds(prev => { const s = new Set(prev); s.delete(idStr); return s; });
        return false;
      } else {
        await axios.post("http://localhost:5001/api/users/wishlist",
          { hotelId: idStr },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistIds(prev => new Set([...prev, idStr]));
        return true;
      }
    } catch (e) {
      console.error("Wishlist toggle error", e);
      return isLiked;
    }
  }, [wishlistIds]);

  useEffect(() => {
    const handleStorageChange = () => {
      const loggedIn = !!localStorage.getItem("token");
      setIsLoggedIn(loggedIn);
      try { setUser(JSON.parse(localStorage.getItem("user") || "null")); } catch { setUser(null); }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchWishlistIds();
  }, [isLoggedIn, fetchWishlistIds]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user, getToken, wishlistIds, toggleWishlist, fetchWishlistIds }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
