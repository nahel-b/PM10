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
                    <Text style={{fontFamily: "Inter-Black", fontSize : 22}}>
                        Rédiger un avis
                    </Text>
                </View>
                <View style={{ marginHorizontal : 20, borderBottomColor: theme.light_gray, borderBottomWidth: 2, marginVertical: 15 }} />

                <View style={{flexDirection:"row", justifyContent:"flex-start" ,alignItems : "center",padding : 5,borderRadius : 5, marginHorizontal : 20, backgroundColor : theme.background}}>
                    {/* <Text style={{fontFamily : "Inter-Bold", fontSize : 20,color : theme.dark_gray}}>
                    Note</Text> */}
                <Rating
                    type='custom'
                    ratingColor={"#FFC300"}
                    ratingBackgroundColor={theme.gray}
                    startingValue={5}
                    imageSize={40}
                    
                    tintColor={theme.background}
                    style={{ marginLeft: -5 }}
                    />
                </View>

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
                    <View style={{backgroundColor : theme.blue,margin : 20,justifyContent : "center",alignItems : "center",borderRadius : 10}}>
                        <Text style={{fontFamily : "Inter-Bold", fontSize : 15,color : "white",padding : 10}}>Envoyer</Text>
                    </View>
                </TouchableOpacity>
            </SafeAreaView>
        </View> 
    )
}