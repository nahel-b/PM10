import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity, ActivityIndicator,ScrollView } from 'react-native';

import { Animated as RNAnimated } from 'react-native';

import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';


import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { PanGestureHandler, GestureHandlerRootView, State, TextInput } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from  '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context';
import { ToastObj, ToastNotif } from './Utils';
import { Rating } from 'react-native-ratings'; // Importer le composant Rating
import { useTheme } from './context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import {deleteReview,reportReview} from './Api';


import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { images } from './ImagesRestaurant';
import ModalRestaurant from './ModalRestaurant';

import * as Haptics from 'expo-haptics';

import {AuthContext} from './context/AuthProvider';

import  CustomModal from './ModalMenue';

import MapView from "react-native-map-clustering";
import { useRestaurant } from './context/RestaurantsContext';
import Toast from 'react-native-toast-message';


const DEFAULT_LOCATION = { latitude: 37.78825, longitude: -122.4324 }; 
const STORAGE_KEY = "lastLocation"; 



const App = () => {
    const mapRef = useRef(null);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [storedLocation, setStoredLocation] = useState(null);
    const [markers, setMarkers] = useState([]);
    const { theme, themeName } = useTheme();
    const animatedHeight = useRef(new RNAnimated.Value(0)).current;
    const markerPressedRef = useRef(false);
    const { restaurants } = useRestaurant();
    const searchInputRef = useRef(null);
    const [mapKey, setMapKey] = useState('map1');
    const [mapType, setMapType] = useState('standard');

    const [addingNewRestaurant, setAddingNewRestaurant] = useState(false);
    const [replacingNewRestaurant,setReplacingNewRestaurant] = useState(false)

    const insets = useSafeAreaInsets();

    const [currentMapRegion, setCurrentMapRegion] = useState(null);

    const {authLevel} =  React.useContext(AuthContext)
  
    useEffect(() => {
      setMarkers(restaurants); // Mettre à jour les marqueurs quand les restaurants changent
      forceRerender();
      //console.log(restaurants[0].coordinate.coordinates[0])
    }, [restaurants]);


    useEffect(() => {
      return () => {
        if (currentMapRegion) {
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentMapRegion));
        }
      };
    }, [currentMapRegion]);
    
  
    useEffect(() => {
      const loadStoredLocation = async () => {
        try {
          const value = await AsyncStorage.getItem(STORAGE_KEY);
          if (value !== null) {
            const savedLocation = JSON.parse(value);
            setStoredLocation(savedLocation);
          } else {
            setStoredLocation(DEFAULT_LOCATION);
          }
          //handleLocationButtonPress(first = true);
        } catch (e) {
          console.log("Erreur lors du chargement de la position stockée", e);
        }
      };
      loadStoredLocation();
    }, []);
  
    useEffect(() => {
      if (storedLocation) {
        centerMapOnLocation();
      }
    }, [storedLocation]);
  
    const getCurrentLocation = async () => {
      setLoading(true);
      setError(null);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission refusée');
          console.log(first)
          if(!first){
          ToastNotif("Veuillez activer la localisation dans les reglages", "times-circle", theme, theme.red, 3000);
          }setLoading(false);
          return;
        }
  
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentLocation.coords));
        
        setStoredLocation(currentLocation.coords);
        if(loading){
        centerMapOnLocation();}

        setLoading(false);
      } catch (err) {
        setError('Échec de localisation');
        console.log("Erreur lors de la localisation", err);
      } finally {
        setLoading(false);
      }
    };
  
    const centerMapOnLocation = () => {
      if (mapRef.current && storedLocation) {
        mapRef.current.animateToRegion({
          latitude: storedLocation.latitude,
          longitude: storedLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    };
  
    const handleLocationButtonPress = async (first = false) => {
        if(loading){setLoading(false)}
        else{
      await getCurrentLocation(first);}
    //   if (storedLocation) {
    //     centerMapOnLocation();
    //   }
    };
  
    const handleMarkerPress = (marker) => {
      markerPressedRef.current = true;
      setSelectedMarker(marker);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      
  
      mapRef.current.animateToRegion({
        latitude: marker.coordinate.coordinates[1] - 0.0001,
        longitude: marker.coordinate.coordinates[0],
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      }, 1000);
  
      if (!isModalVisible) {
        setIsModalVisible(true);
        RNAnimated.timing(animatedHeight, {
          toValue: Dimensions.get('window').height / 2,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    };
  
    const closeModal = () => {
        RNAnimated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setIsModalVisible(false);
        setSelectedMarker(null);
      });
    };
  
    const navigation = useNavigation();
    const handleMapPress = () => {
      if (!markerPressedRef.current) {
        closeModal();
      }
      markerPressedRef.current = false;
    };

    const forceRerender = () => {
        setMapKey(prevKey => (prevKey === 'map1' ? 'map2' : 'map1'));
      };

  
    const CustomCluster = ({ count }) => (
      <View style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.blue,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
      }}>
        <Text style={{ color: 'white', fontFamily: "Inter-Black", fontSize: 20 }}>{count}</Text>
      </View>
    );

    const handlePlusButtonPress = () => {
        setAddingNewRestaurant(true);
      }


      const handleValidation = () => {
        if (currentMapRegion) {
          // tester si le zoom n'est pas trop bas
          if (currentMapRegion.latitudeDelta > 0.002) {
            ToastNotif("Zoom pour être plus précis", "times-circle", { button_background: theme.background, text: theme.text }, theme.red, 3000);
          }
          else
          {
            if(addingNewRestaurant){
            navigation.navigate("NewRestaurantView",{currentMapRegion : currentMapRegion})
            console.log(currentMapRegion);}
            else{
              
              setReplacingNewRestaurant(false)
              console.log("replace fin")
            
            }
          }
            
        }
        else {
             ToastNotif("Veuillez vous déplacer sur la carte", "times-circle", { button_background: theme.background, text: theme.text }, theme.red, 3000);
            }
      };


  
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          key={mapKey}
          radius={Dimensions.get('window').width * 0.15}
            onRegionChangeComplete={(region) => {setCurrentMapRegion(region);}}
          initialRegion={{
            latitude: storedLocation?.latitude || DEFAULT_LOCATION.latitude,
            longitude: storedLocation?.longitude || DEFAULT_LOCATION.longitude,
            latitudeDelta: storedLocation?.latitudeDelta || 0.0922,
            longitudeDelta: storedLocation?.longitudeDelta || 0.0421,
          }}
          mapType={mapType}
          userInterfaceStyle={themeName === 'dark' ? 'dark' : 'light'}
          onPress={handleMapPress}
          showsUserLocation={true}
            renderCluster={(cluster) => {
            const { id, geometry, properties } = cluster;
            const points = properties.point_count;

            return (
              <Marker
                key={`cluster-${id}`}
                coordinate={{
                  longitude: geometry.coordinates[0],
                  latitude: geometry.coordinates[1]
                }}
                zIndex={2}
                onPress={() => console.log("Cluster pressed")}
              >
                <CustomCluster count={points} />
              </Marker>
            );
          }}
        >
          {markers && 
            markers.map((marker) => {
              
              const image = images[marker.type] || images["default"];

              return (
              <Marker
                key={marker.id}
                coordinate={{"latitude": marker.coordinate.coordinates[1], "longitude": marker.coordinate.coordinates[0]}}
                onPress={() => handleMarkerPress(marker)}
                zIndex={selectedMarker ? (selectedMarker.id == marker.id ? 3 : 2) : 2}
                centerOffset={{ x: 0, y: -40 }}

              >
                <Animated.View style={{
                  borderRadius: 5,
                  shadowColor: '#000',
                  opacity: selectedMarker ? (selectedMarker.id != marker.id ? 0.3 : 1) : 1,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  padding: 5, justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: theme.background
                }}>
                  <Image
                    source={image}
                    style={{ width: 50, height: 50, top: -40, left : 5, position: "absolute" }}
                  />
  
                  <View style={{ position: "absolute", top: -10, right: -5, padding: 4, backgroundColor: theme.blue, borderRadius: 5 }}>
                    <Text style={{ fontFamily: 'Inter-Black', fontSize: 12, color: "white" }}>New</Text>
                  </View>
  
                  <Text style={{ marginTop: 5, fontFamily: 'Inter-Black', fontSize: 14, color: theme.text }}>{marker.title} </Text>
                  <Text style={{ fontFamily: 'Inter-Medium', fontSize: 10, marginTop: -2, color: theme.dark_gray }}>{marker.type}</Text>
                  <Rating
                    type='custom'
                    ratingColor={"#FFC300"}
                    ratingBackgroundColor={theme.light_gray}
                    startingValue={marker.ratingAverage}
                    imageSize={15}
                    readonly
                    tintColor={theme.background}
                    style={{ marginLeft: 0 }}
                  />

            <View style={{
                width: 0,
                height: 0,
                borderLeftWidth: 20,
                borderRightWidth: 20,
                borderTopWidth: 15,
                bottom: -12,
                position: 'absolute',
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: theme.background,
                alignSelf: 'center',
                // shadowColor: '#000',
                // shadowOffset: { width: 0, height: 2 },
                // shadowOpacity: 0.5,
                }} />
                </Animated.View>
              </Marker>
            )})
          }
        </MapView>
  
        {!addingNewRestaurant && !replacingNewRestaurant && selectedMarker && (
          <ModalMarker
          selectedMarkerId={selectedMarker.id}
            closeModal={closeModal}
            animatedHeight={animatedHeight}
            setReplacingNewRestaurant={setReplacingNewRestaurant}
          />
        )} 
  
        

         <View style={{  alignSelf : "center",position : "absolute",top : insets.top,width : "100%"}}>
          
         {!addingNewRestaurant && !replacingNewRestaurant &&
         <>
         <View style={{ flexDirection : "row", alignSelf : "center",alignItems : "flex-start", width : "90%"}}>
            <View style={{flexDirection : "row",borderRadius : 15,backgroundColor :  theme.background,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
                paddingVertical : 10, paddingHorizontal : 7,flex : 1,flexGrow : 2}}>
                <Ionicons name="search" size={20} color={theme.dark_gray}/>
                <TextInput placeholderTextColor={theme.dark_gray} ref={searchInputRef} style={{color : theme.text,fontFamily : "Inter-Bold",marginLeft : 5}} placeholder='Recherche...' />
              
            </View>

            <View style={{ flexDirection : "row", alignSelf : "center", justifyContent : "flex-end",alignItems : "center"}}>
            <View style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
                backgroundColor : theme.background,
                borderRadius : 15,
                padding : 10.5,
                marginLeft : 10,
                flexDirection : "row",
            }}>
                <TouchableOpacity activeOpacity={0.5} onPress={()=>{setMapType(mapType == "hybridFlyover" ? "standard" : "hybridFlyover")}}>

                    {mapType == "hybridFlyover" ? <Ionicons name="map-outline" size={20} color={theme.text} style={{ }} /> 
                    : <FontAwesome name="globe" size={20} color={theme.text} style={{ }} />
                }

                </TouchableOpacity>

                <View style={{marginHorizontal : 8,borderLeftWidth : 1,borderColor : theme.gray}}/>
                
                <TouchableOpacity activeOpacity={0.5} onPress={()=>navigation.navigate("ReglageView")}>
                <Ionicons name="cog" size={20} color={theme.text} /> 

                    
                </TouchableOpacity>

            </View>
            
            

        </View> 

        </View>


        {authLevel>0 && <View style={{width : "95%",alignItems : "flex-end", justifyContent : "flex-end", marginTop : 5}} >

        <TouchableOpacity activeOpacity={0.5} onPress={()=>{navigation.navigate("AdminView")}}>
              
              <View style={{backgroundColor : theme.background, padding : 9,borderRadius : 13,alignItems : "center",justifyContent : "center"}}>

              <FontAwesome6 name="shield-cat" size={20} color={theme.red} style={{alignSelf : "center" }} />

              </View>

        </TouchableOpacity>
        </View>}
        </>}

        {(addingNewRestaurant || replacingNewRestaurant) && <View style={{width : "95%",alignItems : "center", justifyContent : "center", marginTop : -5}} >

              

        <View style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
                backgroundColor : theme.background,
                borderRadius : 15,
                padding : 10.5,
                paddingHorizontal : 15,
                marginTop : 10,
                flexDirection : "row",
            }}>
                <Text style={{fontSize : 18,fontFamily : "Inter-Bold",

                  color : theme.text

                }}>Place le restaurant sur la carte</Text>

                </View>

        </View>}


        </View>
        


        
    
  
        {/* {selectedMarker && (
          <ModalMarker
            selectedMarker={selectedMarker}
            closeModal={closeModal}
            animatedHeight={animatedHeight}
          />
        )} */}
         {/* Point fixe au centre de l'écran */}
            {(addingNewRestaurant||replacingNewRestaurant) && (
            <View style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: -20 }, { translateY: -7.5 }],
                zIndex: 2,
                
                justifyContent: 'center',
                alignItems: 'center',
            }} >
                {/* <FontAwesome6 style={{alignSelf : "center"}} name="crosshairs" size={30} color={theme.text} /> */}
                <CustomPin theme={theme} text={ addingNewRestaurant ? "Nouvelle pépite" : "Placement"}/>
             </View>
            )}
  
        {/* Bouton de localisation */}
        {!addingNewRestaurant && !replacingNewRestaurant && <View style={{
          position: 'absolute',
          bottom: 80,
          right: 20,
          backgroundColor: theme.background,
          borderRadius: 50,
          padding: 0,
          width: 50,
          height: 50,
          zIndex: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <TouchableOpacity onPress={() => handleLocationButtonPress(first = false)}>
            {loading ? (
              <ActivityIndicator size="small" color="black" />
            ) : error ? (
              <Ionicons name="alert" size={25} color="blue" />
            ) : (
            <View style={{position : "absolute",bottom : -14,left : -13}}>
              <FontAwesome6 name="location-arrow" size={25} color={theme.text} />
              </View>
            )}
          </TouchableOpacity>
        </View>}

        {!addingNewRestaurant && !replacingNewRestaurant && <View style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: theme.background,
          borderRadius: 50,
          padding: 0,
          width: 50,
          height: 50,
          zIndex: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <TouchableOpacity onPress={() => handlePlusButtonPress()}>
            
              <FontAwesome6 name="plus" size={25} color={theme.text} />
            
          </TouchableOpacity>
        </View>}

        {(addingNewRestaurant|| replacingNewRestaurant) && <View style={{
          position: 'absolute',
          bottom: 20,
          alignSelf : "center",
          borderRadius: 50,
          padding: 10,
          zIndex: 1,
          width: "80%",
          flexDirection : "row",
          justifyContent: "space-around",
          alignItems: 'center',
        }}>
            <TouchableOpacity onPress={() => {

              if(addingNewRestaurant){
              setAddingNewRestaurant(false)}
              else{setReplacingNewRestaurant(false)}
              
              }}>
            <View style={{flexDirection : 'row',alignItems : "center",
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 5,
                backgroundColor: theme.background,
                borderRadius: 15,
                padding: 15,

            }}>
              <FontAwesome name="times" size={15} color={theme.gray} />
              <Text style={{marginLeft : 5,color : theme.gray, fontSize : 16, fontFamily : "Inter-Bold"}}>Annuler</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleValidation()}>
            <View style={{flexDirection : 'row',alignItems : "center",
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation: 5,
                backgroundColor: theme.blue,
                borderRadius: 15,
                padding: 15,
                marginLeft : 0
            }}>
              <FontAwesome name="check" size={15} color={"white"} />
              <Text style={{marginLeft : 5,color : "white", fontSize : 16, fontFamily : "Inter-Bold"}}>Placer</Text>
            </View>
          </TouchableOpacity>
          
        </View>}
      </GestureHandlerRootView>
    );
  };
  





const ModalMarker = ({ selectedMarkerId, closeModal, animatedHeight,setReplacingNewRestaurant }) => {

    // if images[selectedMarker.type] is not found, use the default image : images["default"]

    const { restaurants,updateRestaurant } = useRestaurant();

    let selectedMarker = restaurants.find((r) => r.id === selectedMarkerId);


    const image = !selectedMarker ? images["default"] : images[selectedMarker.type] || images["default"];


    // const image = images[selectedMarker.image];
    const { theme } = useTheme();

    const insets = useSafeAreaInsets();
    const navigation = useNavigation();


    const [dishData, setDishData] = useState([]);
    const [selectedDish, setSelectedDish] = useState(null);
    const translateX = useSharedValue(0);

    const backButtonOpacity = useSharedValue(0);

    const [isModalExpanded, setIsModalExpanded] = useState(false);

    const [isReviewMenueModalVisible, setIsReviewMenueModalVisible] = useState(false);
    const [isMenueModalVisible, setIsMenueModalVisible] = useState(false);

    const [isPersonalReview, setIsPersonalReview] = useState(false);

    

    useEffect(() => {
      selectedMarker = restaurants.find((r) => r.id === selectedMarkerId);
    }, [restaurants]);
    
    const openMenueModal = () => {
        setIsMenueModalVisible(true);
      };
    
      const closeMenueModal = () => {
        setIsMenueModalVisible(false);
      };

      const openReviewMenueModal = async (review) => {
        setAvis(review);
        const username = await AsyncStorage.getItem("username");
        if(review.username.toLocaleLowerCase() == username.toLocaleLowerCase()){
          setIsPersonalReview(true);
        }
        else{
          setIsPersonalReview(false);
        }
        setIsReviewMenueModalVisible(true);


        
        };
    const closeReviewMenueModal = () => {
        setIsReviewMenueModalVisible(false);
    };


    useEffect(() => {
        handleBackPress();
    }, [selectedMarker]);


  // Fonction pour déclencher le fade-in
    const showBackButton = () => {
        backButtonOpacity.value = withTiming(1, { duration: 300 });
    };

    const hideBackButton = () => {
        backButtonOpacity.value = withTiming(0, { duration: 200 });
    };

    const backButtonStyle = useAnimatedStyle(() => {
        return { 
        opacity: backButtonOpacity.value,
        };
    });
    const [avis, setAvis] = useState(null);
    


    const expandModal = () => {
        animatedHeight.value = 
        RNAnimated.timing(animatedHeight, { 
            toValue: Dimensions.get('window').height * 3 / 4,
            duration: 300,
            useNativeDriver: false,
          }).start();
          setIsModalExpanded(true);
    };

    const collapseModal = () => {
        animatedHeight.value =
        RNAnimated.timing(animatedHeight, { 
            toValue: Dimensions.get('window').height / 2,
            duration: 300,
            useNativeDriver: false,
          }).start();
            setIsModalExpanded(false);
    }

    useEffect(() => {
      const groupedData = selectedMarker.reviews.reduce((acc, review) => {
          const dishName = review.dish.name; // Utilisez le nom du plat ici
          if (!acc[dishName]) {
              acc[dishName] = { reviews: [], prices: [] };
          }
          acc[dishName].reviews.push(review);
          acc[dishName].prices.push(review.price);
          return acc;
      }, {});
  
      const dishDataArray = Object.keys(groupedData).map(dishName => {
          const prices = groupedData[dishName].prices;
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          
          // Trouvez le premier review pour obtenir d'autres infos sur le dish, comme l'emoji et l'id
          const reviewForDish = groupedData[dishName].reviews[0];
          const dish = reviewForDish.dish;
  
          return {
              dish,  // Contient tout l'objet dish (id, emoji, name)
              nbAvis: groupedData[dishName].reviews.length,
              priceRange: minPrice === maxPrice ? `${minPrice}€` : `${minPrice}€-${maxPrice}€`,
              reviews: groupedData[dishName].reviews
          };
      });
  
      setDishData(dishDataArray);
  }, [selectedMarker]);
  


    const handleReplaceResto = () => 
      {

        closeMenueModal()
        closeModal()
        setReplacingNewRestaurant(true)
        
      }


    const handleDishPress = (dish) => {
        setSelectedDish(dish);
        translateX.value = withTiming(-Dimensions.get('window').width, { duration: 300 });
        showBackButton();
        expandModal();
    };

    const handleBackPress = () => {
        translateX.value = withTiming(0, { duration: 300 }, () => {});
        hideBackButton();
        collapseModal();
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });




    return (
      <PanGestureHandler
        onGestureEvent={(event) => {

          animatedHeight.setValue(
            (isModalExpanded ? 
            (Dimensions.get('window').height * 3 / 4) :
            (Dimensions.get('window').height / 2 ))
            
            - event.nativeEvent.translationY);
        }}
        onHandlerStateChange={(event) => {
          if (event.nativeEvent.state === State.END) {
            if (event.nativeEvent.translationY > 50) {
              closeModal();
            } else {
                RNAnimated.timing(animatedHeight, { 

                toValue: ( isModalExpanded ?Dimensions.get('window').height *  3/ 4 :  Dimensions.get('window').height / 2),
                
                duration: 300,
                useNativeDriver: false,
              }).start();
            }
          }
        }}
      >
        <RNAnimated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: animatedHeight,
            backgroundColor: theme.background,
            padding: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
            zIndex: 2,
          }}
        >
          <Image
            source={image}
            style={{
              width: 130,
              height: 130,
              alignSelf: 'flex-start',
              position: 'absolute',
              top: -90,
              left: 10,
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderColor: 'white',
            }}
          />
          <View style={{justifyContent : "flex-end", alignItems: 'center',paddingTop : 10,paddingRight : 10, flexDirection : "row" }}>
          
          <TouchableOpacity onPress={openMenueModal}>
            <View style={{backgroundColor : "transparent", padding : 2, borderRadius : 50, marginRight : 5}}>
              <Feather name="more-horizontal" size={25} color="gray" />
              </View>
            </TouchableOpacity>
 
            
            <TouchableOpacity onPress={closeModal}>
                <View style={{backgroundColor : theme.light_gray, padding : 2, borderRadius : 50}}>
              <Ionicons name="close" size={22} color="gray" />
                </View> 
            </TouchableOpacity>
 
          </View>
          <View style={{ paddingHorizontal  : 20 }}>

            <View style={{flexDirection:"row",justifyContent : "space-between", alignItems : "flex-end"}}>
            <View>
            <Text style={{ fontFamily : 'Inter-Black', fontSize: 30,  marginTop: 10, color : theme.text }}>{selectedMarker.title} </Text>
            <Text style={{fontFamily : 'Inter-Medium', fontSize: 12, marginTop: -5, color : theme.dark_gray }}>{selectedMarker.type}</Text>
            
            </View>
            {/* <Text style={{color : theme.dark_gray,fontSize : 11}}>Proposé par <Text style={{color : "red"}}>{selectedMarker.author}</Text></Text> */}
            </View>
          {/* Section pour le bouton et les étoiles */}
          <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center',justifyContent :"flex-start" }}>
            
            <View style={{flexDirection : "row",alignItems:"center"}}>
            <Rating
              type='custom'
              ratingColor={theme.yellow}
              ratingBackgroundColor={theme.light_gray}
              startingValue={selectedMarker.ratingAverage}
              imageSize={22}
              readonly
              tintColor={theme.background}
              style={{ marginLeft: 0 }} 
            />
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: theme.dark_gray }}>
                {selectedMarker.reviews.length} avis
            </Text>
            </View>
            <TouchableOpacity onPress={() => 
                {
                    navigation.navigate('AvisView', {idRestaurant : selectedMarker.id, restaurant : selectedMarker}); 

                }}>

             <View style={{alignItems : "center", backgroundColor : theme.light_gray,marginLeft: 10,paddingHorizontal : 7, padding : 4, flexDirection : "row", borderRadius : 7 }} >

              <FontAwesome name="pencil" size={15} color={theme.dark_gray} style={{  }} />
                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: theme.dark_gray, marginLeft : 5 }}>
                    Rédiger un avis
                </Text>
            </View> 
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
            <View style={{alignItems : "center", backgroundColor : theme.light_gray,marginLeft: 10, padding : 4, flexDirection : "row", borderRadius : 7 }} >
                    
                  <Ionicons name="bookmark-outline" size={18} color="gray" style={{  }} />
                 
                 </View>
            </TouchableOpacity>
            
          </View>   
          <Text style={{textAlign : "left", fontFamily : "Inter-Medium",marginTop : 10,color : theme.dark_gray,fontSize : 11}}>Proposé par <Text style={{fontSize : 13,color : theme.red, fontFamily : "Inter-Bold"}}>{selectedMarker.author}</Text></Text>

            <View style={{ borderBottomColor: theme.light_gray, borderBottomWidth: 2, marginBottom: 5,marginTop : 5 }} /> 
            </View>
          {/* Section pour afficher les avis */}




        <View style={{flex : 1 }} >

          <TouchableOpacity 
                onPress={handleBackPress} 
                style={{
                    zIndex : 2,}}
            >
                <Animated.View style={[backButtonStyle,{

                
                    position: 'absolute', 
                    top: 0, 
                    left: 20, 
                    flexDirection: 'row', 
                    alignItems: 'center' ,
                    zIndex : 2,
                    backgroundColor : theme.light_gray,
                    padding : 5,
                    borderRadius : 10,
                    
                }]}>
                <Ionicons name="chevron-back" size={15} color={theme.dark_gray} />
                <Text style={{ zIndex : 2, fontFamily: 'Inter-SemiBold', fontSize: 11, color: theme.dark_gray }}>
                 
                </Text>
                </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity 
                onPress={handleBackPress} 
                style={{
                    zIndex : 2,}}
            >
                <Animated.View style={[backButtonStyle,{

                
                    position: 'absolute', 
                    top: 0, 
                    alignSelf : "center", 
                    flexDirection: 'row', 
                    alignItems: 'center' ,
                    zIndex : 2,
                    
                }]}>
                {selectedDish && <Text style={{ zIndex : 2, fontFamily: 'Inter-SemiBold', fontSize: 16, color: theme.text }}>
                    {selectedDish.dish.emoji} {selectedDish.dish.name}
                </Text>}
                </Animated.View>
            </TouchableOpacity>



          <ScrollView style={{ paddingTop: 10, }}                     
          contentContainerStyle={{ paddingBottom: insets.bottom + 10 }} // Ajuste la valeur pour éviter les bords arrondis/encoches
          >
            <Animated.View style={[animatedStyle,{flexDirection : 'row', width : '200%'}]}>



                        <View style={{ width: '50%' }}>
                            {/* Vue initiale : Liste des plats */}
                            {dishData.map((dishItem, index) => (
                                // <TouchableOpacity key={index} onPress={() => handleDishPress(dishItem)}>
                                //     <View style={{ marginBottom: 15, backgroundColor: theme.light_gray, padding: 10, borderRadius: 10 }}>
                                //         <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.text }}>
                                //             {dishItem.dish} - {dishItem.priceRange}
                                //         </Text>
                                //     </View>
                                // </TouchableOpacity>
                                <TouchableOpacity key={index} onPress={() => handleDishPress(dishItem)}>
                                <View key={index} style={{ marginBottom: 15, backgroundColor : theme.light_gray,paddingVertical : 8,paddingHorizontal : 8,borderRadius : 10,marginHorizontal : 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View>
                                            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.text }}>
                                                {dishItem.dish.emoji} {dishItem.dish.name}
                                            </Text>
                                        </View>
                                        <View style={{ backgroundColor: theme.blue, padding: 2,paddingHorizontal : 4, borderRadius: 5, marginLeft: 3, alignItems: 'center' }}>
                                            <Text style={{ color: "white", fontFamily: 'Inter-SemiBold', fontSize: 13 }}>
                                                {dishItem.priceRange}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{flexDirection : "row",alignItems : "center"}}>
                                        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 11, color: 'gray', textDecorationLine: 'none' }}>
                                            {dishItem.nbAvis + " avis"}
                                        </Text>    
                                        <Ionicons name="chevron-forward" size={20} color="gray" />
                                    
                                    </View>

                                </View>

                                {/* <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'gray', marginVertical: 5 }}>
                                {review.comment}
                                </Text> */}

                                </View>
                                </TouchableOpacity>
                                
                            ))}
                        </View>

            





            <View style={{ paddingHorizontal: 20,width : "50%",marginTop : 20 }}>
            
            {selectedMarker.reviews && selectedDish && selectedMarker.reviews.filter(review => review.dish.name == selectedDish.dish.name  ).map((review, index) => (
              <View key={index} style={{ marginBottom: 10, backgroundColor : theme.light_gray,padding : 5,paddingHorizontal : 8,borderRadius : 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row',marginBottom : 5,marginTop : 5, alignItems: 'center' }}>
                        <View>
                            {/* <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.text }}>
                                {review.emoji} {review.dish}
                            </Text> */}
                            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.text }}>
                                {review.username[0].toUpperCase() + review.username.slice(1)}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: theme.blue, padding: 2,paddingHorizontal : 4, borderRadius: 5, marginLeft: 3, alignItems: 'center' }}>
                            <Text style={{ color: "white", fontFamily: 'Inter-SemiBold', fontSize: 13 }}>
                                {review.price}€
                            </Text>
                        </View>
                    </View>
                    <View style={{marginTop : -10}}>
                        {/* <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 11, color: 'gray', textDecorationLine: 'none' }}>
                            {review.name}
                        </Text> */}


                        <TouchableOpacity onPress={() => openReviewMenueModal(review)}>
                            <Feather name="more-horizontal" size={25} color="gray" />
                        </TouchableOpacity>

                    </View>
                </View>


                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color : theme.dark_gray, marginVertical: 5 }}>
                  {review.comment}
                </Text>
                
                {/* <Rating
                  type='custom'
                  ratingColor='#FFD700'
                  ratingBackgroundColor='#D3D3D3'
                  startingValue={review.rating}
                  imageSize={15}
                  readonly
                  tintColor={theme.light_gray}
                  style={{ alignSelf: 'flex-start' }}
                /> */}
       <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:"space-between" }}>

                <Rating
                            type='custom'
                            ratingColor={theme.yellow}
                            ratingBackgroundColor={theme.gray}
                            startingValue={review.rating}
                            imageSize={20}
                            readonly
                            tintColor={theme.light_gray}
                            style={{ alignSelf: 'flex-start' }}
                            />
                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 12, color: 'gray', marginLeft: 5 }}>
                    {review.date_visite}
                </Text>

                            </View>
              </View>
            ))}
            </View>

            </Animated.View>
          </ScrollView>

          </View>

          <CustomModal
                    visible={isMenueModalVisible}
                    onClose={closeMenueModal}
                    title={selectedMarker.title}
                    options={
                        [
                            { label: "Le restaurant n'est pas bien placé", handle: () => handleReplaceResto() },
                            { label: "Les horraires ont changées", handle: () => console.log("Modifier") },
                            { label: "Le nom ou le type de restaurant est incorrect", handle: () => console.log("Modifier") },
                            { label: "Le restaurant n'existe pas",dangerous : true, handle: () => console.log("Supprimer") },
                        ]}
                />

            
            <CustomModal
                    visible={isReviewMenueModalVisible}
                    onClose={closeReviewMenueModal}
                    title={"Signaler le commentaire"}
                    options={
                        [
                          isPersonalReview && { label:  "Modifer",
                               handle: async  () => {

                                const username = await AsyncStorage.getItem("username");
                                const rating = selectedMarker.ratings.find(rating => rating.username.toLocaleLowerCase() == username.toLocaleLowerCase())?.rating || -1;
                                navigation.navigate("NewAvisView",{EnvoieDirect : true,avisModifier : avis,restaurantId : selectedMarker.id,rating});
                                closeReviewMenueModal()}
                                } ,
                                
                                isPersonalReview && { label: "Supprimer" ,dangerous : true, handle: async () =>{
                              
                                closeReviewMenueModal()
                                try {
                                  const res = await deleteReview(selectedMarker.id,avis.id)
                                  if(res.error)  { throw res.error; }
                                  ToastNotif("Avis supprimé avec succès", "check-circle", theme, "green", 2000);

                                  Haptics.notificationAsync( Haptics.NotificationFeedbackType.Success )
                                  updateRestaurant(selectedMarker.id ,res.newData)
                                  console.log(res.newData)
                              }
                              catch (e) {
                                console.log(e);
                                  ToastNotif("Erreur lors de la suppression de l'avis", "times-circle", theme, theme.red, 3000);
                                  Haptics.notificationAsync( Haptics.NotificationFeedbackType.Error )
                              }
                            } },


                            !isPersonalReview && { label: "Le prix n'est plus correct",
                              handle: async  () => {
                                closeReviewMenueModal()
                                try {
                                  const res = await reportReview(selectedMarker.id,avis.id,{raison : "prix"});
                                  if(res.error)  { 
                                    ToastNotif(res.error, "times-circle", theme, theme.red, 3000);
                                    Haptics.notificationAsync( Haptics.NotificationFeedbackType.Error )
                                    return;
                                   }
                                  ToastNotif("Avis signalé avec succès", "check-circle", theme, "green", 2000);
                                  Haptics.notificationAsync( Haptics.NotificationFeedbackType.Success )
                              }
                              catch (e) {
                                  ToastNotif("Erreur lors du signalement de l'avis", "times-circle", theme, "white", 3000);
                                  Haptics.notificationAsync( Haptics.NotificationFeedbackType.Error )
                              }


                             


                               } },
                               
                            !isPersonalReview && { label: "Le plat n'est plus proposé",
                              handle: async  () => {
                                closeReviewMenueModal()
                                try {
                                  const res = await reportReview(selectedMarker.id,avis.id,{raison : "faux"});
                                  if(res.error)  {
                                    ToastNotif(res.error, "times-circle", theme, theme.red, 3000);
                                    Haptics.notificationAsync( Haptics.NotificationFeedbackType.Error )
                                    return;
                                   }
                                  ToastNotif("Avis signalé avec succès", "check-circle", theme, theme.green, 2000);
                                  Haptics.notificationAsync( Haptics.NotificationFeedbackType.Success )
                              }
                              catch (e) {

                                  ToastNotif( "Erreur lors du signalement de l'avis", "times-circle", theme, theme.red, 3000);
                                  Haptics.notificationAsync( Haptics.NotificationFeedbackType.Error )
                              }
                             


                               } },
                               !isPersonalReview && { label: isPersonalReview ? "Supprimer" : "Le commentaire n'est pas approprié",dangerous : true, handle: async () =>{
                                try {
                                  const res = await reportReview(selectedMarker.id,avis.id,{raison : "insulte"});
                                  if(res.error)  { throw res.error; }
                                  ToastNotif("Avis signalé avec succès", "check-circle", theme, "green", 2000);
                                  Haptics.notificationAsync( Haptics.NotificationFeedbackType.Success )
                              }
                              catch (e) {
                                console.log(e);
                                  ToastNotif("Erreur lors du signalement de l'avis", "times-circle", theme, theme.red, 3000);
                                  Haptics.notificationAsync( Haptics.NotificationFeedbackType.Error )
                              }
                               closeReviewMenueModal()
                              
                           } },
                        ]}
                />   

                



          

        </RNAnimated.View>
      </PanGestureHandler>
    );
  };

const CustomPin = ({ text, theme }) => {

  return (
    <Animated.View style={{
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      paddingVertical : 8,
      paddingHorizontal : 13,justifyContent: 'flex-start', alignItems: 'flex-start', 
      backgroundColor: theme.blue
    }}>
      
      

      <Text style={{  fontFamily: 'Inter-Black', fontSize: 14, color: theme.text }}>{text}</Text>
      
    <View style={{
        width: 0,
        height: 0,
        borderLeftWidth: 20,
        borderRightWidth: 20,
        borderTopWidth: 15,
        bottom: -12,
        position: 'absolute',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: theme.blue,
        alignSelf: 'center',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.5,
        }} />
    </Animated.View>
  );
};




export default App;
