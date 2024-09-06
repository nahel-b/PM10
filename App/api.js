import AsyncStorage from '@react-native-async-storage/async-storage';

import {API_URL} from './config/Config';


const fetchWithToken = async (url, options = {},navigation) => {
    try {
        // Récupérer le token depuis AsyncStorage
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('No token found');
        }

        // Ajouter le token à l'en-tête Authorization de la requête
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };

        const response = await fetch(url, options);

        // Vérifier si un nouveau token est renvoyé dans l'en-tête de réponse
        const newToken = response.headers.get('Authorization');
        if (newToken) {
            const tokenPart = newToken.split(' ')[1];
            await AsyncStorage.setItem('authToken', tokenPart);
            console.log('New token:', tokenPart);
        }

        //check erreur 401 
        // if (response.status === 200) {
        //     console.log('Unauthorized access - redirecting to authScreen');
        //     navigation.navigate('authScreen');
        //     return null;  
        // }
        if (!response.ok) {
            console.error('Fetch with token failed:', response);
            console.log(response)
            throw new Error('Network response was not ok');
        }
        const res = await response.json();
        return res
    } catch (error) {
        console.error('Fetch with token failed:', error);
        throw error;
    }
};

const addRestaurant = async (restaurantData) => {
    const url = `${API_URL}/restaurants`;  // L'URL de l'API pour ajouter un restaurant

    try {
        const response = await fetchWithToken(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(restaurantData),
        });

        return response;  // Retourne la réponse (le nouveau restaurant créé)
    } catch (error) {
        console.error('Failed to add restaurant:', error);
        throw error;
    }
};

// Fonction pour récupérer les restaurants autour d'un centre donné
const getNearbyRestaurants = async (navigation,lat, lon, distance) => {
    const url = `${API_URL}/restaurants/around?lat=${lat}&lon=${lon}&distance=${distance}`;  // L'URL de l'API pour récupérer les restaurants

    try {
        const response = await fetchWithToken(url);
        return response;  // Retourne la liste des restaurants
    } catch (error) {
        console.error('Failed to fetch nearby restaurants:', error);
        throw error;
    }
};

// Fonction pour récupérer tous les restaurants
const getAllRestaurants = async (navigation) => {
    const url = `${API_URL}/restaurants/all`; 

    try {
        const response = await fetchWithToken(url);
        return response;  
    } catch (error) {
        console.error('Failed to fetch nearby restaurants:', error);
        throw error;
    }
};

const getAllTypeRestaurants = async (navigation) => {
    const url = `${API_URL}/typerestaurants/all`; 

    try {
        const response = await fetchWithToken(url);
        return response;  
    } catch (error) {
        console.error('Failed to fetch nearby restaurants:', error);
        throw error; 
    }
};




export {fetchWithToken, addRestaurant, getNearbyRestaurants, getAllRestaurants, getAllTypeRestaurants};
