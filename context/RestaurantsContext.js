import React, { createContext, useState, useContext } from 'react';
// Créer un contexte pour le thème
const RestaurantContext = createContext([]);

export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]); 

  

  return (
    <RestaurantContext.Provider value={{ restaurants, setRestaurants }}>
      {children}
    </RestaurantContext.Provider>
  );
};

// Custom hook pour utiliser le contexte du thème
export const useRestaurant = () => {
  return useContext(RestaurantContext);
};