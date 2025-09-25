import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity,Dimensions,Modal, Keyboard,StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ModalMarker from '../ModalRestaurant';

import {emojis} from '../data/Emojis';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    useAnimatedScrollHandler,
    withSpring,
    withTiming,
     Layout,
    FadeIn,
    FadeOut,
    Easing
  } from 'react-native-reanimated';


import { deleteAllReports, deleteReview,acceptReviewAttente,deleteReviewAttente } from '../Api';

import { TabView, SceneMap } from 'react-native-tab-view';


const { height: windowHeight, width: windowWidth } = Dimensions.get('window');


import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useTheme } from '../context/ThemeContext';
import { useRestaurant } from '../context/RestaurantsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation,useRoute,useIsFocused } from '@react-navigation/native';
import CustomModal from '../components/ModalMenue';
import Slider from '@react-native-community/slider';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Rating } from 'react-native-ratings';
import { ToastNotif } from '../Utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

import { Animated as RNAnimated } from 'react-native';







const Ajout = ({theme,ajoutData}) => {

    const [index, setIndex] = React.useState(0);
    const [sort, setSort] = React.useState(0);
    const sortTypes = ["Date ↑","Date ↓"];

    const [selectedMarker, setSelectedMarker] = useState(null);
    const animatedHeight = useRef(new RNAnimated.Value(0)).current;

    const [isModalVisible, setIsModalVisible] = useState(false);

    const {refreshDataAjout,dish} = useRestaurant();

    const opacity = useSharedValue(0);

    const [selectedReviewId,setSelectedReviewId] = useState(null);

    const {updateAjout,restaurants} = useRestaurant(); 

    const [emojiModalVisible, setEmojiModalVisible] = useState(false);

    const [dishListModalVisible, setDishListModalVisible] = useState(false);
    
    if (emojiModalVisible || dishListModalVisible) {
        opacity.value = withTiming(0.7, { duration: 200, easing: Easing.out(Easing.exp) });
       // translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.exp) });
      } else {
        opacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.exp) });
        //translateY.value = withTiming(300, { duration: 300, easing: Easing.in(Easing.exp) });
      }
    
      const animatedStyle = useAnimatedStyle(() => {
        return {
          opacity: opacity.value,
          zIndex: emojiModalVisible || opacity.value > 0 ? 1 : -1,
         // transform: [{ translateY: translateY.value }],
        };
      });

    useEffect(()=>{console.log(ajoutData)},[])


    handleEmojiPress = (emoji) =>{
        console.log(emoji);
        setEmojiModalVisible(false);
        updateAjout(selectedReviewId,{newEmoji : emoji});
      }

    const handleRestaurantPress = (marker) => {
        setSelectedMarker(marker);

        console.log(marker);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
        
    
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

    const openDishList = () => {
        setDishListModalVisible(true);
    }


    const handledishPress = (d) => {
        setDishListModalVisible(false);
        updateAjout(selectedReviewId,{newDish : d});
    }

 


    const handleTrie = () => {
        setSort((sort + 1) % sortTypes.length);
    }

    const handleIndexChange = (index) => {
        setIndex(index);
    }

    //const reportData = JSON.parse(reportDataJson);

    let reviewReportList= []

    //ajouter le restaurant a chaque review
    ajoutData.map((review) => {
        reviewReportList.push({...review,restaurant : restaurants.find((r) => r.id == review.restaurantId)});
    })


    reviewReportList.sort((a,b) => {
        if(sort == 0)
            return new Date(b.date_ajout) - new Date(a.date_ajout);
        else if(sort == 1)
            return new Date(a.date_ajout) - new Date(b.date_ajout);
  })

  
    

    return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center',marginTop : 15}}>


            <Animated.View style={[{
                width: '100%',
                backgroundColor: "black",
                borderRadius: 10,
                padding: 20,
                alignSelf : 'flex-start',
                position: 'absolute',
                top: -20,
                zIndex: 1,
                height: '100%'

            }, animatedStyle]}/>

            <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: 'center', width: "90%" }}>
               <View style={{ flexDirection: 'row'}}>
                <TouchableOpacity activeOpacity={0.8}  onPress={()=>handleIndexChange(0)}>
                    <View style={{padding : 5, borderRadius : 5, flexDirection: 'row', alignItems: 'center',backgroundColor :  index == 0 ? theme.background_blue : "transparent" }}>
                            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: theme.dark_gray }}>
                                🍔 Plats
                            </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={()=>handleIndexChange(1)}>
                <View style={{padding : 5,marginLeft : 10, borderRadius : 5, flexDirection: 'row', alignItems: 'center',backgroundColor : index == 1 ? theme.background_blue : "transparent" }}>
                        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: theme.dark_gray }}>
                            🍴 Restaurants
                        </Text>
                </View>
                </TouchableOpacity>
                </View>
                <View style={{flexDirection : 'row',alignItems : "center"}}>
                <TouchableOpacity activeOpacity={0.8} onPress={()=>openDishList()}>
                <View style={{padding : 3, borderRadius : 5, flexDirection: 'row', alignItems: 'center',backgroundColor : "transparent" }}>
                        <FontAwesome6 name="list" size={12} color={theme.gray} />
                </View>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={()=>refreshDataAjout()}>
                <View style={{padding : 3,marginLeft : 5, borderRadius : 5, flexDirection: 'row', alignItems: 'center',backgroundColor : "transparent" }}>
                        <FontAwesome6 name="arrow-rotate-left" size={12} color={theme.gray} />
                </View>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={()=>handleTrie()}>
                <View style={{padding : 3,marginLeft : 5, borderRadius : 5, flexDirection: 'row', alignItems: 'center',backgroundColor : "transparent" }}>
                        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: theme.gray }}>
                            {sortTypes[sort]}
                        </Text>
                </View>
                </TouchableOpacity>
                
                </View>
            </View>

            {
                index == 0 ? <Plats openDishList={openDishList} setSelectedReviewId={setSelectedReviewId}  openEmojiModal={()=>{setEmojiModalVisible(true)}} handleRestaurantPress={handleRestaurantPress} ajoutData={reviewReportList} theme={theme} /> : <Restaurant theme={theme} />
            }

        {selectedMarker &&
        <ModalMarker
            selectedMarkerId={selectedMarker.id}
            closeModal={closeModal}
            animatedHeight={animatedHeight}
          />}

        <Modal visible={emojiModalVisible} transparent={true} animationType="slide">
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'transparent' }}>
                        <View style={{ backgroundColor: theme.background, padding: 20, borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ marginBottom: 10,fontSize : 16,color : theme.text,fontFamily:"inter-Bold" }}>Sélectionnez un émoji</Text>
                            <FontAwesome name="times" size={20} color={theme.gray} onPress={() => setEmojiModalVisible(false)} />
                            </View>
                            <ScrollView style={{maxHeight : Dimensions.get('window').height / 2 }}>

                            <View style={{ flexDirection: 'row',alignItems: 'center',justifyContent : 'center', flexWrap: 'wrap' }}>
                                {emojis.map((emoji, index) => (
                                    <TouchableOpacity key={index} onPress={() => handleEmojiPress(emoji)}>
                                        <Text style={{ fontSize: 30, margin: 10 }}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            
                            </ScrollView>
                            {/* <TouchableOpacity onPress={() => setEmojiModalVisible(false)}>
                                <Text style={{ color: 'red', marginTop: 20 }}>Annuler</Text>
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </Modal>


                <Modal visible={dishListModalVisible} transparent={true} animationType="slide">
                    {/* list horizontal des dish objet du type {name, emoji} */}
                    
                    
                    <View style={{ flex: 1, justifyContent: 'flex-end', width : "100%", alignItems: 'center', backgroundColor: 'transparent' }}>
                        <View style={{ backgroundColor: theme.background, width : "100%",padding: 20, borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ marginBottom: 10,fontSize : 16,color : theme.text,fontFamily:"inter-Bold" }}>Liste des plats</Text>
                            <FontAwesome name="times" size={20} color={theme.gray} onPress={() => setDishListModalVisible(false)} />
                            </View>
                            <ScrollView style={{maxHeight : Dimensions.get('window').height / 2 }}>

                            <View style={{alignItems: 'flex-start',justifyContent : 'flex-start', flexWrap: 'wrap' }}>
                                {dish.map((d, index) => (
                                    <TouchableOpacity key={index} onPress={() => handledishPress(d)}>
                                    <View style={{alignItems : "flex-start",justifyContent : "flex-start"}} key={index}>
                                        <Text style={{ fontSize: 14,marginHorizontal : 10, marginVertical: 5,color : theme.dark_gray,fontFamily : "inter-Bold" }}>{d.emoji} {d.name}</Text>
                                    </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            
                            </ScrollView>
                            
                        </View>
                    </View>
                    
                    </Modal>
            
        </View>
    )
}


const Plats = ({theme,ajoutData,handleRestaurantPress,openEmojiModal,setSelectedReviewId,openDishList}) => {

   
    return (
        <>
        {ajoutData.length != 0 ? 
        
            <ScrollView style={{ width : "100%",alignSelf : "center", marginTop : 10}}>
                <View style={{alignItems: 'center', width : "100%", alignSelf : "center" }}>
                {ajoutData.map((review, index) => (

                    <View key={index} style={{ marginBottom: 10, backgroundColor : theme.background,padding : 5,paddingHorizontal : 8,borderRadius : 10,width : "90%" }}>
                        <PlatComp key={index} openDishList={openDishList} setSelectedReviewId={setSelectedReviewId} openEmojiModal={openEmojiModal} review={review} theme={theme} openModal={handleRestaurantPress} />
                    <View style={{borderTopWidth : 1, borderColor : theme.gray, marginTop : 10}}></View>
                    </View>
                ))}
                
                </View>
            </ScrollView>
            :
                <View style={{justifyContent : "center",flex : 1,alignItems:"center",flexDirection : "row"}}>

                    <View style={{alignSelf:"center"}}>
                        <FontAwesome6 name="file-circle-check" size={20} color={theme.text} />
                        </View>
                        <View style={{alignSelf:"center",marginLeft : 5}}>
                        <Text style={{color : theme.text,fontFamily : "Inter-Bold",}} >Plus aucun signalement</Text>
                    </View>
                </View>
            
            }
            </>
    );
}

const Restaurant = ({theme}) => {
    return (
        <View style={{ width : "100%",alignSelf : "center", marginTop : 5}}>
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.text, textAlign: 'center' }}>
                Aucun restaurant signalé
            </Text>
        </View>
    );
}
const PlatComp = ({review,theme,openModal,openEmojiModal,setSelectedReviewId,openDishList}) => {

    const raisons = {"insulte" : 0,"prix":0,"faux":0}

    const { restaurants,updateReport,updateAjout,deleteAjout } = useRestaurant();


    review.reports.map((report) => {
        raisons[report.raison] += 1;
    })

    const declineReview = async (review) => {

        try
        {
            const res = await deleteReviewAttente(review.id)

            if(res.error)
                {
                    ToastNotif("Erreur", "times-circle", theme, theme.red, 3000);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                }
            else
                {
                    ToastNotif("Avis refusé", "check-circle", theme, theme.green, 3000);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    deleteAjout(review.id ); 
                }
        
        }
        catch(e)
        {
            console.log(e);
        }
    }

    const Retour = async (review) => {
    
        updateAjout(review.id,{newEmoji : null,newDish : null},);
    }

    const changer = async (review) => {
        openDishList();
        setSelectedReviewId(review.id);
    }
   
    const acceptReview = async (review) => {
        try{
        const res = await acceptReviewAttente(review.restaurant.id,review.id,{emoji : review.newDish ? review.newDish.emoji : review.newEmoji ? review.newEmoji : review.dish.emoji, name : review.newDish ? review.newDish.name : review.dish.name});
        if(res.error)
            {
                ToastNotif("Erreur", "times-circle", theme, theme.red, 3000);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        else
            {
                ToastNotif("Plat accepté", "check-circle", theme, theme.green, 3000);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                deleteAjout(review.restaurant.id );
                updateReport(review.restaurant.id,res.newData);
                
            }
    
    }
    catch(e)
    {
        console.log(e);
    }

    }
    

    return(
        <View style={{ width : "100%", backgroundColor : theme.background,padding : 5,paddingHorizontal : 8,borderRadius : 10, }}>
            
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity onPress={()=>
                            {
                                openEmojiModal();
                                setSelectedReviewId(review.id);
                                }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View>
                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 20, color: theme.text }}>
                                        {review.newDish ? review.newDish.emoji : review.newEmoji ? review.newEmoji : review.dish.emoji} {review.newDish ? review.newDish.name : review.dish.name}
                                    </Text>
                                </View>

                                
                            </View>
                            </TouchableOpacity>

                            <View style={{position : 'absolute',right : 0}}>
                                <TouchableOpacity onPress={() =>{ 
                                    
                                    //review.restaurant avec restaurant.review += review
                                    let newRestaurant  = review.restaurant;
                                    // push au cebut
                                    // check si il est deja ajouté
                                    if(!newRestaurant.reviews.find((r) => r.id == review.id))  
                                    {
                                        newRestaurant.reviews.unshift({...review,added : true,});
                                    }
                                    //newRestaurant.reviews.push({...review,added : true});
                                    openModal(newRestaurant);
                                    
                                    
                                    console.log(review.restaurant)}}>
                                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: 'gray', textDecorationLine: 'none' }}>
                                    <Feather name="more-horizontal" size={25} color="gray" />
                                </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

{/* 
                        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.light_gray, marginVertical: 5 }}>
                        {review.comment}
                        </Text> */}
                        

                        <View style={{marginTop : 15, marginHorizontal : -10, flexDirection: 'row',justifyContent : "center", alignItems: 'center' }}>
                            <View >
                            <TouchableOpacity onPress={()=>declineReview(review)} style={{ backgroundColor: theme.background_red, padding: 5, borderRadius: 10,width : "auto" }}>
                                <View style={{ flexDirection: 'row',paddingVertical : 2, paddingHorizontal : 4, alignItems: 'center',justifyContent:"center" }}>
                                    <FontAwesome name="times" size={15} color={theme.red} />
                                    <Text style={{marginLeft : 3, color: theme.red, fontFamily: 'Inter-SemiBold', fontSize: 13 }}>
                                        Refuser
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            
                            
                            
                            </View>
                            
                            <View >
                            <TouchableOpacity onPress={()=>changer(review)} style={{ backgroundColor: theme.background_orange, padding: 4, borderRadius: 10,width : "auto", marginLeft : 5 }}>
                                <View style={{ flexDirection: 'row',paddingVertical : 2, paddingHorizontal : 4, alignItems: 'center',justifyContent:"center" }}>
                                    <FontAwesome5 name="exchange-alt" size={15} color={theme.orange} />
                                    <Text style={{marginLeft : 3, color: theme.orange, fontFamily: 'Inter-SemiBold', fontSize: 13 }}>
                                        Changer
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            
                            </View>

                            <View >

                            <TouchableOpacity onPress={()=>Retour(review)} style={{ backgroundColor: theme.background_blue, padding: 4, borderRadius: 10, marginLeft : 5 }}>
                            <View style={{ flexDirection: 'row',paddingVertical : 2, paddingHorizontal : 4, alignItems: 'center',justifyContent:"center" }}>
                                    <FontAwesome6 name="arrow-rotate-left" size={15} color={theme.blue} />
                                    <Text style={{marginLeft : 3,  color: theme.blue, fontFamily: 'Inter-SemiBold', fontSize: 13 }}>
                                        Retour
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            </View>

                            <View >

                            <TouchableOpacity onPress={()=>acceptReview(review)} style={{ backgroundColor: theme.background_green, padding: 4, borderRadius: 10, marginLeft : 5 }}>
                            <View style={{ flexDirection: 'row',paddingVertical : 2, paddingHorizontal : 4, alignItems: 'center',justifyContent:"center" }}>
                                    <FontAwesome name="check" size={15} color={theme.green} />
                                    <Text style={{marginLeft : 3, color: theme.green, fontFamily: 'Inter-SemiBold', fontSize: 13 }}>
                                        Accepter
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        </View>


                        

                    </View>
    )
}


export default Ajout;