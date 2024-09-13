import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/Config';
import { getAllRestaurants, getAllTypeRestaurants } from '../Api';
import { ToastNotif, ToastHide } from '../Utils';
import { useRestaurant } from './RestaurantsContext';
import { useTheme } from './ThemeContext';
export const BackendContext = createContext();


export const BackendProvider = ({ children }) => {
    const [isBackendConnected, setIsBackendConnected] = useState(false);
    const [isfirstCheck,setIsFirstCheck] = useState(true);

    const checkBackendConnection = async () => {
        try {
            const response = await fetch(`${API_URL}/status`);
            const data = await response.json();
            setIsBackendConnected(data.ok);
            setIsFirstCheck(false);

        } catch (error) {
            setIsBackendConnected(false);
            setIsFirstCheck(false);
        }
        
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isBackendConnected) {
                checkBackendConnection();
            } else {
                clearInterval(interval); // Stop checking once connected
            }
        }, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, [isBackendConnected]);

    return (
        <BackendContext.Provider value={{ isBackendConnected, isfirstCheck }}>
            {children}
        </BackendContext.Provider>
    );
};
