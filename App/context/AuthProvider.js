import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/Config';
import { getAllRestaurants, getAllTypeRestaurants } from '../Api';
import { ToastNotif, ToastHide } from '../Utils';
import { useRestaurant } from './RestaurantsContext';
import { useTheme } from './ThemeContext';
export const AuthContext = createContext();
import { BackendContext } from './BackendProvider';

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const { setRestaurants, setTypeRestaurants,refreshDataRestaurant,refreshDataReport } = useRestaurant();
    const { theme } = useTheme();
    const { isBackendConnected } = React.useContext(BackendContext); // Check backend connection

    const [authLevel, setAuthLevel] = useState(0);

    const logout = async () => {
        await AsyncStorage.removeItem('authToken');
        setIsAuthenticated(false);
    };

    useEffect( () => {
        AsyncStorage.getItem('authLevel').then((value) => { 
            if(value)
                {
                    setAuthLevel(value);
                }
        }
        );
    }, []);

    const checkAuthToken = async () => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            try {
                const response = await fetch(`${API_URL}/checktoken`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setIsAuthenticated(data.ok == true);

            } catch (error) {
                console.error('Error checking token:', error);
                setIsAuthenticated(false);
            }
        } else {
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {

        if (isBackendConnected) {
            checkAuthToken(); // Only check authentication when backend is connected
        }
    }, [isBackendConnected]);

    // Load restaurants only when authenticated
    useEffect(() => {

        const loadAllRestaurants = async () => {
            
                try {
                    ToastNotif("Récupération des restaurants...", "loading-cricle", {
                        button_background: theme.background,
                        text: theme.text,
                    }, theme.text, 10000, "bottom", true);
                  
                    const restaurants = await getAllRestaurants(logout);
                    setRestaurants(restaurants);
                    refreshDataRestaurant();
                    ToastHide();
                } catch (error) {
                    console.error('Erreur lors de la récupération des restaurants:', error);
                    ToastNotif("Erreur lors de la récupération des restaurants", "times-circle", {
                        button_background: "red",
                        text: "white",
                    }, "white", 3000);
                }
            
        };

        if (isAuthenticated && isBackendConnected) {
        loadAllRestaurants();
        if(authLevel>0)
            {
                
                refreshDataReport()

            }
        }
    }, [isAuthenticated,isBackendConnected]);

    return (
        <AuthContext.Provider value={{authLevel,setAuthLevel, isAuthenticated, setIsAuthenticated,logout }}>
            {children}
        </AuthContext.Provider>
    );
};
