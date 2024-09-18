import React, { createContext, useState, useContext, useEffect } from 'react';
// Créer un contexte pour le thème
const RestaurantContext = createContext([]);
import { getAllTypeRestaurants,getAllDish,getRestaurantReports } from '../Api';


export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]); 
  const [typeRestaurants, setTypeRestaurants] = useState([]);
  const [dish, setDish] = useState([]);


  const [reportData, setReportData] = useState([]);

  const refreshDataRestaurant = async () => {
    const typeRestaurants = await getAllTypeRestaurants();
    const dish = await getAllDish();
    setTypeRestaurants(typeRestaurants);
    setDish(dish);
  };

  const updateRestaurant = (id, data) => {
    const newRestaurants = restaurants.map((restaurant) => {
      if (restaurant.id === id) {
        return { ...restaurant, ...data };
      }
      return restaurant;
    });
    setRestaurants(newRestaurants);
  }

  const refreshDataReport = async () => {
    const reportData = await getRestaurantReports();
    setReportData(reportData);
  }

  const updateReport = (id, data) => {
    const newReportData = reportData.map((report) => {
      if (report.id === id) {
        return { ...report, ...data };
      }
      return report;
    });
    setReportData(newReportData);
  }

 
  
  


  return (
    <RestaurantContext.Provider value={{dish,refreshDataReport, updateReport,reportData,updateRestaurant, restaurants, setRestaurants, typeRestaurants, refreshDataRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
};

// Custom hook pour utiliser le contexte du thème
export const useRestaurant = () => {
  return useContext(RestaurantContext);
};