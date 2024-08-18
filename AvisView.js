import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Animated, Dimensions, Image, TouchableOpacity, ActivityIndicator,ScrollView } from 'react-native';
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { PanGestureHandler, GestureHandlerRootView, State, TextInput } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from  '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ToastObj } from './Utils';
import { Rating } from 'react-native-ratings'; // Importer le composant Rating
import { useTheme } from './context/ThemeContext';

import MapView from "react-native-map-clustering";
import { useRestaurant } from './context/RestaurantsContext';
import { useNavigation } from '@react-navigation/native';


const reviewsData = [
    {
      name: "Jean Dupont",
      dish: "Boeuf Bourguignon",
      price: 25,
      comment: "Le boeuf était parfaitement cuit, tendre et savoureux. L'accompagnement de légumes était délicieux.",
      rating: 4.5,
      emoji: "🥩"
    },
    {
        name: "Jean Dupont",
        dish: "Boeuf Bourguignon",
        price: 25,
        comment: "Le boeuf était parfaitement cuit, tendre et savoureux. L'accompagnement de légumes était délicieux.",
        rating: 4.5,
        emoji: "🥩"
      }
]



export default AvisView = ({}) => {

    const { theme } = useTheme();
    const navigation = useNavigation();
    return (
        <View style={{flex : 1, backgroundColor : theme.background}}>
            <SafeAreaView>
                <TouchableOpacity onPress={()=>{navigation.navigate("MapView")}}>
                    <View style={{alignItems : "flex-end", paddingHorizontal :20 }}>
                    <Ionicons name="close" size={30} color="gray" />
                    </View>
                </TouchableOpacity>
                <View style={{paddingHorizontal : 20}}>
                    <Text style={{fontFamily: "Inter-Black", fontSize : 22,color : theme.text}}>
                        Rédiger un avis
                    </Text>
                </View>
                <View style={{ marginHorizontal : 20, borderBottomColor: theme.light_gray, borderBottomWidth: 2, marginVertical: 15 }} />

                <View style={{flexDirection:"column", justifyContent:"flex-start" ,alignItems : "flex-start",padding : 5,borderRadius : 5, marginHorizontal : 20, backgroundColor : theme.light_gray}}>
                    <Text style={{fontFamily : "Inter-Bold", fontSize : 15,color : theme.dark_gray}}>
                    🔖 Note général du restaurant</Text>
                <Rating
                    type='custom'
                    ratingColor={"#FFC300"}
                    ratingBackgroundColor={theme.dark_gray}
                    startingValue={5}
                    imageSize={35}
                    
                    tintColor={theme.light_gray}
                    style={{ marginLeft: 0 }}
                    />
                </View>

                <View style={{ marginHorizontal : 20, borderBottomColor: theme.light_gray, borderBottomWidth: 2, marginVertical: 15 }} />




                <TouchableOpacity activeOpacity={0.8}>
                    <View style={{backgroundColor : theme.blue,marginHorizontal : 20,justifyContent : "center",alignItems : "center",borderRadius : 10}}>
                        
                        <View style={{flexDirection : "row", alignItems:"center"}}>
                        <FontAwesome name={"plus"}  color={"white"} size={18}/>

                        <Text style={{marginLeft : 5,fontFamily : "Inter-Bold", fontSize : 15,color : "white",paddingVertical : 10}}>Ajouter un plat</Text>
                        </View>
                        </View>
                </TouchableOpacity>


                <Text style={{marginHorizontal : 20, color : theme.dark_gray, marginTop : 20,fontFamily : "Inter-SemiBold"}}>

                    Avis Déjà laissé : 

                </Text>



                <ScrollView style={{ paddingTop: 0, marginTop : 5 }}>
                    <View style={{ paddingHorizontal: 20 }}>
                    {reviewsData && reviewsData.map((review, index) => (
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
                                    <Feather name="more-horizontal" size={25} color="gray" />
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
                </ScrollView>






                <View style={{ backgroundColor : theme.light_gray,alignItems : "center",paddingVertical : 5,paddingHorizontal : 10,borderRadius : 5,marginTop : 10, marginHorizontal : 20,justifyContent : "flex-start"}}>
                

                <Text style={{width : "100%", fontFamily : "Inter-Bold", fontSize : 15,marginBottom : 0,color : theme.dark_gray}}>{"🍴Plat"}
                </Text>

                    <View style={{width : "100%", flexDirection : "row",justifyContent : "flex-start",alignItems : "flex-end"}}>
                        

                        <View style={{flexDirection : "row",marginLeft : 5,alignItems : "center"}}>
                            {/* <FontAwesome name={"pencil"}  color={theme.gray}/> */}
                            <TextInput numberOfLines={1}  placeholder='pasta...' style={{fontFamily : "Inter-SemiBold",marginLeft : 2}}/>
                        </View>
                    </View>
                </View>


                <View style={{ backgroundColor : theme.light_gray,alignItems : "center",paddingVertical : 5,paddingHorizontal : 10,borderRadius : 5,marginTop : 10, marginHorizontal : 20,justifyContent : "flex-start"}}>
                

                <Text style={{width : "100%", fontFamily : "Inter-Bold", fontSize : 15,marginBottom : 0,color : theme.dark_gray}}>{"🍴Plat"}
                </Text>

                    <View style={{width : "100%", flexDirection : "row",justifyContent : "flex-start",alignItems : "flex-end"}}>
                        

                        <View style={{flexDirection : "row",marginLeft : 5,alignItems : "center"}}>
                            {/* <FontAwesome name={"pencil"}  color={theme.gray}/> */}
                            <TextInput textContentType="" numberOfLines={1}  placeholder='pasta...' style={{fontFamily : "Inter-SemiBold",marginLeft : 2}}/>
                        </View>
                    </View>
                </View>






                <View style={{ backgroundColor : theme.light_gray,alignItems : "center",paddingVertical : 5,paddingHorizontal : 10,borderRadius : 5,marginTop : 10, marginHorizontal : 20,justifyContent : "flex-start"}}>
                

                <Text style={{width : "100%", fontFamily : "Inter-Bold", fontSize : 15,marginBottom : 0,color : theme.dark_gray}}>{"💬Avis"}
                </Text>

                    <View style={{width : "100%", flexDirection : "row",justifyContent : "flex-start",alignItems : "flex-end"}}>
                        

                        <View style={{flexDirection : "row",marginLeft : 5, paddingBottom : 20,alignItems : "center"}}>
                            {/* <FontAwesome name={"pencil"}  color={theme.gray}/> */}
                            <TextInput numberOfLines={2} placeholder='Très bon... ' style={{fontFamily : "Inter-SemiBold",marginLeft : 2, height : "200%"}}/>
                        </View>
                    </View>
                </View>

                {/* <View style={{ marginHorizontal : 20, borderBottomColor: theme.light_gray, borderBottomWidth: 2, marginVertical: 0 }} /> */}


                <TouchableOpacity activeOpacity={0.8}>
                    <View style={{backgroundColor : theme.text,margin : 20,justifyContent : "center",alignItems : "center",borderRadius : 10}}>
                        <Text style={{fontFamily : "Inter-Bold", fontSize : 15,color : theme.background,padding : 10}}>Envoyer</Text>
                    </View>
                </TouchableOpacity>
            </SafeAreaView>
        </View> 
    )
}