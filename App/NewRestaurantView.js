import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useTheme } from './context/ThemeContext';
import { useRestaurant } from './context/RestaurantsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation,useRoute,useIsFocused } from '@react-navigation/native';
import CustomModal from './ModalMenue';
import Slider from '@react-native-community/slider';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Rating } from 'react-native-ratings';
import { ToastNotif } from './Utils';
import { addRestaurant } from './Api';

function NewAvisView ({})  {
    const { theme, themeName } = useTheme();
    const { typeRestaurants, setTypeRestaurants} = useRestaurant();

    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedRestaurant,setSelectedRestaurant] = useState('');
    const refNomInput = useRef();
    const [selectedName, setSelectedName] = useState(''); 

    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const route = useRoute();
    const  {currentMapRegion} = route.params || {};
    const [latlong,setLatlong] = useState(null);
    const [avis,setAvis] = useState(null);
    const [rating,setRating] = useState(null);
    const refInput = useRef(null);
    const refAvisInput = useRef(null);


    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => {
      setIsModalVisible(true);
    };
  
    const closeModal = () => {
      setIsModalVisible(false);
    };

    const HandleFeedback = (rating) => 
        {
            console.log(rating)
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              )
            setRating(rating);
        }


    useEffect(() => {
        setSuggestions(typeRestaurants)
        if(currentMapRegion)
            {
                setLatlong(currentMapRegion)
            }
    }, []);

    useEffect(() => {
        if (isFocused) {
          // Vérifiez s'il y a une nouvelle valeur dans les params
          const {newAvis} = route.params || null;
          setAvis(newAvis)
        }
      }, [isFocused]);

    

    const handleInputChange = (text) => {
        setInputValue(text);
        setSelectedRestaurant('');

            const filteredSuggestions = typeRestaurants.filter((plat) =>
            plat.toLowerCase().includes(text.toLowerCase())
        );
        if (text.length > 0 && !typeRestaurants.includes(text)) {
            filteredSuggestions.push('Ajouter ce type de Restaurant');
            setSuggestions(filteredSuggestions);

        }
        else 
        {
            setSuggestions(typeRestaurants);
        }
    
    };

    const handleSuggestionPress = (suggestion) => {

        //TODO
        if (suggestion === 'Ajouter ce type de restaurant') {

            //TODO

        } 
        else 
        {
            setSelectedRestaurant(suggestion);
            setInputValue(suggestion);
            // unfocus input
            refInput.current.blur();
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              )
            console.log("Plat choisi : ", suggestion);
        }
        // setInputValue('');
        // setSuggestions([]);
    };

    const HandleSubmitName = (text) => 
        {
            Keyboard.dismiss();
            console.log("text",text.nativeEvent.text)
            setSelectedName(text.nativeEvent.text);
        }

  
        




    return (
        <View style={{
            backgroundColor: theme.background,
            flex: 1,
            width: "100%",
            alignSelf: "center"
        }}>
            <TouchableOpacity onPress={() => { navigation.goBack() }}>
                <View style={{ alignItems: "flex-end", marginRight: 10, marginTop: 10 }}>
                    <Ionicons name="close" size={30} color="gray" />
                </View>
            </TouchableOpacity>
            <View style={{ paddingHorizontal: 20 }}>
                <Text style={{ fontFamily: "Inter-Black", fontSize: 24, color: theme.text }}>
                    ✨ Ajouter une pépite
                </Text>
            </View>
            
            {/* Input avec suggestions */}
            <View style={{flexDirection : 'row', 
                backgroundColor: selectedRestaurant == '' ? theme.light_gray : theme.background_green, paddingVertical: 10, paddingHorizontal: 5, borderRadius: 5, marginTop: 20, marginHorizontal: 20 }}>
                
               
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: theme.dark_gray }}>
                {'🍴'}
                </Text>

                <TextInput
                    placeholder='Type de restaurant (pizzeria,...)'
                    placeholderTextColor={theme.dark_gray}
                    style={{fontSize:selectedRestaurant == '' ? 15 : 16, fontFamily: selectedRestaurant == '' ?  "Inter-SemiBold" : "Inter-SemiBold",color : selectedRestaurant == '' ? theme.text : theme.green, marginLeft: 0, marginTop: 3 }}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    ref={refInput}
                />
                
            </View>
            {
                selectedRestaurant === '' &&
            (
                inputValue.length === 0 ? (
                    null
                ) : 

                suggestions.length > 1 && inputValue.length > 0 ? (
                    null
                    // <Text style={{ marginHorizontal: 22, color: theme.dark_gray, marginTop: 5,marginBottom : -2, fontFamily: "Inter-SemiBold" }}>
                         
                    // </Text>
                ) :

                ((
                        suggestions.length == 1 && inputValue.length > 0 ? (
                            <Text style={{ marginHorizontal: 22, color: theme.red, marginTop: 5,marginBottom : -2, fontFamily: "Inter-SemiBold" }}>
                                Ce type de restaurant n'existe pas dans l'appli, ameliore l'appli en l'ajoutant 😁
                            </Text>
                        ) : null
                    )

                )
                // (
                //     inputValue.length > 0 ? (
                        
                //         <Text style={{ marginHorizontal: 20, color: theme.dark_gray, marginTop: 20, fontFamily: "Inter-SemiBold" }}>
                //             Ce plat n'a jamais été ajouté
                //         </Text>)
                //         :
                //         null
                // )
                )
            }
            {
            selectedRestaurant === '' &&(

        <FlatList
            data={ suggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item,index }) => (
                <TouchableOpacity activeOpacity={0.8} onPress={() => handleSuggestionPress(item)}>
                    <View style={{ marginHorizontal: 20,marginBottom : 4, borderColor : theme.gray,borderWidth : 1 ,backgroundColor : theme.light_gray,borderRadius : 10  }}>
                        <View style={{ padding: 10,flexDirection: 'row',alignItems : "center"}}>
                        {
                            (index === suggestions.length - 1) && inputValue.length > 0  ? (
                                <>
                                <FontAwesome name="plus-circle" size={16} color={theme.dark_gray} style={{marginRight : 5  }} />
                                <Text style={{  color: theme.text,fontFamily : "Inter-Medium" }}>
                                    {"Ajouter '"}
                                    <Text style={{  color: theme.text,fontFamily : "Inter-Black" }}>{inputValue}</Text>
                                    {"' à l'appli"} 
                                </Text>
                                </>
                            ) : 
                            <Text style={{  color: theme.text,fontFamily : "Inter-Bold" }}>
                                {item}
                            </Text>
                        }
                        
                        </View>
                    </View>
                </TouchableOpacity>
            )}
                        style={{
                            maxHeight: ( suggestions.length > 4 ? 4 : suggestions.length ) * 47 ,
                            borderRadius: 5,
                            marginTop: 5,
                            zIndex: 1,
                        }}
                        scrollEnabled={ suggestions.length > 4 ? true : false}
                        contentContainerStyle={{ flexGrow: 1 }}
                />
            )}


            

                <TouchableOpacity activeOpacity={0.8} onPress={()=>
                {
                    //donner le focus à l'input
                    refNomInput.current.focus();
                }}>
            
            <View style={{flexDirection : 'row', backgroundColor: selectedName == '' ? theme.light_gray : theme.background_green, paddingVertical: 10, paddingHorizontal: 5, borderRadius: 5, marginTop: 10, marginHorizontal: 20 }}>
                
               
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: theme.dark_gray }}>
                {'✏️'}
                </Text>

                <TextInput
                    placeholder='Nom du restaurant...'
                    placeholderTextColor={theme.dark_gray}
                    style={{width : '100%',fontSize:selectedName == '' ? 16 : 16, fontFamily: selectedName == '' ?  "Inter-SemiBold" : "Inter-SemiBold",color : selectedName == '' ? theme.text : theme.green, marginLeft: 5, marginTop: 3 }}
                    onSubmitEditing={HandleSubmitName}
                    onChangeText={()=>setSelectedName('')}
                    ref={refNomInput}
                />
                
            </View>
            </TouchableOpacity>  
            <View style={{marginTop : 15, flexDirection:"column", justifyContent:"flex-start" ,alignItems : "flex-start",padding : 5,borderRadius : 5, marginHorizontal : 20, backgroundColor : theme.background}}>
                    
                    
                    <Text style={{fontFamily : "Inter-Bold", fontSize : 15,color : theme.dark_gray}}>
                     Note général du restaurant</Text>
                <Rating
                    type='custom'
                    ratingColor={"#FFC300"}
                    ratingBackgroundColor={theme.gray}
                    startingValue={0}
                    imageSize={30}
                    fractions={0}
                    onFinishRating=
                    {
                        (rating) => HandleFeedback(rating)
                    }
                    tintColor={theme.background}
                    style={{ marginLeft: 0 }}
                    />
                </View>


            {/* <View style={{flexShrink : 2, flex : 1}}/> */}

            {
                avis ? (
                
                <View style={{marginHorizontal : 20,marginTop : 20}}>
                    <Text style={{marginBottom : 6, fontFamily: 'Inter-SemiBold', fontSize: 15, color: theme.gray}}>Votre avis :</Text>
                <AvisComp review={avis} theme={theme} openModal={openModal}/> 
                
                </View>)
                :
                
                (
            <TouchableOpacity disabled={!rating || selectedName == '' || selectedRestaurant == ''} activeOpacity={0.8} onPress={()=>
                    {
                        navigation.navigate("NewAvisView",{envoieDirect : false,goBackScreenName : "NewRestaurantView"})
                        
                        // ToastNotif("Ajout d'un avis","check-circle",theme,"green",2000)
                        }}>
                <View style={{marginTop : 20, backgroundColor: rating && selectedName != '' && selectedRestaurant != '' ? theme.blue : theme.light_gray, marginHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome name={"plus"} color={rating && selectedName != '' && selectedRestaurant != '' ? theme.text : theme.gray} size={14} />
                    <Text style={{ marginLeft: 5, fontFamily: 'Inter-Bold', fontSize: 13.5, color: rating && selectedName != '' && selectedRestaurant != '' ? theme.text : theme.gray, paddingVertical: 12 }}>Ajouter un plat</Text>
                    </View>
                </View>
            </TouchableOpacity>)


            }


            {avis && <TouchableOpacity disabled={!rating || selectedName == '' || selectedRestaurant == ''} activeOpacity={0.8} onPress={ async ()=>
                    {



                        try{
                        const res = await addRestaurant({title : selectedName, type : selectedRestaurant,coordinate : {latitude : latlong.latitude,longitude : latlong.longitude},rating : 0,review : avis,rating : rating});
                        if(res.error)
                            {
                                ToastNotif("Erreur lors de l'ajout du restaurant", "times-circle", { background: theme.red, text: "white" }, "white", 3000);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                            }
                            else
                            {
                                ToastNotif("Restaurant ajouté avec succès", "check-circle", theme, theme.gree, 3000);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                navigation.goBack();
                            }
                        }
                        catch(e)
                        {
                            ToastNotif("Erreur lors de l'ajout du restaurant", "times-circle", { button_background: theme.red, text: "white" }, "white", 3000);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

                        }

                        // ToastNotif("Ajout d'un avis","check-circle",theme,"green",2000)







                        }}>
                <View style={{marginTop : 20, backgroundColor: selectedName != '' && selectedRestaurant != '' ? theme.blue : theme.light_gray, marginHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome5 name={"concierge-bell"} color={selectedName != '' && selectedRestaurant != '' ? theme.text : theme.gray} size={16} />
                    <Text style={{ marginLeft: 5, fontFamily: 'Inter-Bold', fontSize: 13.5, color: selectedName != '' && selectedRestaurant != '' ? theme.text : theme.gray, paddingVertical: 12 }}> Suggérer ce restaurant</Text>
                    </View>
                </View>
            </TouchableOpacity>}
            <CustomModal
                    visible={isModalVisible}
                    onClose={closeModal}
                    title={"Commentaire"}
                    options={
                        [
                            { label: "Modifier", handle: () => {navigation.navigate("NewAvisView",{envoieDirect : false,avisModifier : avis,goBackScreenName : "NewRestaurantView"})
                             closeModal()} },
                            { label: "Supprimer",dangerous : true, handle: () => {setAvis(null); closeModal()} },
                        ]}
                /> 
        </View>
    );
};


const AvisComp = ({review,theme,openModal}) => {


    return(
        <View style={{  backgroundColor : theme.light_gray,padding : 5,paddingHorizontal : 15,borderRadius : 10, }}>
            
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View>
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
                            <View>
                                <TouchableOpacity onPress={openModal}>
                                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 11, color: 'gray', textDecorationLine: 'none' }}>
                                    <Feather name="more-horizontal" size={25} color="gray" />
                                </Text>
                                </TouchableOpacity>
                            </View>
                        </View>


                        <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: 'gray', marginVertical: 5 }}>
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
    )
}

export default NewAvisView;
