import React, { useRef, useState, useEffect } from 'react';
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

import  { Marker } from 'react-native-maps';
import MapView from "react-native-map-clustering";

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

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


import { images } from './config/ImagesRestaurant';



import ModalRestaurant from './ModalRestaurant';

import * as Haptics from 'expo-haptics';

import {AuthContext} from './context/AuthProvider';

import  CustomModal from './components/ModalMenue';
import { useRestaurant } from './context/RestaurantsContext';
import Toast from 'react-native-toast-message';
import BouncyAppear from './components/BouncyAppear';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ShineWrapper from './components/ShineWrapper';

import ModalMarker from './ModalMarker';


const DEFAULT_LOCATION = { latitude: 37.78825, longitude: -122.4324 }; 
const STORAGE_KEY = "lastLocation"; 



const App = () => {
    
  
    const mapRef = useRef();



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
        mapRef.current.animateToRegion({
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

      mapRef.current.animateToRegion({
        latitude: marker.coordinate.coordinates[1] - 0.0001,
        longitude: marker.coordinate.coordinates[0],
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      }, 500);

      if (!isModalVisible) {
        setTimeout(() => {
          setIsModalVisible(true);
          RNAnimated.timing(animatedHeight, {
            toValue: Dimensions.get('window').height / 2,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }, 1000); // Attend la fin de l'animation de la carte
      }
    };
  
    const closeModal = () => {
        // Animation de dézoom de la carte avant de fermer le modal
        if (selectedMarker && mapRef) {
          mapRef.current.animateToRegion({
            latitude: selectedMarker.coordinate.coordinates[1],
            longitude: selectedMarker.coordinate.coordinates[0],
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }, 600);
        }
        RNAnimated.timing(animatedHeight, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }).start(() => {
          setIsModalVisible(false);
          setSelectedMarker(null);
        }) ;

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
          ref={mapRef}
          mapRef={(ref) => { mapRef.current = ref; }}
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
                <BouncyAppear pressable={true}  activeOpacity={0.5} onPress={()=>{setMapType(mapType == "hybridFlyover" ? "standard" : "hybridFlyover")}}>

                    {mapType == "hybridFlyover" ? <Ionicons name="map-outline" size={22} color={"#007AFF"} style={{ }} /> 
                    : <FontAwesome name="globe" size={22} color={"#007AFF"} style={{ }} />
                }

                </BouncyAppear>

                <View style={{marginHorizontal : 8,borderLeftWidth : 1,borderColor : theme.gray}}/>
                
                <BouncyAppear pressable={true}  activeOpacity={0.5} onPress={()=>navigation.navigate("ReglageView")}>
                <Ionicons name="cog" size={20} color={"#007AFF"} /> 

                    
                </BouncyAppear>

            </View>
            
            

        </View> 

        </View>


        {authLevel>0 && <View style={{width : "95%",alignItems : "flex-end", justifyContent : "flex-end", marginTop : 5}} >

            <BouncyAppear pressable={true}  
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

        </BouncyAppear>
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
            <BouncyAppear pressable={true}  onPress={() => {

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
          </BouncyAppear>

          <BouncyAppear pressable={true}  onPress={() => handleValidation()}>
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
          </BouncyAppear>
          
        </View>}
      </GestureHandlerRootView>
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
