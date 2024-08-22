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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context';
import { ToastObj } from './Utils';
import { Rating } from 'react-native-ratings'; // Importer le composant Rating
import { useTheme } from './context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';


import MapView from "react-native-map-clustering";
import { useRestaurant } from './context/RestaurantsContext';


const DEFAULT_LOCATION = { latitude: 37.78825, longitude: -122.4324 }; 
const STORAGE_KEY = "lastLocation"; 

const markersData = [
  {
    id: 1,
    title: "Best Tacos",
    description: "This is the description of Marker 1",
    type :"restaurant de tacos",
    coordinate: { latitude: 49.300, longitude: 2.641135858490601 },
    image: "maison",
    rating: 4.5,
    reviews: [
        {
          name: "Jean Dupont",
          dish: "Boeuf Bourguignon",
          price: 25,
          comment: "Le boeuf était parfaitement cuit, tendre et savoureux. L'accompagnement de légumes était délicieux.",
          rating: 4.5,
          emoji: "🥩"
        },
        {
          name: "Marie Martin",
          dish: "Coq au Vin",
          price: 22,
          comment: "Un plat classique, mais avec une touche moderne. Les saveurs étaient bien équilibrées.",
          rating: 4,
          emoji: "🌯"
        },
        {
          name: "Pierre Lefèvre",
          dish: "Tarte Tatin",
          price: 8,
          comment: "Dessert excellent, mais la pâte aurait pu être un peu plus croustillante.",
          rating: 4.5,
          emoji: "🥗"
        },
        {
          name: "Sophie Durand",
          dish: "Ratatouille",
          price: 18,
          comment: "Délicieuse ratatouille, pleine de saveurs et de fraîcheur. Très généreuse en portion.",
          rating: 5,
          emoji: "🥩"
        },
      ],
  },
  {
    id: 2,
    title: "Tikka",
    description: "This is the description of Marker 2",
    type : "restaurant indien",
    coordinate: { latitude: 49.3005, longitude: 2.640 },
    image: "cafe",
    rating: 4,
    reviews: [
        {
          name: "Jean Dupont",
          dish: "Boeuf Bourguignon",
          price: 25,
          comment: "Le boeuf était parfaitement cuit, tendre et savoureux. L'accompagnement de légumes était délicieux.",
          rating: 4.5,
          emoji: "🥩"
        },
        {
          name: "Marie Martin",
          dish: "Coq au Vin",
          price: 22,
          comment: "Un plat classique, mais avec une touche moderne. Les saveurs étaient bien équilibrées.",
          rating: 4,
          emoji: "🥩"
        },
        {
          name: "Pierre Lefèvre",
          dish: "Tarte Tatin",
          price: 8,
          comment: "Dessert excellent, mais la pâte aurait pu être un peu plus croustillante.",
          rating: 4.5,
          emoji: "🥩"
        },
        {
          name: "Sophie Durand",
          dish: "Ratatouille",
          price: 18,
          comment: "Délicieuse ratatouille, pleine de saveurs et de fraîcheur. Très généreuse en portion.",
          rating: 5,
          emoji: "🥩"
        },
      ],
  },
];

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

    const insets = useSafeAreaInsets();


  
    useEffect(() => {
      setMarkers(restaurants); // Mettre à jour les marqueurs quand les restaurants changent
      console.log("Restaurants mis à jour");
      forceRerender();
    }, [restaurants]);
  
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
          handleLocationButtonPress();
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
          setLoading(false);
          return;
        }
  
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentLocation.coords));
        setLoading(false);
        setStoredLocation(currentLocation.coords);
        centerMapOnLocation();
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
  
    const handleLocationButtonPress = async () => {
      await getCurrentLocation();
      if (storedLocation) {
        centerMapOnLocation();
      }
    };
  
    const handleMarkerPress = (marker) => {
      markerPressedRef.current = true;
      setSelectedMarker(marker);
  
      mapRef.current.animateToRegion({
        latitude: marker.coordinate.latitude - 0.0005,
        longitude: marker.coordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
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
  
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          key={mapKey}
          initialRegion={{
            latitude: storedLocation?.latitude || DEFAULT_LOCATION.latitude,
            longitude: storedLocation?.longitude || DEFAULT_LOCATION.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
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
          {
            markers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                onPress={() => handleMarkerPress(marker)}
                zIndex={selectedMarker ? (selectedMarker.id == marker.id ? 3 : 2) : 2}
              >
                <View style={{
                  borderRadius: 5,
                  shadowColor: '#000',
                  opacity: selectedMarker ? (selectedMarker.id != marker.id ? 0.3 : 1) : 1,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  padding: 5, justifyContent: 'flex-start', alignItems: 'flex-start', backgroundColor: theme.background
                }}>
                  <Image
                    source={images[marker.image]}
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
                    startingValue={marker.rating}
                    imageSize={15}
                    readonly
                    tintColor={theme.background}
                    style={{ marginLeft: 0 }}
                  />
                </View>
              </Marker>
            ))
          }
        </MapView>
  
        {selectedMarker && (
          <ModalMarker
            selectedMarker={selectedMarker}
            closeModal={closeModal}
            animatedHeight={animatedHeight}
          />
        )} 
  
        <View style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: theme.background,
          borderRadius: 50,
          padding: 0,
          width: 60,
          height: 60,
          zIndex: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <TouchableOpacity onPress={handleLocationButtonPress}>
            {loading ? (
              <ActivityIndicator size="small" color="black" />
            ) : error ? (
              <Ionicons name="alert" size={30} color="red" />
            ) : (
              <FontAwesome6 name="location-crosshairs" size={30} color="black" />
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection : "row", alignSelf : "center",alignItems : "center",position : "absolute",top : insets.top, width : "90%"}}>
            <View style={{flexDirection : "row",borderRadius : 15,backgroundColor :  theme.background,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
                paddingVertical : 10, paddingHorizontal : 7,flex : 1,flexGrow : 2}}>
                <Ionicons name="search" size={20} color={theme.dark_gray}/>
                <TextInput placeholderTextColor={theme.dark_gray} ref={searchInputRef} style={{color : theme.text,fontFamily : "Inter-Bold", marginLeft : 5}} placeholder='Recherche...' />
            </View>
            <TouchableOpacity activeOpacity={0.5} onPress={()=>navigation.navigate("ReglageView")}>
            <View style={{marginLeft : 5,
                
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
            }}>
                 <Ionicons name="cog" size={33} color={theme.background} /> 
            </View>
            </TouchableOpacity>
        </View>
        
    
  
        {/* {selectedMarker && (
          <ModalMarker
            selectedMarker={selectedMarker}
            closeModal={closeModal}
            animatedHeight={animatedHeight}
          />
        )} */}
  
        {/* Bouton de localisation */}
        <View style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: 'white',
          borderRadius: 50,
          padding: 0,
          width: 60,
          height: 60,
          zIndex: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 5,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <TouchableOpacity onPress={handleLocationButtonPress}>
            {loading ? (
              <ActivityIndicator size="small" color="black" />
            ) : error ? (
              <Ionicons name="alert" size={30} color="red" />
            ) : (
              <FontAwesome6 name="location-crosshairs" size={30} color="black" />
            )}
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    );
  };
  

const images = {
  maison: require('./assets/images/logo_maison.png'),
  cafe: require('./assets/images/logo_cafe.png'),
  tacos : require('./assets/images/logo_tacos.png'),
  indien : require('./assets/images/logo_indien.png'),
};





const ModalMarker = ({ selectedMarker, closeModal, animatedHeight }) => {
    const image = images[selectedMarker.image];
    const { theme } = useTheme();

    const insets = useSafeAreaInsets();
    const navigation = useNavigation();


    const [dishData, setDishData] = useState([]);
    const [selectedDish, setSelectedDish] = useState(null);
    const translateX = useSharedValue(0);

    const backButtonOpacity = useSharedValue(0);

    const [isModalExpanded, setIsModalExpanded] = useState(false);

  // Fonction pour déclencher le fade-in
    const showBackButton = () => {
        backButtonOpacity.value = withTiming(1, { duration: 500 });
    };

    const hideBackButton = () => {
        backButtonOpacity.value = withTiming(0, { duration: 200 });
    };

    const backButtonStyle = useAnimatedStyle(() => {
        return {
        opacity: backButtonOpacity.value,
        };
    });

    


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
            if (!acc[review.dish]) {
                acc[review.dish] = { reviews: [], prices: [] };
            }
            acc[review.dish].reviews.push(review);
            acc[review.dish].prices.push(review.price);
            return acc;
        }, {});

        const dishDataArray = Object.keys(groupedData).map(dish => {
            const prices = groupedData[dish].prices;
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            return {
                dish,
                emoji : selectedMarker.reviews.find(review => review.dish === dish).emoji,
                nbAVis : groupedData[dish].reviews.length,
                priceRange: minPrice === maxPrice ? `${minPrice}€` : `${minPrice}€-${maxPrice}€`,
                reviews: groupedData[dish].reviews
            };
        });
        console.log(dishDataArray);
        setDishData(dishDataArray);
    }, [selectedMarker]);




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
          
          <TouchableOpacity onPress={()=>{}}>
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
              ratingColor={"#FFC300"}
              ratingBackgroundColor={theme.light_gray}
              startingValue={selectedMarker.rating}
              imageSize={22}
              readonly
              tintColor={theme.background}
              style={{ marginLeft: 0 }} 
            />
            <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: theme.dark_gray }}>
                12 avis
            </Text>
            </View>
            <TouchableOpacity onPress={() => 
                {
                    navigation.navigate('AvisView'); 

                }}>

             <View style={{alignItems : "center", backgroundColor : theme.light_gray,marginLeft: 10, padding : 4, flexDirection : "row", borderRadius : 7 }} >

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
          <Text style={{textAlign : "left", fontFamily : "Inter-Medium",marginTop : 10,color : theme.dark_gray,fontSize : 11}}>Proposé par <Text style={{color : theme.red}}>{selectedMarker.author}</Text></Text>

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
                <Text style={{ zIndex : 2, fontFamily: 'Inter-SemiBold', fontSize: 16, color: theme.text }}>
                    {selectedDish.emoji} {selectedDish.dish}
                </Text>
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
                                                {dishItem.emoji} {dishItem.dish}
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
                                            {dishItem.nbAVis + " avis"}
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
            
            {selectedMarker.reviews && selectedDish && selectedMarker.reviews.filter(review => review.dish == selectedDish.dish  ).map((review, index) => (
              <View key={index} style={{ marginBottom: 15, backgroundColor : theme.light_gray,padding : 5,paddingHorizontal : 8,borderRadius : 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View>
                            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.text }}>
                                {review.emoji} {review.dish}
                            </Text>
                        </View>
                        <View style={{ backgroundColor: theme.blue, padding: 2,paddingHorizontal : 4, borderRadius: 5, marginLeft: 3, alignItems: 'center' }}>
                            <Text style={{ color: "white", fontFamily: 'Inter-SemiBold', fontSize: 13 }}>
                                {review.price}€
                            </Text>
                        </View>
                    </View>
                    <View>
                        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 11, color: 'gray', textDecorationLine: 'none' }}>
                            {review.name}
                        </Text>
                    </View>
                </View>


                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'gray', marginVertical: 5 }}>
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
              </View>
            ))}
            </View>

            </Animated.View>
          </ScrollView>

          </View>







        </RNAnimated.View>
      </PanGestureHandler>
    );
  };

const CustomMarker = ({ marker, handleMarkerPress }) => {
  const image = images[marker.image];

  return (
        <Marker
            coordinate={marker.coordinate}
            onPress={() => handleMarkerPress(marker)}
            anchor={{ x: 0.5, y: 0 }}
            >
        <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
            <Image 
            source={require('./assets/images/marker.png')}
            style={{ width: 40, height: 40, position: 'absolute' }}
            />
            <Image
            source={image}
            style={{ width: 25, height: 25, position: 'absolute',top : -2 }}
            />
        </View>
    </Marker>
  );
};

export default App;
