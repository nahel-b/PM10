import React, { createContext, useState, useContext } from 'react';
// Créer un contexte pour le thème
const RestaurantContext = createContext([]);
import { getAllTypeRestaurants,getAllDish } from '../Api';


export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]); 
  const [typeRestaurants, setTypeRestaurants] = useState([]);
  const [dish, setDish] = useState([]);

  const refreshDataRestaurant = async () => {
    const typeRestaurants = await getAllTypeRestaurants();
    const dish = await getAllDish();
    setTypeRestaurants(typeRestaurants);
    setDish(dish);
  };



  
  


  return (
    <RestaurantContext.Provider value={{dish, restaurants, setRestaurants, typeRestaurants, refreshDataRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
};

// Custom hook pour utiliser le contexte du thème
export const useRestaurant = () => {
  return useContext(RestaurantContext);
};