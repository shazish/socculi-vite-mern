// utils/authStatus.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { useState, useEffect } from 'react';

export function useAuthStatus() {
  const { isAuthenticated, user } = useAuth0();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("socculi_user_email"));

  // Update local state whenever Auth0 state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem("socculi_user_email", user?.email ?? "");
      setIsLoggedIn(true);
    } else {
      // Only remove if we're definitely logged out
      if (isAuthenticated === false) {  // Check it's explicitly false, not undefined
        localStorage.removeItem("socculi_user_email");
        setIsLoggedIn(false);
      }
    }
  }, [isAuthenticated, user]);

  // This is for handling changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "socculi_user_email") {
        setIsLoggedIn(!!e.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { isLoggedIn };
}