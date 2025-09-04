import React, { useRef, useState, useEffect, use } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';

import { Animated as RNAnimated } from 'react-native';
import { Easing as RNEasing } from 'react-native';


import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  interpolate,
  runOnJS,
  Easing,
  withDelay
} from 'react-native-reanimated';

import MapView, { Marker } from 'react-native-maps';
import ClusteredMapView from "react-native-map-clustering";
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
import { useRestaurant } from './context/RestaurantsContext';
import Toast from 'react-native-toast-message';
import BouncyAppear from './components/BouncyAppear';
import { LinearGradient } from 'expo-linear-gradient';


const DEFAULT_LOCATION = { latitude: 37.78825, longitude: -122.4324 }; 
const STORAGE_KEY = "lastLocation"; 



const App = () => {
    const [mapRef, setMapRef] = useState(null);
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


    const locationButtonRotation = useSharedValue(0);
    const mapControlsOpacity = useSharedValue(1);



  
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
  

    const getCurrentLocation = async (first = false) => {
      setLoading(true);
      setError(null);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission refusée');
          if (!first) {
            ToastNotif("Veuillez activer la localisation dans les reglages", "times-circle", theme, theme.red, 3000);
          }
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentLocation.coords));
        setStoredLocation(currentLocation.coords);
        if (loading) {
          centerMapOnLocation();
        }
        setLoading(false);
      } catch (err) {
        setError('Échec de localisation');
        console.log("Erreur lors de la localisation", err);
      } finally {
        setLoading(false);
      }
    };
  
    const centerMapOnLocation = () => {
      if (mapRef && storedLocation) {
        mapRef.animateToRegion({
          latitude: storedLocation.latitude,
          longitude: storedLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    };
  
    const handleLocationButtonPress = async (first = false) => {
      if (loading) {
        setLoading(false);
        locationButtonRotation.value = withSpring(0);
      } else {
        locationButtonRotation.value = withSpring(360, {
          damping: 10,
          stiffness: 100,
        });
        await getCurrentLocation(first);
        setTimeout(() => {
          locationButtonRotation.value = withSpring(0);
        }, 1000);
      }
    };
  
    const handleMarkerPress = (marker) => {
      markerPressedRef.current = true;
      setSelectedMarker(marker);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      setTimeout(() => {
        mapControlsOpacity.value = withTiming(0.3, { duration: 300 });
      }, 0);

      
  
      mapRef.animateToRegion({
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
         // easing: RNEasing.bezier(0.25, 0.46, 0.45, 0.94),

          useNativeDriver: false,
        }).start();
      }
    };
  
    const closeModal = () => {
        RNAnimated.timing(animatedHeight, {
        toValue: 0,
        duration: 200,
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

    
    const animatedLocationButtonStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { rotate: `${locationButtonRotation.value}deg` },
        ],
      };
    });

    const animatedMapControlsStyle = useAnimatedStyle(() => {
      return {
        opacity: mapControlsOpacity.value,
      };
    });

    



  
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MapView
          ref={setMapRef}
          style={{ flex: 1 }}
          key={mapKey}
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
                  borderRadius: 12,
                  shadowColor: selectedMarker?.id === marker.id ? '#007AFF' : '#000',
                  opacity: selectedMarker ? (selectedMarker.id != marker.id ? 0.3 : 1) : 1,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: selectedMarker?.id === marker.id ? 0.4 : 0.25,
                  borderWidth: selectedMarker?.id === marker.id ? 2 : 1,
                  borderColor: selectedMarker?.id === marker.id ? '#007AFF' : 'rgba(0, 0, 0, 0.1)',
                    
                  
                  padding: 5, paddingHorizontal : 8, justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: theme.background,
                
                
                }}>
                  <Image
                    source={image}
                    style={{ width: 70, height: 70, top: -60, left : -15, position: "absolute" }}
                  />
  
                  <View style={{ 
                    position: "absolute", 
                    top: -12, 
                    right: -20,  
                    paddingHorizontal: 6,
                    paddingVertical: 3, 
                    backgroundColor: '#FF3B30', 
                    borderRadius: 8,
                    shadowColor: '#FF3B30',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                  }}>
                    <FontAwesome5 name="fire-alt" size={12} color="white" />
                    <Text style={{ fontFamily: 'Inter-Black', fontSize: 12, color: "white" }}>NEW</Text>
                  </View>
  
                  <Text style={{ marginTop: 5, fontFamily: 'Inter-Black', fontSize: 16, color: theme.text }}>{marker.title} </Text>
                  <Text style={{ fontFamily: 'Inter-Medium', fontSize: 11, marginTop: -2, color: theme.dark_gray }}>{marker.type}</Text>
                  <Rating
                    type='custom'
                    ratingColor={"#FFCC00"}
                    ratingBackgroundColor={theme.light_gray}
                    startingValue={marker.ratingAverage}
                    imageSize={16}
                    readonly
                    tintColor={theme.background}
                    style={{ marginLeft: 0,marginTop: 2 }}
                  />

            <View style={{
                width: 0,
                height: 0,
                 borderLeftWidth: 22,
                borderRightWidth: 22,
                borderTopWidth: 18,
                bottom: -15,

                position: 'absolute',
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: theme.background,
                alignSelf: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 7 },
                shadowOpacity: 0.2,
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
            <View style={{flexDirection : "row",borderRadius : 25,backgroundColor :  theme.background,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 8,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.05)',
            ...(Platform.OS === 'ios' && {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                }),
                paddingVertical : 10, paddingHorizontal : 7,flex : 1,flexGrow : 2}}>
                <Ionicons name="search" size={22} color="#007AFF"/>
                <TextInput placeholderTextColor={theme.dark_gray} ref={searchInputRef} style={{color : theme.text,fontFamily : "Inter-Bold",marginLeft : 5}} placeholder='Recherche...' />
              
            </View>

            <View style={{ flexDirection : "row", alignSelf : "center", justifyContent : "flex-end",alignItems : "center"}}>
            <View style={{
                shadowColor: '#000',
               shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 8,
                backgroundColor : 'rgba(255, 255, 255, 0.95)',
                borderRadius : 20,
                padding : 12,
                marginLeft : 15,
                flexDirection : "row",
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.05)',
                ...(Platform.OS === 'ios' && {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                }),
            }}>
                <TouchableOpacity activeOpacity={0.5} onPress={()=>{setMapType(mapType == "hybridFlyover" ? "standard" : "hybridFlyover")}}>

                    {mapType == "hybridFlyover" ? <Ionicons name="map-outline" size={22} color={"#007AFF"} style={{ }} /> 
                    : <FontAwesome name="globe" size={22} color={"#007AFF"} style={{ }} />
                }

                </TouchableOpacity>

                <View style={{marginHorizontal : 8,borderLeftWidth : 1,borderColor : theme.gray}}/>
                
                <TouchableOpacity activeOpacity={0.5} onPress={()=>navigation.navigate("ReglageView")}>
                <Ionicons name="cog" size={20} color={"#007AFF"} /> 

                    
                </TouchableOpacity>

            </View>
            
            

        </View> 

        </View>


        {authLevel>0 && <View style={{width : "95%",alignItems : "flex-end", justifyContent : "flex-end", marginTop : 5}} >

            <TouchableOpacity 
                      activeOpacity={0.6} 
                      onPress={()=>{navigation.navigate("AdminView")}}
                      style={{
                        shadowColor: '#FF3B30',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                      }}
                    >              
                <View style={{
                            backgroundColor : 'rgba(255, 59, 48, 0.1)', 
                            padding : 12,
                            borderRadius : 18,
                            alignItems : "center",
                            justifyContent : "center",
                            borderWidth: 2,
                            borderColor: '#FF3B30',
                          }}>
            <FontAwesome6 name="shield-cat" size={22} color="#FF3B30" style={{alignSelf : "center" }} />

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
        {!addingNewRestaurant && !replacingNewRestaurant && 
        
        <BouncyAppear style={{
          position: 'absolute',
          bottom: 140,
          right: 25,
          backgroundColor: theme.background,
          borderRadius: 50,
          padding: 0,
          width: 60,
          height: 60,
          zIndex: 1,
          shadowColor: '#007AFF',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 8,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
            ...(Platform.OS === 'ios' && {
              shadowColor: '#007AFF',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
            }),
        }}
        pressScale={1.1}
                    pressable={true}
                    onPress={() => handleLocationButtonPress()}
                    activeOpacity={0.7}
        
        > 
              
        <Animated.View style={[animatedLocationButtonStyle]}>
 
                   {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : error ? (
              <Ionicons name="alert" size={28} color="#FF3B30" />
            ) : (
              <FontAwesome6 name="location-arrow" size={28} color={"#007AFF"} />
            )}
            </Animated.View>
          </BouncyAppear>
       }

        {!addingNewRestaurant && !replacingNewRestaurant &&
        
        
       <BouncyAppear style={{
          position: 'absolute',
          bottom: 70,
          right: 25,
          //backgroundColor: '#007AFF',
          borderRadius: 50,
          padding: 0,
          width: 60,
          height: 60,
          zIndex: 1,
          shadowColor: '#23160aff',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 8,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
            ...(Platform.OS === 'ios' && {
              shadowColor: '#007AFF',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
            }),
        }}
        pressScale={1.1}
                    pressable={true}
                    onPress={() => handlePlusButtonPress()}
                    activeOpacity={0.7}
        
        > 
         <LinearGradient
                      colors={['#448fdfff', 'rgba(3, 67, 135, 1)']}
                      start={{x: 0, y: 0}}
                      end={{x: 0, y: 1}}
                    style={{
                      width : "100%",
                      height : "100%",
                      borderRadius: 50,
                      padding: 0,
                      width: 60,
                      height: 60,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    
                    >
              <FontAwesome5 name="plus" size={28} color={"white"} />
            </LinearGradient>
          </BouncyAppear>
        }

        {(addingNewRestaurant|| replacingNewRestaurant) && <View style={{
          position: 'absolute',
          bottom: 30,
          alignSelf : "center",
          borderRadius: 50,
          padding: 10,
          zIndex: 1,
          width: "85%",
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
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.15,
            shadowRadius: 25,
            elevation: 20,
            zIndex: 2,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.05)',
            ...(Platform.OS === 'ios' && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -5 },
              shadowOpacity: 0.15,
              shadowRadius: 25,
            }),
          }}
        >
          <View style={{
            width: 50,
            height: 5,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 3,
            alignSelf: 'center',
            marginTop: 8,
            marginBottom: 0,
            position: 'absolute',
          }} />

          <BouncyAppear pressable={true} pressScale={1.05} delay={80}>
            <View style={{width: 130,
              height: 130,top: -90,
              left: 10,position: 'absolute',
                justifyContent: 'center', alignItems: 'center',
                display : "flex"
              }}>
          <Image
            source={image}
            style={{
              width: 130,
              height: 130,
              alignSelf: 'center',
           
            }}
          />
          </View>
          </BouncyAppear>
          <View style={{justifyContent : "flex-end", alignItems: 'center',
            paddingTop : 15,paddingRight : 15, 
            flexDirection : "row" }}>
          
          <BouncyAppear delay={120} pressable={true} onPress={openMenueModal}>
            <View style={{backgroundColor : "transparent", padding : 2, borderRadius : 50, marginRight : 5}}>
              <Feather name="more-horizontal" size={25} color="gray" />
              </View>
            </BouncyAppear>
 
            
            <BouncyAppear delay={140} pressable={true} onPress={closeModal}>
                <View style={{backgroundColor : theme.light_gray, padding : 2, borderRadius : 50}}>
              <Ionicons name="close" size={22} color="gray" />
                </View> 
            </BouncyAppear>
 
          </View>
          <View style={{ paddingHorizontal  : 20 }}>

            <View style={{flexDirection:"row",justifyContent : "space-between", alignItems : "flex-end"}}>
            <View>
              <BouncyAppear delay={160} pressable={true}>
            <Text style={{ fontFamily : 'Inter-Black', fontSize: 30,letterSpacing : -0.5,  marginTop: 0, color : theme.text }}>{selectedMarker.title} </Text>
            </BouncyAppear>
              <BouncyAppear delay={190} pressable={true}>

            <Text style={{fontFamily : 'Inter-Medium', fontSize: 14,letterSpacing : -0.2, marginTop: -5, color : theme.dark_gray }}>{selectedMarker.type}</Text>
            </BouncyAppear>
            </View>
            {/* <Text style={{color : theme.dark_gray,fontSize : 11}}>Proposé par <Text style={{color : "red"}}>{selectedMarker.author}</Text></Text> */}
            </View>
          {/* Section pour le bouton et les étoiles */}
          <View style={{ flexDirection: 'row', marginTop: 10,flexWrap: 'wrap', alignItems: 'center',justifyContent :"flex-start" }}>
            
            <View style={{flexDirection : "row",alignItems:"center"}}>
            
            <BouncyAppear delay={210} pressable={true}>

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
            </BouncyAppear>
            
            <BouncyAppear delay={230} pressable={true}>

            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: theme.dark_gray }}>
                {selectedMarker.reviews.length} avis
            </Text>
            </BouncyAppear>
            </View>
            
            
            <View style={{ width: '100%', flexDirection: 'row', marginTop: 5, justifyContent : "flex-start",
              alignItems : "center",flexWrap: 'wrap' }}>

            <BouncyAppear delay={250} pressable={true} onPress={() => 
                {
                    navigation.navigate('AvisView', {idRestaurant : selectedMarker.id, restaurant : selectedMarker}); 

                }}
                
                style={{
                shadowColor: '#007AFF',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3,
                marginRight: 10,
                marginBottom: 2,
                marginTop: 5,
                justifyContent : "center",
              alignItems : "center",
                ...(Platform.OS === 'ios' && {
                  shadowColor: '#007AFF',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                })
            }}
                >

             <View style={{alignItems : "center", backgroundColor : '#007AFF',marginLeft: 0,
              paddingHorizontal : 10, padding : 6,justifyContent : "center",
              alignItems : "center",
               flexDirection : "row", borderRadius : 20 }} >

              <FontAwesome name="pencil" size={15} color={"white"} style={{  }} />
                <Text style={{ 
                  
                  fontFamily: 'Inter-SemiBold', 
                fontSize: 15, 
                color: "white", 
                marginLeft : 6,
                textShadowColor: 'rgba(0,0,0,0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
                 }}>
                    Rédiger un avis
                </Text>
            </View> 
            </BouncyAppear>
            <BouncyAppear delay={270} pressable={true}
              onPress={() => {}}
              activeOpacity={0.7}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
                marginBottom: 0,
                justifyContent : "center",
              alignItems : "center",
                ...(Platform.OS === 'ios' && {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }),
              }}
            >
            <View style={{
              alignItems : "center", 
              backgroundColor : 'rgba(0, 0, 0, 0.05)',
              paddingVertical: 6,
              paddingHorizontal: 8, 
              flexDirection : "row", 
              borderRadius : 20,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.1)',
              justifyContent : "center",
              alignItems : "center",
            }} >                  
              <Ionicons name="bookmark-outline" size={18} color="#007AFF" style={{}} />             
            </View>
            </BouncyAppear>
            </View>
          </View>   
          <BouncyAppear delay={290} pressable={true} style={{alignSelf : "flex-start"}}>
          <Text style={{textAlign : "center", fontFamily : "Inter-Medium",marginTop : 10,color : theme.dark_gray,fontSize : 11}}>Proposé par <Text style={{fontSize : 13,color : theme.red, fontFamily : "Inter-Bold"}}>{selectedMarker.author}</Text></Text>
            </BouncyAppear>
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
                               <BouncyAppear pressable={true} delay={index*50 + 300} 
                                  key={index} 
                                  onPress={() => handleDishPress(dishItem)}
                                  activeOpacity={0.7}
                                  style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 8,
                                    elevation: 2,
                                    marginBottom: 12,
                                    ...(Platform.OS === 'ios' && {
                                      shadowColor: '#000',
                                      shadowOffset: { width: 0, height: 2 },
                                      shadowOpacity: 0.05,
                                      shadowRadius: 8,
                                    }),
                                  }}
                                >
                                <View key={index} style={{ 
                                  backgroundColor : 'rgba(255, 255, 255, 0.8)',
                                  paddingVertical : 16,
                                  paddingHorizontal : 20,
                                  borderRadius : 20,
                                  marginHorizontal : 20,
                                  borderWidth: 1,
                                  borderColor: 'rgba(0, 0, 0, 0.05)',
                                }}>
                                
                                
                                
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                     <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ 
                                              fontFamily: 'Inter-Bold', 
                                              fontSize: 17, 
                                              color: theme.text,
                                              letterSpacing: -0.3,
                                            }}>
                                                {dishItem.dish.emoji}  {dishItem.dish.name}
                                            </Text>
                                        </View>
                                        <View style={{ 
                                          backgroundColor: '#007AFF', 
                                          paddingVertical: 4,
                                          paddingHorizontal : 10, 
                                          borderRadius: 12, 
                                          marginLeft: 8, 
                                          alignItems: 'center',
                                          shadowColor: '#007AFF',
                                          shadowOffset: { width: 0, height: 2 },
                                          shadowOpacity: 0.3,
                                          shadowRadius: 4,
                                          elevation: 3,
                                        }}>
                                            <Text style={{ 
                                              color: "white", 
                                              fontFamily: 'Inter-Bold', 
                                              fontSize: 14,
                                              textShadowColor: 'rgba(0,0,0,0.2)',
                                              textShadowOffset: { width: 0, height: 1 },
                                              textShadowRadius: 2,
                                            }}>
                                                {dishItem.priceRange}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{flexDirection : "row",alignItems : "center", marginLeft: 12}}>
                                        <Text style={{ 
                                          fontFamily: 'Inter-Medium', 
                                          fontSize: 12, 
                                          color: '#8E8E93', 
                                          textDecorationLine: 'none' 
                                        }}>
                                            {dishItem.nbAvis + " avis"}
                                        </Text>    
                                        <Ionicons name="chevron-forward" size={18} color="#8E8E93" style={{ marginLeft: 4 }} />
                                    
                                    </View>

                                </View>

                                {/* <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'gray', marginVertical: 5 }}>
                                {review.comment}
                                </Text> */}

                                </View>
                                </BouncyAppear>
                                
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
