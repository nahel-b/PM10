import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity,Dimensions, Keyboard,StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import ModalMarker from '../ModalRestaurant';


import { deleteAllReports, deleteReview } from '../Api';

import { TabView, SceneMap } from 'react-native-tab-view';


const { height: windowHeight, width: windowWidth } = Dimensions.get('window');


//const reportDataJson = '[{"_id":"66e44e9a846e9e45a59104db","id":"a95b1987-fd43-4406-b868-2736a60b8b98","title":"Best Tacos","type":"Restaurant de tacos","coordinate":{"type":"Point","coordinates":[2.6411358584906095,49.29989999999997]},"ratingAverage":4,"ratings":[{"username":"nahel","rating":5},{"username":"nahel2","rating":3}],"reviews":[{"id":"95fa7451-8fb4-4ee2-aa0a-b629ff5254ba","username":"nahel","dish":{"name":"Poulet au curry","emoji":"🍗","id":3},"price":0.5,"comment":"Popopopopo","rating":5,"nbReport":0,"date_ajout":"2024-09-14T17:16:55.461Z","date_visite":"Sat Sep 14 2024","reports":[{"username":"nahel2","raison":"prix","date_ajout":"2024-09-16T13:49:57.062Z"}]},{"id":"d1933b81-a6ff-4e04-8f5e-836aa4391945","username":"nahel2","dish":{"name":"Poulet au curry","emoji":"🍗","id":3},"price":3.5,"comment":"Dkjsnkdjbnksdn","rating":3,"reports":[],"date_ajout":"2024-09-16T13:49:40.600Z","date_visite":"Mon Sep 16 2024"}]},{"_id":"66e5cb1fad1a413a138561c0","id":"32c55d2b-3455-41c7-9e33-713b7eaa1b2e","title":"Tikka","type":"Restaurant de tacos","coordinate":{"type":"Point","coordinates":[2.6406608797208677,49.30017721052099]},"ratingAverage":3,"ratings":[{"username":"nahel","rating":2},{"username":"nahel2","rating":4}],"reviews":[{"id":"a730d2fb-7e61-444b-b89b-fb6f6fc656de","username":"nahel","dish":{"name":"Poulet au curry","emoji":"🍗","id":3},"price":4.25,"comment":"J’adoreo","rating":2,"nbReport":0,"date_ajout":"2024-09-14T17:42:55.652Z","date_visite":"Sun Sep 15 2024","reports":[{"username":"nahel2","raison":"insulte","date_ajout":"2024-09-15T14:56:52.664Z"},{"username":"nahel2","raison":"faux","date_ajout":"2024-09-15T14:56:52.664Z"}]},{"id":"958d72d0-43d2-4c3c-b20e-8c0431f65ec0","username":"nahel2","dish":{"name":"Poulet au curry","emoji":"🍗","id":3},"price":4.5,"comment":"Excellentttttt","rating":4,"reports":[],"date_ajout":"2024-09-15T15:32:35.770Z","date_visite":"Sun Sep 15 2024"}],"date_ajout":"2024-09-14T17:42:55.652Z"}]';


const reviews = [
    {
      name: "Jean Dupont",
      dish: "Tacos",
      price: 5.5,
      comment: "Le boeuf était parfaitement cuit, tendre et savoureux. L'accompagnement de légumes était délicieux.",
      rating: 4.5,
      emoji: "🌯",
      nbReport : 2
    },
    {
      name: "Marie Martin",
      dish: "Tacos",
      price: 5.5,
      comment: "Un plat classique, mais avec une touche moderne. Les saveurs étaient bien équilibrées.",
      rating: 4,
      emoji: "🌯",
        nbReport : 1
    },
    {
      name: "Pierre Lefèvre",
      dish: "Salade",
      price: 8,
      comment: "plat excellent, mais la pâte aurait pu être un peu plus croustillante.",
      rating: 4.5,
      emoji: "🥗",
      nbReport : 3
    },
    {
      name: "Sophie Durand",
      dish: "Salade",
      price: 8,
      comment: "Délicieuse salade, pleine de saveurs et de fraîcheur. Très généreuse en portion.",
      rating: 5,
      emoji: "🥗"
    },
    {
        name: "Sophie Durand",
        dish: "Salade",
        price: 8,
        comment: "Délicieuse salade, pleine de saveurs et de fraîcheur. Très généreuse en portion.",
        rating: 5,
        emoji: "🥗"
      },
      {
        name: "Sophie Durand",
        dish: "Salade",
        price: 8,
        comment: "Délicieuse salade, pleine de saveurs et de fraîcheur. Très généreuse en portion.",
        rating: 5,
        emoji: "🥗"
      },
  ]


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
  } from 'react-native-reanimated';


import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useTheme } from '../context/ThemeContext';
import { useRestaurant } from '../context/RestaurantsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation,useRoute,useIsFocused } from '@react-navigation/native';
import CustomModal from '../ModalMenue';
import Slider from '@react-native-community/slider';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Rating } from 'react-native-ratings';
import { ToastNotif } from '../Utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';

import { Animated as RNAnimated } from 'react-native';







const Report = ({theme,reportData}) => {

    const [index, setIndex] = React.useState(0);
    const [sort, setSort] = React.useState(0);
    const sortTypes = ["Date ↑","Date ↓", "Nombre ↑","Nombre ↓","Insulte","Prix","Faux"];

    const [selectedMarker, setSelectedMarker] = useState(null);
    const animatedHeight = useRef(new RNAnimated.Value(0)).current;

    const [isModalVisible, setIsModalVisible] = useState(false);

    const {refreshDataReport} = useRestaurant();

    useEffect(()=>{console.log(reportData)},[])

    const handleRestaurantPress = (marker) => {
        setSelectedMarker(marker);
  
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

    const handleTrie = () => {
        setSort((sort + 1) % sortTypes.length);
    }

    const handleIndexChange = (index) => {
        setIndex(index);
    }

    //const reportData = JSON.parse(reportDataJson);

    let reviewReportList= []

    if(reportData.length > 0){
    reportData.map((restaurant) => {restaurant.reviews.map((review) => {
        if(review.reports)
            {
                const newReview = review;
                newReview.restaurant = restaurant;
                reviewReportList.push(newReview);
            }
    })});}
    

    //trier les reviews en fonction du sort

    reviewReportList.sort((a,b) => {
        if(sort == 0)
            return new Date(b.date_ajout) - new Date(a.date_ajout);
        else if(sort == 1)
            return new Date(a.date_ajout) - new Date(b.date_ajout);

        else if(sort == 2)
            return b.reports.length - a.reports.length;
        else if(sort == 3)
            return a.reports.length - b.reports.length;

        else if(sort == 4)
            return   b.reports.filter(report => report.raison == "insulte").length -a.reports.filter(report => report.raison == "insulte").length ;
        else if(sort == 5)
            return  b.reports.filter(report => report.raison == "prix").length - a.reports.filter(report => report.raison == "prix").length ;
        else if(sort == 6)
            return  b.reports.filter(report => report.raison == "faux").length - a.reports.filter(report => report.raison == "faux").length;
    })

  
    if(sort>=4)
        {
            //selectionner les reviews qui ont des reports de ce type
            reviewReportList = reviewReportList.filter((review) => review.reports && review.reports.filter(report => report.raison == sortTypes[sort].toLowerCase()).length > 0)
        }
    

    return (
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center',marginTop : 15}}>

            <View style={{ flexDirection: 'row', justifyContent: "space-between", alignItems: 'center', width: "90%" }}>
               <View style={{ flexDirection: 'row'}}>
                <TouchableOpacity activeOpacity={0.8}  onPress={()=>handleIndexChange(0)}>
                    <View style={{padding : 3, borderRadius : 5, flexDirection: 'row', alignItems: 'center',backgroundColor :  index == 0 ? theme.background_blue : "transparent" }}>
                            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: theme.dark_gray }}>
                                💬 Commentaires
                            </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={()=>handleIndexChange(1)}>
                <View style={{padding : 3,marginLeft : 10, borderRadius : 5, flexDirection: 'row', alignItems: 'center',backgroundColor : index == 1 ? theme.background_blue : "transparent" }}>
                        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: theme.dark_gray }}>
                            🍴 Restaurants
                        </Text>
                </View>
                </TouchableOpacity>
                </View>
                <View style={{flexDirection : 'row',alignItems : "center"}}>
                <TouchableOpacity activeOpacity={0.8} onPress={()=>refreshDataReport()}>
                <View style={{padding : 3, borderRadius : 5, flexDirection: 'row', alignItems: 'center',backgroundColor : "transparent" }}>
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
                index == 0 ? <Commentaire handleRestaurantPress={handleRestaurantPress} reviewReportList={reviewReportList} theme={theme} /> : <Restaurant theme={theme} />
            }

        {selectedMarker &&
        <ModalMarker
            selectedMarkerId={selectedMarker.id}
            closeModal={closeModal}
            animatedHeight={animatedHeight}
          />}

            
        </View>
    )
}


const Commentaire = ({theme,reviewReportList,handleRestaurantPress}) => {

   
    return (
        <>
        {reviewReportList.length != 0 ? 
        
            <ScrollView style={{ width : "100%",alignSelf : "center", marginTop : 10}}>
                <View style={{alignItems: 'center', width : "100%", alignSelf : "center" }}>
                {reviewReportList.filter((review) => review.reports && review.reports.length > 0).map((review, index) => (

                    <View key={index} style={{ marginBottom: 10, backgroundColor : theme.background,padding : 5,paddingHorizontal : 8,borderRadius : 10,width : "90%" }}>
                        <AvisComp key={index} review={review} theme={theme} openModal={() => handleRestaurantPress(review.restaurant)} />
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
const AvisComp = ({review,theme,openModal}) => {

    const raisons = {"insulte" : 0,"prix":0,"faux":0}

    const { restaurants,updateReport } = useRestaurant();


    review.reports.map((report) => {
        raisons[report.raison] += 1;
    })

    const declineReview = async (review) => {

        try
        {
            const res = await deleteReview(review.restaurant.id,review.id)

            if(res.error)
                {
                    ToastNotif("Erreur", "times-circle", theme, theme.red, 3000);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                }
            else
                {
                    ToastNotif("Avis refusé", "check-circle", theme, theme.green, 3000);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    updateReport(review.restaurant.id ,res.newData);
                    console.log(res.newData);
                    console.log(review.restaurant.id);
                }
        
        }
        catch(e)
        {
            console.log(e);
        }
    }
   
    const acceptReview = async (review) => {
        try{
        const res = await deleteAllReports(review.restaurant.id,review.id)
        if(res.error)
            {
                ToastNotif("Erreur", "times-circle", theme, theme.red, 3000);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
        else
            {
                ToastNotif("Avis accepté", "check-circle", theme, theme.green, 3000);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                updateReport(review.restaurant.id ,res.newData);
                console.log(res.newData);
                console.log(review.restaurant.id);
            }
    
    }
    catch(e)
    {
        console.log(e);
    }

    }
    

    return(
        <View style={{ width : "100%", backgroundColor : theme.background,padding : 5,paddingHorizontal : 8,borderRadius : 10, }}>
            
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View>
                                    <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.gray }}>
                                        {review.dish.emoji} {review.dish.name}
                                    </Text>
                                </View>
                                {raisons["insulte"]> 0 && 
                                <View style={{ marginTop : 3,backgroundColor: theme.background_red, padding: 2,paddingHorizontal : 4, borderRadius: 5, marginLeft: 3, alignItems: 'center' }}>
                                    <Text style={{ color: theme.red, fontFamily: 'Inter-SemiBold', fontSize: 13 }}>  
                                        {raisons["insulte"]} insulte
                                    </Text>
                                </View>}
                                {raisons["prix"]> 0  && <View style={{marginTop : 3, backgroundColor: theme.background_blue, padding: 2,paddingHorizontal : 4, borderRadius: 5, marginLeft: 3, alignItems: 'center' }}>
                                    <Text style={{ color: theme.blue, fontFamily: 'Inter-SemiBold', fontSize: 13 }}>  
                                        {raisons["prix"]} prix
                                    </Text>
                                </View>}
                                {raisons["faux"]> 0 &&<View style={{ marginTop : 3,backgroundColor: theme.background_green, padding: 2,paddingHorizontal : 4, borderRadius: 5, marginLeft: 3, alignItems: 'center' }}>
                                    <Text style={{ color: theme.green, fontFamily: 'Inter-SemiBold', fontSize: 13 }}>  
                                        {raisons["faux"]} faux
                                    </Text>
                                </View>}
                            </View>
                            <View>
                                <TouchableOpacity onPress={openModal}>
                                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 11, color: 'gray', textDecorationLine: 'none' }}>
                                    <Feather name="more-horizontal" size={25} color="gray" />
                                </Text>
                                </TouchableOpacity>
                            </View>
                        </View>


                        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.text, marginVertical: 5 }}>
                        {review.comment}
                        </Text>
                        

                        <View style={{marginTop : 10, flexDirection: 'row',justifyContent : "space-around", alignItems: 'center' }}>
                            <TouchableOpacity onPress={()=>declineReview(review)} style={{ backgroundColor: theme.background_red, padding: 5, borderRadius: 10, marginRight: 5 }}>
                                <View style={{ flexDirection: 'row',paddingVertical : 2, paddingHorizontal : 5, alignItems: 'center' }}>
                                    <FontAwesome name="times" size={15} color={theme.red} />
                                    <Text style={{marginLeft : 3, color: theme.red, fontFamily: 'Inter-SemiBold', fontSize: 15 }}>
                                        Refuser
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={()=>acceptReview(review)} style={{ backgroundColor: theme.background_green, padding: 5, borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row',paddingVertical : 2, paddingHorizontal : 5, alignItems: 'center' }}>
                                    <FontAwesome name="check" size={15} color={theme.green} />
                                    <Text style={{marginLeft : 3, color: theme.green, fontFamily: 'Inter-SemiBold', fontSize: 15 }}>
                                        Accepter
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                    </View>
    )
}


export default Report;