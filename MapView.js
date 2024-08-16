import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Animated, Dimensions, Image, TouchableOpacity, ActivityIndicator,ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { PanGestureHandler, GestureHandlerRootView, State } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Rating } from 'react-native-ratings'; // Importer le composant Rating


const DEFAULT_LOCATION = { latitude: 37.78825, longitude: -122.4324 }; 
const STORAGE_KEY = "lastLocation"; 

const markersData = [
  {
    id: 1,
    title: "Best Tacos",
    description: "This is the description of Marker 1",
    type :"restaurant de tacos",
    coordinate: { latitude: 49.300, longitude: 2.640135858490601 },
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
  const [location, setLocation] = useState(null); // Localisation actuelle
  const [loading, setLoading] = useState(false); // Indicateur de chargement de localisation
  const [error, setError] = useState(null); // Erreur de localisation
  const [storedLocation, setStoredLocation] = useState(null); // Dernière position enregistrée

  const animatedHeight = useRef(new Animated.Value(0)).current;
  const markerPressedRef = useRef(false);

  // Charger la dernière position stockée dans AsyncStorage au démarrage
  useEffect(() => {
    const loadStoredLocation = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        if (value !== null) {
          const savedLocation = JSON.parse(value);
          setStoredLocation(savedLocation);
        } else {
          setStoredLocation(DEFAULT_LOCATION); // Utiliser la position par défaut si aucune position n'est trouvée
        }
      } catch (e) {
        console.log("Erreur lors du chargement de la position stockée", e);
      }
    };

    loadStoredLocation();
  }, []);

  // Obtenir la position actuelle de l'utilisateur
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

      // Stocker la position dans AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentLocation.coords));
      setLoading(false);
      console.log("Position actuelle", currentLocation);
      setStoredLocation(currentLocation.coords); // Mettre à jour la dernière position connue
    } catch (err) {
      setError('Échec de localisation');
      console.log("Erreur lors de la localisation", err);
    } finally {
      setLoading(false);
    }
  };

  // Centrer la carte sur la position actuelle ou enregistrée
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

  // Gestion du clic sur le bouton de localisation
  const handleLocationButtonPress = async () => {
    await getCurrentLocation(); // Chercher la position actuelle
    centerMapOnLocation(); // Centrer la carte sur la localisation
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
      Animated.timing(animatedHeight, {
        toValue: Dimensions.get('window').height / 2,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const closeModal = () => {
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsModalVisible(false);
      setSelectedMarker(null);
    });
  };

  const handleMapPress = () => {
    if (!markerPressedRef.current) {
      closeModal();
    }
    markerPressedRef.current = false;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: storedLocation?.latitude || DEFAULT_LOCATION.latitude,
          longitude: storedLocation?.longitude || DEFAULT_LOCATION.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {markersData.map((marker) => (
          <CustomMarker
            key={marker.id}
            marker={marker}
            handleMarkerPress={handleMarkerPress}
            markerPressedRef={markerPressedRef}
          />
        ))}
      </MapView>

      {selectedMarker && (
        <ModalMarker selectedMarker={selectedMarker} closeModal={closeModal} animatedHeight={animatedHeight} />
      )}

      {/* Bouton de localisation en bas à droite */}
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
        
      <TouchableOpacity
        onPress={ () => {}}
        
      >
       
            
          <FontAwesome6 name="plus" size={35} color="black" />
        
      </TouchableOpacity>
      </View>
      <View style={{
        position: 'absolute',
        bottom: 90,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 50,
        padding: 15,
        width: 60,
        height: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <TouchableOpacity
        onPress={handleLocationButtonPress}
        
      >
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
};

const ModalMarker = ({ selectedMarker, closeModal, animatedHeight }) => {
    const image = images[selectedMarker.image];
  
    return (
      <PanGestureHandler
        onGestureEvent={(event) => {
          animatedHeight.setValue(Dimensions.get('window').height / 2 - event.nativeEvent.translationY);
        }}
        onHandlerStateChange={(event) => {
          if (event.nativeEvent.state === State.END) {
            if (event.nativeEvent.translationY > 50) {
              closeModal();
            } else {
              Animated.timing(animatedHeight, {
                toValue: Dimensions.get('window').height / 2,
                duration: 300,
                useNativeDriver: false,
              }).start();
            }
          }
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: animatedHeight,
            backgroundColor: 'white',
            padding: 20,
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
              width: 100,
              height: 100,
              alignSelf: 'flex-start',
              position: 'absolute',
              top: -50,
              left: 10,
              borderRadius: 20,
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderColor: 'white',
            }}
          />
          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={30} color="gray" />
            </TouchableOpacity>
          </View>
          <Text style={{ fontFamily : 'Inter-Black', fontSize: 30,  marginTop: 10 }}>{selectedMarker.title}</Text>
          <Text style={{fontFamily : 'Inter-Regular', fontSize: 12, marginTop: -5, color : "gray" }}>{selectedMarker.type}</Text>
  
          {/* Section pour le bouton et les étoiles */}
          <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
            {/* Bouton pour rédiger un avis */}
            
            
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 16, color: 'black' }}>
              {selectedMarker.rating}
            </Text>
            <Rating
              type='custom'
              ratingColor='#FFD700'
              ratingBackgroundColor='#D3D3D3'
              startingValue={selectedMarker.rating}
              imageSize={20}
              readonly
              tintColor='white'
              style={{ marginLeft: 5 }}
            />
            <TouchableOpacity onPress={() => {/* Logique pour ouvrir une modale ou un écran de rédaction d'avis */}}>
              <Ionicons name="create-outline" size={24} color="gray" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>

            <View style={{ borderBottomColor: 'lightgray', borderBottomWidth: 1, marginVertical: 15 }} />
  
          {/* Section pour afficher les avis */}
          <ScrollView style={{ marginTop: 10 }}>
            {selectedMarker.reviews && selectedMarker.reviews.map((review, index) => (
              <View key={index} style={{ marginBottom: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent : 'space-between',alignItems : "center" }}>
                
                    <View>
                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: 'black' }}>
                {review.emoji} {review.dish}  {review.price}€
                </Text>
                </View>
                <View>
                    <Text style={{ fontFamily: 'Inter-Regular', fontSize: 12, color: 'gray', textDecorationLine : "none" }}>
                    {review.name}
                    </Text>
                </View>
                </View>

                <Text style={{ fontFamily: 'Inter-Regular', fontSize: 14, color: 'gray', marginVertical: 5 }}>
                  {review.comment}
                </Text>
                
                <Rating
                  type='custom'
                  ratingColor='#FFD700'
                  ratingBackgroundColor='#D3D3D3'
                  startingValue={review.rating}
                  imageSize={15}
                  readonly
                  tintColor='white'
                  style={{ alignSelf: 'flex-start' }}
                />
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </PanGestureHandler>
    );
  };

const CustomMarker = ({ marker, handleMarkerPress, markerPressedRef }) => {
  const image = images[marker.image];

  return (
    <Marker
      coordinate={marker.coordinate}
      onPress={() => handleMarkerPress(marker)}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <Image
        source={image}
        style={{ width: 40, height: 40 }}
      />
    </Marker>
  );
};

export default App;
