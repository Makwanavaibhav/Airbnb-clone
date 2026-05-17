import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const [wishlistIds, setWishlistIds] = useState(new Set());
  // loading = true while we hydrate user profile on startup
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  // Mutable ref so toggleWishlist never has stale closure (Fix #3)
  const wishlistIdsRef = useRef(wishlistIds);
  useEffect(() => { wishlistIdsRef.current = wishlistIds; }, [wishlistIds]);

  const getToken = () => localStorage.getItem("token");

  const login = (token, userData) => {
    localStorage.setItem("token", token || "dummy_token");
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    // Always clear stale profile cache so fetchUserProfile re-fetches fresh data on next startup
    setLoading(true);
    setIsLoggedIn(true);
  };

  // Update user data globally — called after profile/photo save
  const updateUser = (partialUpdate) => {
    setUser((prev) => {
      const updated = { ...prev, ...partialUpdate };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setWishlistIds(new Set());
  };

  // Fetch wishlist IDs from backend
  const fetchWishlistIds = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = res.data.wishlist || [];
      setWishlistIds(new Set(items.map(h => String(h._id || h.id))));
    } catch {
      // silently ignore — backend may be starting
    }
  }, []);

  // Hydrate user profile from backend on startup (Fix #9)
  const fetchUserProfile = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profile = res.data.user || res.data;
      if (profile?.firstName || profile?.email) {
        localStorage.setItem("user", JSON.stringify(profile));
        setUser(profile);
      }
    } catch {
      // silently ignore — backend may be starting
    }
  }, []); // no dependencies — always fetches fresh from backend

  // Toggle wishlist — uses ref to avoid stale closure (Fix #3)
  const toggleWishlist = useCallback(async (hotelId) => {
    const token = getToken();
    if (!token) return false;
    const idStr = String(hotelId);
    const isLiked = wishlistIdsRef.current.has(idStr);
    // Optimistic update
    setWishlistIds(prev => {
      const s = new Set(prev);
      isLiked ? s.delete(idStr) : s.add(idStr);
      return s;
    });
    try {
      if (isLiked) {
        await axios.delete(`${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`}/api/users/wishlist/${idStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return false;
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/users/wishlist`,
          { hotelId: idStr },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return true;
      }
    } catch (e) {
      console.error("Wishlist toggle error", e);
      // Revert on failure
      setWishlistIds(prev => {
        const s = new Set(prev);
        isLiked ? s.add(idStr) : s.delete(idStr);
        return s;
      });
      return isLiked;
    }
  }, []);  // No dependency on wishlistIds — uses ref instead

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
    if (isLoggedIn) {
      setLoading(true);
      Promise.allSettled([fetchWishlistIds(), fetchUserProfile()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]); // eslint-disable-line

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user, updateUser, getToken, wishlistIds, toggleWishlist, fetchWishlistIds, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
