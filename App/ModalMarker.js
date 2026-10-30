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

import stylesSimple from './components/SimpleStyle';

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


const DEFAULT_LOCATION = { latitude: 37.78825, longitude: -122.4324 }; 
const STORAGE_KEY = "lastLocation"; 





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


    //  const forceRerender = () => {
    //     setMapKey(prevKey => (prevKey === 'map1' ? 'map2' : 'map1'));
    //   };

    const openMenueModal = () => {
        setIsMenueModalVisible(true);
        // setTimeout(() => {
        //   forceRerender();
        // }, 300); 
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

  const shineRef = useRef();


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


            <ShineWrapper
                variant="highlight"
                mode="inside"
                spawnIntervalRange={[4000, 5000
                ]}
                spawnPerInterval={1}
                maxConcurrent={1}
                roundness={0.4}
              >
                <BouncyAppear delay={250} pressable={true} onPress={() => 
                    {
                        navigation.navigate('AvisView', {idRestaurant : selectedMarker.id, restaurant : selectedMarker}); 

                    }}
                    
                    style={[{
                    
                    marginRight: 10,
                    marginBottom: 2,
                    marginTop: 5,
                    justifyContent : "center",

                },stylesSimple.blueButtonContainer]}
                    >

                <View style={[{alignItems : "center",marginLeft: 0,
                  paddingHorizontal : 10, padding : 6,justifyContent : "center",
                  alignItems : "center",
                  flexDirection : "row", borderRadius : 20 },
                  
                  stylesSimple.blueButton]} >

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
            </ShineWrapper>
            <ShineWrapper
              variant="highlight"
              mode="edges"
              minStars={6}
              maxConcurrent={20}
              active={false}
              ref={shineRef}
            >
            <BouncyAppear delay={270} pressable={true}
              onPress={() => {shineRef.current.burst(10);}}
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
            </ShineWrapper>
            </View>
          </View>   
          <BouncyAppear delay={290} pressable={true} style={{alignSelf : "flex-start"}}>
          <Text style={{textAlign : "center", fontFamily : "Inter-Medium",marginTop : 10,color : theme.dark_gray,fontSize : 11}}>Proposé par <Text style={{fontSize : 13,color : theme.red, fontFamily : "Inter-Bold"}}>{selectedMarker.author}</Text></Text>
            </BouncyAppear>
            <View style={{ borderBottomColor: theme.light_gray, borderBottomWidth: 2, marginBottom: 5,marginTop : 5 }} /> 
            </View>
          {/* Section pour afficher les avis */}




        <View style={{flex : 1 }} >

          <BouncyAppear pressable={true}  
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
            </BouncyAppear>

            <BouncyAppear pressable={true} 
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
            </BouncyAppear>



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

            {selectedMarker.reviews && selectedDish && selectedMarker.reviews.filter(review => review.dish.name == selectedDish.dish.name).map((review, index) => (
              <View
                key={index}
                style={{
                  marginBottom: 16,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  paddingVertical: 18,
                  paddingHorizontal: 18,
                  borderRadius: 22,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.04)',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter-Bold', fontSize: 16, color: theme.text, letterSpacing: -0.2 }}>
                      {review.username[0].toUpperCase() + review.username.slice(1)}
                    </Text>
                    <View style={{
                      backgroundColor: theme.blue,
                      paddingVertical: 3,
                      paddingHorizontal: 10,
                      borderRadius: 10,
                      marginLeft: 8,
                      alignItems: 'center',
                      shadowColor: theme.blue,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.18,
                      shadowRadius: 4,
                      elevation: 2,
                    }}>
                      <Text style={{ color: 'white', fontFamily: 'Inter-Bold', fontSize: 14 }}>
                        {review.price}€
                      </Text>
                    </View>
                  </View>
                  <BouncyAppear
                    pressable={true}
                    pressScale={1.2}
                    onPress={() => openReviewMenueModal(review)}
                    style={{ padding: 4, borderRadius: 50, backgroundColor: 'rgba(0,0,0,0.04)' }}
                  >
                    <Feather name="more-horizontal" size={22} color="#8E8E93" />
                  </BouncyAppear>
                </View>

                <Text style={{ fontFamily: 'Inter-Medium', fontSize: 15, color: theme.dark_gray, marginVertical: 8, lineHeight: 21 }}>
                  {review.comment}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <Rating
                    type='custom'
                    ratingColor={theme.yellow}
                    ratingBackgroundColor={theme.gray}
                    startingValue={review.rating}
                    imageSize={22}
                    readonly
                    tintColor={"white"}
                    style={{ alignSelf: 'flex-start' }}
                  />
                  <Text style={{ fontFamily: 'Inter-Medium', fontSize: 13, color: '#8E8E93', marginLeft: 8 }}>
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
                            { label: "Le restaurant n'est pas bien placé caca", handle: () => handleReplaceResto(), icon : <FontAwesome6 name="location-dot" size={24} color="black" /> },
                            { label: "Les horraires ont changées", handle: () => console.log("Modifier"),icon : <FontAwesome6 name="clock-four" size={24} color="black" /> },
                            { label: "Le nom ou le type de restaurant est incorrect", handle: () => console.log("Modifier"), icon : <FontAwesome6 name="pen" size={24} color="black" /> },
                            { label: "Le restaurant n'existe pas",dangerous : true, handle: () => console.log("Supprimer"), icon : <FontAwesome6 name="trash" size={24} color="red" /> },
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


  export default ModalMarker;