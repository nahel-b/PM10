import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { PanGestureHandler, GestureHandlerRootView, State, TextInput } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from  '@expo/vector-icons/FontAwesome';

import { Rating } from 'react-native-ratings';
import { useTheme } from '../context/ThemeContext';

import { useRestaurant } from '../context/RestaurantsContext';

import { useNavigation,useRoute } from '@react-navigation/native';
import BouncyAppear from '../components/BouncyAppear';


import CustomModal from '../ModalMenue';
import { SendRatingRestaurant,deleteReview } from '../Api';
import Toast from 'react-native-toast-message';
import { ToastNotif } from '../Utils';
import { LinearGradient } from 'expo-linear-gradient';



// import NewAvisView from './NewAvisView';


export default AvisViewPrincipal = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { updateRestaurant,restaurants } = useRestaurant();
    const insets = useSafeAreaInsets();

    const idRestaurant = route.params.idRestaurant || [];
    const [reviewsData, setReviewData] = useState(null);

    const restaurant = restaurants.find(restaurant => restaurant.id == idRestaurant);
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [ratingnote, setRating] = useState(0);
    const [avis, setAvis] = useState(null);

    const [username, setUsername] = useState("username");

    useEffect( () => {
        AsyncStorage.getItem('username').then((value) => setUsername(value));
       
        setReviewData(restaurant.reviews.filter(review => review.username.toLocaleLowerCase() == username.toLocaleLowerCase()))
        setRating(restaurant.ratings.find(rating => rating.username.toLocaleLowerCase() == username.toLocaleLowerCase())?.rating || 0)
        console.log("note", restaurant.ratings.find(rating => rating.username.toLocaleLowerCase() == username.toLocaleLowerCase())?.rating || 0)
        
    }, []);

    useEffect(() => {
        console.log("refresh")
        setReviewData(restaurant.reviews.filter(review => review.username.toLocaleLowerCase() == username.toLocaleLowerCase()))
        setRating(restaurant.ratings.find(rating => rating.username.toLocaleLowerCase() == username.toLocaleLowerCase())?.rating || 0)

    }, [username]);

    useEffect(() => {

            setReviewData(restaurant.reviews.filter(review => review.username.toLocaleLowerCase() == username.toLocaleLowerCase()))
       
    }, [restaurant]);



    const openModal = (avis) => {
        setAvis(avis);
      setIsModalVisible(true);
    };
  
    const closeModal = () => {
      setIsModalVisible(false);
    };
  
    const HandleFeedback = async (rating) => 
        {   
            if(rating <= 0)
                {
                    ToastNotif("Veuillez noter au dessus de zéro", "times-circle", theme, theme.red, 3000);
                    Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Error
                      )
                    return;
                }
            try {
            const res = await SendRatingRestaurant(restaurant.id,rating)
                if(res.error)
                    {

                        throw res.error;
                    }
                ToastNotif("Note ajoutée avec succès", "check-circle", theme, theme.green, 2000);
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  )
                  //console.log(res.newData)
                updateRestaurant(restaurant.id,res.newData)
                setRating(rating);
            }
            catch (e) {
                ToastNotif("Erreur lors de l'ajout de la note", "times-circle", { button_background: "red", text: "white" }, "white", 3000);
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                  )
            }
        }



    return (
        <View style={{flex: 1, backgroundColor: theme.background}}>
            {/* Header avec style MapView */}
            <View style={{
                alignSelf: "center",
                width: "100%",
                zIndex: 1000
            }}>
                <View style={{
                    flexDirection: "row",
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "90%",
                    paddingVertical: 10
                }}>
                    {/* Titre centré avec style MapView */}
                    <View style={{
                        // flex: 1,
                        // flexDirection: "row",
                        // borderRadius: 25,
                        // backgroundColor: theme.background,
                        // shadowColor: '#000',
                        // shadowOffset: { width: 0, height: 8 },
                        // shadowOpacity: 0.15,
                        // shadowRadius: 20,
                        // elevation: 8,
                        // borderWidth: 1,
                        // borderColor: 'rgba(0, 0, 0, 0.05)',
                        // ...(Platform.OS === 'ios' && {
                        //     shadowColor: '#000',
                        //     shadowOffset: { width: 0, height: 8 },
                        //     shadowOpacity: 0.15,
                        //     shadowRadius: 20,
                        // }),
                        // paddingVertical: 15,
                        // paddingHorizontal: 20,
                        // justifyContent: "center",
                        // alignItems: "center"
                    }}>
                        <Text style={{
                            fontFamily: "Inter-Black",
                            fontSize: 18,
                            color: theme.text,
                            textAlign: "center"
                        }}>
                            Rédiger un avis
                        </Text>
                    </View>

                    {/* Bouton fermer avec style MapView */}
                    <View style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 20,
                        elevation: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 20,
                        padding: 12,
                        marginLeft: 15,
                        borderWidth: 1,
                        borderColor: 'rgba(0, 0, 0, 0.05)',
                        ...(Platform.OS === 'ios' && {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.15,
                            shadowRadius: 20,
                        }),
                    }}>
                        <BouncyAppear pressable={true} activeOpacity={0.5} onPress={() => {navigation.goBack()}}>
                            <Ionicons name="close" size={22} color="#007AFF" />
                        </BouncyAppear>
                    </View>
                </View>
            </View>

            {/* Contenu principal avec padding pour éviter le header */}
            <ScrollView style={{
                flex: 1,
            }} showsVerticalScrollIndicator={false}>
                <View style={{paddingHorizontal: 20}}>
                    
                    {/* Section notation avec style carte */}
                    <View style={{
                        marginBottom: 20,
                        backgroundColor: theme.background,
                        borderRadius: 20,
                        padding: 20,
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
                    }}>
                        <Text style={{
                            fontFamily: "Inter-Bold",
                            fontSize: 16,
                            color: theme.text,
                            marginBottom: 15
                        }}>
                            Note générale du restaurant
                        </Text>
                        <Rating
                            type='custom'
                            ratingColor={"#FFC300"}
                            ratingBackgroundColor={theme.dark_gray}
                            startingValue={ratingnote}
                            imageSize={35}
                            onFinishRating={(rating) => HandleFeedback(rating)}
                            tintColor={theme.background}
                            style={{ alignSelf: 'flex-start' }}
                        />
                    </View>

                    {/* Bouton ajouter un plat avec style MapView */}
                    <BouncyAppear 
                        pressable={true}
                        activeOpacity={0.8}
                        onPress={() => {
                            if(ratingnote <=0){
                                ToastNotif("Veuillez noter le restaurant avant", "times-circle", theme, theme.red, 3000);
                                return;
                            }
                            const rating = restaurant.ratings.find(rating => rating.username.toLocaleLowerCase() == username.toLocaleLowerCase())?.rating || -1;
                            navigation.navigate("NewAvisView",{EnvoieDirect : true,restaurantId : restaurant.id,rating});
                        }}
                        style={{
                            marginBottom: 25,
                            shadowColor: ratingnote <= 0 ? 'transparent' : '#007AFF',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: ratingnote <= 0 ? 0 : 0.25,
                            shadowRadius: 20,
                            elevation: ratingnote <= 0 ? 0 : 8,
                        }}
                    >
                       
                        <LinearGradient 
                         colors={['#448fdfff', 'rgba(7, 68, 132, 1)']}
                                              start={{x: 0, y: 0}}
                                              end={{x: 0, y: 1.2}}
                        style={{
                            backgroundColor: ratingnote <= 0 ? theme.light_gray : '#007AFF',
                            borderRadius: 20,
                            paddingVertical: 18,
                            paddingHorizontal: 20,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <FontAwesome 
                                name="plus" 
                                color={ratingnote <= 0 ? theme.dark_gray : "white"} 
                                size={16} 
                            />
                            <Text style={{
                                marginLeft: 8,
                                fontFamily: 'Inter-Bold',
                                fontSize: 16,
                                color: ratingnote <= 0 ? theme.dark_gray : "white"
                            }}>
                                Ajouter un plat
                            </Text>
                        </LinearGradient>
                    </BouncyAppear>

                    {/* Section titre des avis */}
                    <Text style={{
                        fontFamily: "Inter-SemiBold",
                        fontSize: 18,
                        color: theme.dark_gray,
                        marginBottom: 15
                    }}>
                        {reviewsData && reviewsData.length > 0 ? "Vos avis sur cette pépite" : "Aucun avis laissé sur cette pépite"}
                    </Text>

                    {/* Liste des avis avec style carte */}
                    {reviewsData && reviewsData.map((review, index) => (
                        <View key={index} style={{
                            marginBottom: 15,
                            backgroundColor: theme.background,
                            borderRadius: 20,
                            padding: 20,
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
                        }}>
                            {/* Header du plat */}
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 12
                            }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    flex: 1
                                }}>
                                    <Text style={{
                                        fontFamily: 'Inter-Bold',
                                        fontSize: 17,
                                        color: theme.text,
                                        marginRight: 10
                                    }}>
                                        {review.dish.emoji} {review.dish.name}
                                    </Text>
                                    <View style={{
                                        backgroundColor: '#007AFF',
                                        paddingVertical: 4,
                                        paddingHorizontal: 8,
                                        borderRadius: 12
                                    }}>
                                        <Text style={{
                                            color: "white",
                                            fontFamily: 'Inter-Bold',
                                            fontSize: 14
                                        }}>
                                            {review.price}€
                                        </Text>
                                    </View>
                                </View>
                                
                                <BouncyAppear pressable={true} onPress={() => openModal(review)}>
                                    <View style={{
                                        padding: 8,
                                        borderRadius: 12,
                                        backgroundColor: 'rgba(128, 128, 128, 0.1)'
                                    }}>
                                        <Feather name="more-horizontal" size={20} color={theme.dark_gray} />
                                    </View>
                                </BouncyAppear>
                            </View>

                            {/* Commentaire */}
                            <Text style={{
                                fontFamily: 'Inter-Medium',
                                fontSize: 15,
                                color: theme.dark_gray,
                                marginBottom: 12,
                                lineHeight: 22
                            }}>
                                {review.comment}
                            </Text>
                            
                            {/* Date */}
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-end'
                            }}>
                                <Text style={{
                                    fontFamily: 'Inter-Medium',
                                    fontSize: 13,
                                    color: 'gray'
                                }}>
                                    {review.date_visite}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {/* Espace en bas pour éviter que le contenu soit coupé */}
                    <View style={{height: 40}} />
                </View>
            </ScrollView>

                {/* <CustomModal
                    visible={isModalVisible}
                    onClose={closeModal}
                    title={"Commentaire"}
                    options={
                        [
                            { label: "Modifier", handle: () => console.log("Modifier") },
                            { label: "Supprimer",dangerous : true, handle: () => console.log("Supprimer") },
                        ]}
                /> */}

                <CustomModal
                    visible={isModalVisible}
                    onClose={closeModal}
                    title={"Commentaire"}
                    options={
                        [
                            { label: "Modifier", handle: () => 
                                {
                                    const rating = restaurant.ratings.find(rating => rating.username.toLocaleLowerCase() == username.toLocaleLowerCase())?.rating || -1;

                                    navigation.navigate("NewAvisView",{EnvoieDirect : true,avisModifier : avis,restaurantId : restaurant.id,rating});
                             closeModal()} },
                            { label: "Supprimer",dangerous : true, handle: async () => 
                                {
                                    try {
                                        const res = await deleteReview(restaurant.id,avis.id)
                                        if(res.error)
                                            {
                                                throw res.error;
                                            }
                                        ToastNotif("Avis supprimé avec succès", "check-circle", theme, "green", 2000);

                                        Haptics.notificationAsync(
                                            Haptics.NotificationFeedbackType.Success
                                          )
                                        console.log(res.newData)
                                        updateRestaurant(restaurant.id,res.newData)
                                    }
                                    catch (e) {
                                        ToastNotif("Erreur lors de la suppression de l'avis", "times-circle", { button_background: "red", text: "white" }, "white", 3000);
                                        Haptics.notificationAsync(
                                            Haptics.NotificationFeedbackType.Error
                                          )
                                    }
                                    setAvis(null); closeModal()} },
                        ]}
                /> 

                    


        </View> 
    )
}

