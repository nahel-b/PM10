import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity, ActivityIndicator,ScrollView } from 'react-native';
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { PanGestureHandler, GestureHandlerRootView, State, TextInput } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from  '@expo/vector-icons/FontAwesome';

import { Rating } from 'react-native-ratings'; // Importer le composant Rating
import { useTheme } from '../context/ThemeContext';

import { useRestaurant } from '../context/RestaurantsContext';

import { useNavigation,useRoute } from '@react-navigation/native';


import CustomModal from '../ModalMenue';
import { SendRatingRestaurant,deleteReview } from '../Api';
import Toast from 'react-native-toast-message';
import { ToastNotif } from '../Utils';



// import NewAvisView from './NewAvisView';


export default AvisViewPrincipal = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const { updateRestaurant,restaurants } = useRestaurant();

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
            }
            catch (e) {
                ToastNotif("Erreur lors de l'ajout de la note", "times-circle", { button_background: "red", text: "white" }, "white", 3000);
                Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Error
                  )
            }
        }



    return (
        <View style={{flex : 1, backgroundColor : theme.background }}>
                <TouchableOpacity onPress={()=>{navigation.goBack()}}>
                    <View style={{alignItems : "flex-end", paddingHorizontal :20, paddingTop : 20 }}>
                    <Ionicons name="close" size={30} color="gray" />
                    </View>
                </TouchableOpacity>
                <View style={{paddingHorizontal : 20,marginBottom : 20}}>
                    <Text style={{fontFamily: "Inter-Black", fontSize : 22,color : theme.text}}>
                        Rédiger un avis
                    </Text>
                </View>

                <View style={{marginBottom : 15,flexDirection:"column", justifyContent:"flex-start" ,alignItems : "flex-start",padding : 5,borderRadius : 5, marginHorizontal : 20, backgroundColor : theme.light_gray}}>
                    
                    
                    <Text style={{fontFamily : "Inter-Bold", fontSize : 15,color : theme.dark_gray}}>
                     Note général du restaurant</Text>
                <Rating
                    type='custom'
                    ratingColor={"#FFC300"}
                    ratingBackgroundColor={theme.dark_gray}
                    startingValue={
                        ratingnote 
                    }
                    imageSize={30}
                    onFinishRating=
                    {
                        (rating) => HandleFeedback(rating)
                    }
                    tintColor={theme.light_gray}
                    style={{ marginLeft: 0 }}
                    />
                </View>





                <TouchableOpacity  activeOpacity={0.8} onPress={()=>
                    {
                        if(ratingnote <=0){
                            ToastNotif("Veuillez noter le restaurant avant", "times-circle", theme, theme.red, 3000);
                            return;
                        }
                        const rating = restaurant.ratings.find(rating => rating.username.toLocaleLowerCase() == username.toLocaleLowerCase())?.rating || -1;

                        navigation.navigate("NewAvisView",{EnvoieDirect : true,restaurantId : restaurant.id,rating});

                        // ToastNotif("Ajout d'un avis","check-circle",theme,"green",2000)
                        }}>
                <View style={{ backgroundColor: ratingnote <= 0 ? theme.light_gray :  theme.text, marginHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome name={"plus"} color={theme.background} size={14} />
                    <Text style={{ marginLeft: 5, fontFamily: 'Inter-Bold', fontSize: 13.5, color: theme.background, paddingVertical: 12 }}>Ajouter un plat</Text>
                    </View>
                </View>
                </TouchableOpacity>


                <Text style={{marginHorizontal : 20, color : theme.dark_gray, marginTop : 20,fontFamily : "Inter-SemiBold"}}>

                {reviewsData && reviewsData.length > 0 ? "Avis déjà laissé sur cette pépite :" : "Aucun avis laissé sur cette pépite :" }

                </Text>



                <ScrollView style={{ paddingTop: 0, marginTop : 5 }}>
                    <View style={{ paddingHorizontal: 20 }}>
                    {reviewsData && reviewsData.map((review, index) => (
                    <View key={index} style={{ marginBottom: 10, backgroundColor : theme.light_gray,padding : 5,paddingHorizontal : 8,borderRadius : 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row',marginBottom : 5,marginTop : 5, alignItems: 'center' }}>
                            <View>
                                {/* <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.text }}>
                                    {review.emoji} {review.dish}
                                </Text> */}
                                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.text }}>
                                    {review.dish.emoji} {review.dish.name}
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
    
    
                            <TouchableOpacity onPress={() => openModal(review)}>
                                <Feather name="more-horizontal" size={25} color="gray" />
                            </TouchableOpacity>
    
                        </View>
                    </View>
    
    
                    <Text style={{ fontFamily: 'Inter-Medium', fontSize: 14, color : theme.dark_gray, marginVertical: 5 }}>
                      {review.comment}
                    </Text>
                    
           <View style={{ flexDirection: 'row', alignItems: 'center',justifyContent:"flex-end" }}>
    
                    <Text style={{ fontFamily: 'Inter-Medium', fontSize: 12, color: 'gray', marginLeft: 5 }}>
                        {review.date_visite}
                    </Text>
    
                                </View>
                  </View>
                    ))}
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

