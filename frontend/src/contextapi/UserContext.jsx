import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null); // null indicates "not fetched yet"
  const [ready, setReady] = useState(false);

  // Mock user for testing (only in development)
  const mockUser = {
    id: 'mock_user_123',
    name: 'Demo User',
    email: 'demo@incentum.ai',
    phoneNumber: '9876543210',
    pincode: '123456',
    createdAt: new Date().toISOString()
  };

  // Helper function to save user to localStorage
  const saveUserToStorage = (userData) => {
    if (userData) {
      localStorage.setItem('incentum_user', JSON.stringify(userData));
      localStorage.setItem('incentum_user_timestamp', Date.now().toString());
    } else {
      localStorage.removeItem('incentum_user');
      localStorage.removeItem('incentum_user_timestamp');
    }
  };

  // Helper function to get user from localStorage
  const getUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('incentum_user');
      const timestamp = localStorage.getItem('incentum_user_timestamp');
      
      if (storedUser && timestamp) {
        const userAge = Date.now() - parseInt(timestamp);
        const maxAge = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        
        if (userAge < maxAge) {
          return JSON.parse(storedUser);
        } else {
          // User data is expired, remove it
          localStorage.removeItem('incentum_user');
          localStorage.removeItem('incentum_user_timestamp');
        }
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
      localStorage.removeItem('incentum_user');
      localStorage.removeItem('incentum_user_timestamp');
    }
    return null;
  };

  // Enhanced setUser function that also saves to localStorage
  const setUserWithPersistence = (userData) => {
    setUser(userData);
    saveUserToStorage(userData);
  };

  useEffect(() => {
    const initializeUser = async () => {
      // First, check if we have a valid user in localStorage
      const storedUser = getUserFromStorage();
      if (storedUser) {
        console.log('Found valid user in localStorage:', storedUser);
        setUser(storedUser);
        setReady(true);
        
        // Optionally verify the stored user with backend (but don't block UI)
        verifyStoredUser(storedUser);
        return;
      }

      // No stored user, try to fetch from backend
      await fetchUserProfile();
    };

    const verifyStoredUser = async (storedUser) => {
      try {
        console.log('Verifying stored user with backend...');
        const response = await axios.get('/api/users/profile', {
          withCredentials: true,
        });
        
        if (response.data.success && response.data.data) {
          const freshUserData = response.data.data;
          console.log('Backend verification successful, updating user data');
          setUserWithPersistence(freshUserData);
        }
      } catch (error) {
        console.warn('Backend verification failed:', error.response?.status);
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Authentication expired, clearing stored user');
          setUserWithPersistence(null);
        }
        // For other errors, keep the stored user (offline resilience)
      }
    };

    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile from backend...');
        const response = await axios.get('/api/users/profile', {
          withCredentials: true,
        });
        console.log("Profile response:", response.data);
        
        if (response.data.success && response.data.data) {
          console.log('Successfully fetched user profile:', response.data.data);
          setUserWithPersistence(response.data.data);
        } else {
          console.warn('Profile response format unexpected:', response.data);
          setUserWithPersistence(null);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error.response?.status, error.response?.data?.message || error.message);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Authentication failed - user not logged in');
          setUserWithPersistence(null);
        } else if (error.response?.status >= 500) {
          console.warn('Server error during profile fetch - keeping current state');
          setUserWithPersistence(null);
        } else {
          console.warn('Network/other error during profile fetch:', error.message);
          
          const useMockUser = localStorage.getItem('incentum_use_mock_user') === 'true';
          if (import.meta.env.DEV && useMockUser) {
            console.log('Using mock user for development testing');
            setUserWithPersistence(mockUser);
          } else {
            setUserWithPersistence(null);
          }
        }
      } finally {
        setReady(true);
      }
    };

    initializeUser();
  }, []); // Empty dependency array for mount-only initialization

  // Function to manually refresh user data
  const refreshUser = async () => {
    setReady(false);
    try {
      console.log('Manually refreshing user profile...');
      const response = await axios.get('/api/users/profile', {
        withCredentials: true,
      });
      if (response.data.success && response.data.data) {
        console.log('Successfully refreshed user profile:', response.data.data);
        setUserWithPersistence(response.data.data);
      } else {
        setUserWithPersistence(null);
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error.response?.data || error.message);
      setUserWithPersistence(null);
    } finally {
      setReady(true);
    }
  };

  // Function to logout user (clear both state and localStorage)
  const logout = () => {
    console.log('Logging out user...');
    setUserWithPersistence(null);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser: setUserWithPersistence, 
      ready, 
      refreshUser,
      logout 
    }}>
      {ready ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
}