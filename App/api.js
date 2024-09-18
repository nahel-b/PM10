import AsyncStorage from '@react-native-async-storage/async-storage';

import {API_URL} from './config/Config';

const fetchWithToken = async (url, options = {},logout) => {


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
        if (response.status === 401) {
            console.log('Unauthorized access - redirecting to authScreen');
            logout();
            return null;  
        }
        if (!response.ok ) {
            //console.error('Fetch with token failed:', response);
           // console.log(response)
            const res = await response.json();
            console.log(res)
            if(res.message)
                {
                    throw new Error(response);
                }
            else{throw new Error('Network response was not ok');}
            
        }
        const res = await response.json();
        return res
    } catch (error) {
        //console.error('Fetch with token failed:', error);
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
        console.error('Failed to add restaurant::', error);
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
const getAllRestaurants = async (logout) => {
    const url = `${API_URL}/restaurants/all`; 

    try {
        const response = await fetchWithToken(url,{},logout);
        return response;  
    } catch (error) {
        console.error('Failed to fetch nearby restaurants:', error);
        throw error;
    }
};

const getAllTypeRestaurants = async (logout) => {
    const url = `${API_URL}/typerestaurants/all`; 

    try {
        const response = await fetchWithToken(url);
        return response;  
    } catch (error) {
        console.error('Failed to fetch nearby restaurants:', error);
        throw error; 
    }
};

const getAllDish = async (logout) => {
    const url = `${API_URL}/dish/all`; 

    try {
        const response = await fetchWithToken(url);
        return response;  
    } catch (error) {
        console.error('Failed to fetch nearby restaurants:', error);
        throw error; 
    }
}

const SendRatingRestaurant = async (restaurantId, rating) => {
    const url = `${API_URL}/restaurants/${restaurantId}/ratings`;  // L'URL de l'API pour ajouter une note

    try {
        const response = await fetchWithToken(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating }),
        });

        return response;  // Retourne la réponse avec la nouvelle moyenne des notes
    } catch (error) {
        console.error('Failed to send rating:', error);
        throw error;
    }
};

// Fonction pour ajouter un avis à un restaurant
const addReviewToRestaurant = async (restaurantId, reviewData) => {
    const url = `${API_URL}/restaurants/${restaurantId}/reviews`;  // L'URL de l'API pour ajouter un avis

    try {
        const response = await fetchWithToken(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
        });

        return response;  // Retourne la réponse avec l'avis ajouté
    } catch (error) {
        console.error('Failed to add review:', error);
        throw error;
    }
};

const deleteReview = async (restaurantId, reviewId) => {
    const url = `${API_URL}/restaurants/${restaurantId}/reviews/${reviewId}`;  // L'URL de l'API pour supprimer un avis

    try {
        const response = await fetchWithToken(url, {
            method: 'DELETE',
        });

        return response;  // Retourne la réponse avec l'avis supprimé
    } catch (error) {
        console.error('Failed to delete review:', error);
        throw error;
    }
};

  

const deleteAccount = async (logout) => {
    const url = `${API_URL}/delete_account`; 

    try {
        const response = await fetchWithToken(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        },logout);
        return response;  
    } catch (error) {
        console.error('Failed to delete account', error);
        throw error; 
    }
}


//route du backend : router.get("/restaurants/reports", async (req, res) => {

const getRestaurantReports = async () => {
    const url = `${API_URL}/restaurants/reports`;  // L'URL de l'API pour récupérer les signalements

    try {
        const response = await fetchWithToken(url);

        return response;  // Retourne la liste des signalements
    } catch (error) {
        console.error('Failed to fetch reports:', error);
        throw error;
    }
}

const reportReview = async (restaurantId, reviewId, reportData) => {
    const url = `${API_URL}/restaurants/${restaurantId}/reviews/${reviewId}/report`;  // L'URL de l'API pour signaler un avis

    try {
        const response = await fetchWithToken(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
        });

        return response;  // Retourne la réponse avec le signalement
    } catch (error) {
        
        throw error;
    }
}

const deleteAllReports = async (restaurantId, reviewId) => {
    const url = `${API_URL}/restaurants/${restaurantId}/reviews/${reviewId}/report/all`;  

    try {
        const response = await fetchWithToken(url, {
            method: 'DELETE',
        });

        return response;  // Retourne la réponse avec les signalements supprimés
    } catch (error) {
        console.error('Failed to delete reports:', error);
        throw error;
    }
}




export {fetchWithToken,getRestaurantReports,getAllDish,deleteAllReports,reportReview,deleteReview,addReviewToRestaurant, addRestaurant,deleteAccount,SendRatingRestaurant, getNearbyRestaurants, getAllRestaurants, getAllTypeRestaurants};
