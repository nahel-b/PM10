import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity, ActivityIndicator,ScrollView } from 'react-native';
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

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');


import MapView from "react-native-map-clustering";
import { useRestaurant } from './context/RestaurantsContext';
import { useNavigation } from '@react-navigation/native';
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


export default AvisView = ({}) => {

    const { theme,changeTheme,themeName } = useTheme();
    const navigation = useNavigation();

    const indicatorPosition = useSharedValue(0);
    const [index, setIndex] = useState(0);
    const switchRef = useRef(null);
    const ModeName = ["☀️ Light mode","🌑 Dark mode","🤖 Auto"]
    const themeNames = ["light","dark","auto"]

    useEffect(() => {
        
        indicatorPosition.value = withSpring(index === 0 ? 3 : (index === 1 ? 42 : 83 ),{damping: 30, stiffness: 200,});
      }, [index]);

    useEffect(()=>
        {
            setIndex(themeNames.findIndex(index => index === themeName ))
            console.log(themeNames.findIndex((index) => {index === themeName} ))
        },[])

      const animatedIndicatorStyle = useAnimatedStyle(() => {
        return {
          transform: [{ translateX: indicatorPosition.value }],
        };
      });

      const handleSwitch = (newIndex) => {
        setIndex(newIndex);
        changeTheme(newIndex ===0 ? "light" : (newIndex ===1 ? "dark" : "auto"))
      };


    return (
        <View style={{flex : 1, backgroundColor : theme.background}}>
            <SafeAreaView>
                <TouchableOpacity onPress={()=>{navigation.goBack()}}>
                    <View style={{alignItems : "flex-end", paddingHorizontal :20 }}>
                    <Ionicons name="close" size={30} color="gray" />
                    </View>
                </TouchableOpacity>
                <View style={{paddingHorizontal : 20}}>
                    <Text style={{fontFamily: "Inter-Black",color : theme.text, fontSize : 22}}>
                        Réglage
                    </Text>
                </View>


                <View style={{ marginHorizontal : 20, borderBottomColor: theme.light_gray, borderBottomWidth: 2, marginVertical: 15 }} />

                

                <View style={{ flexDirection : "row", backgroundColor : theme.light_gray,alignItems : "center",paddingVertical : 5,paddingHorizontal : 10,borderRadius : 5,marginTop : 10, marginHorizontal : 20,justifyContent : "space-between"}}>

                        <Text style={{fontFamily : "Inter-Bold", fontSize : 15,color : theme.text_light}}>
                            {"🇫🇷 Langue"}
                        </Text>
                    <View style={{flexDirection:"row",alignItems : "center"}}>
                        <Text style={{alignSelf : "center",marginRight : 4, fontFamily : "Inter-Bold", fontSize : 11,color : theme.gray}}>
                        francais selectionné
                        </Text>
                        <FontAwesome6 name="chevron-right" size={15} color={theme.dark_gray} style={{ }} />
                    </View>
                </View>


                <View style={{ flexDirection : "row", backgroundColor : theme.light_gray,alignItems : "center",paddingLeft : 10,borderRadius : 10,marginTop : 10, marginHorizontal : 20,justifyContent : "space-between"}}>
               
                <Text style={{fontFamily : "Inter-Bold", fontSize : 15,color : theme.text_light}}>
                            {ModeName[index]}
                        </Text>

                <View ref={switchRef} style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center', // Ajouter cet alignement
                    
                    backgroundColor : theme.light_gray,
                    borderRadius: 10,
                    width: 'auto',
                    alignSelf: 'center',
                    height: 40,
                }}>
                
                <Animated.View style={[{
                    position: 'absolute',
                    width: 33,
                    height: '80%',
                    backgroundColor: theme.background, // Couleur de l'indicateur
                    borderRadius: 8,


                }, animatedIndicatorStyle]} />


                    <TouchableOpacity
                    onPress={
                        ()=>{handleSwitch(0)}
                    }
                    style={{
                        padding: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,

                    }}>
                    <Text style={{ fontFamily : "Inter-Bold", fontSize : 13,marginBottom : 0,color : theme.dark_gray}}>
                    {"☀️ "}
                    </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    onPress={
                        ()=>{handleSwitch(1)}
                    }
                    style={{
                        padding: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,

                    }}>
                    <Text style={{ fontFamily : "Inter-Bold", fontSize : 13,marginBottom : 0,color : theme.dark_gray}}>
                        {"🌑 "}
                    </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                    onPress={
                        ()=>{handleSwitch(2)}
                    }
                    style={{
                        padding: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,

                    }}>
                    <Text style={{ fontFamily : "Inter-Bold", fontSize : 13,marginBottom : 0,color : theme.text_light}}>
                    {"🤖 "}
                    </Text>
                    </TouchableOpacity>


                </View>


                </View>



                <View style={{ backgroundColor : theme.light_gray,alignItems : "center",paddingVertical : 5,paddingHorizontal : 10,borderRadius : 5,marginTop : 10, marginHorizontal : 20,justifyContent : "flex-start"}}>
                

                <Text style={{width : "100%", fontFamily : "Inter-Bold", fontSize : 15,marginBottom : 0,color : theme.dark_gray}}>{"💬Avis"}
                </Text>

                    <View style={{width : "100%", flexDirection : "row",justifyContent : "flex-start",alignItems : "flex-end"}}>
                        

                        <View style={{flexDirection : "row",marginLeft : 5, paddingBottom : 20,alignItems : "center"}}>
                            {/* <FontAwesome name={"pencil"}  color={theme.gray}/> */}
                            <TextInput numberOfLines={2} placeholderTextColor={theme.gray} placeholder='Très bon... ' style={{fontFamily : "Inter-SemiBold",color : theme.text_light, marginLeft : 2, height : "200%"}}/>
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