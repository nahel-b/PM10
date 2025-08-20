import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Keyboard,Modal,Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation,useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {useRestaurant} from '../context/RestaurantsContext';
import Slider from '@react-native-community/slider';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';


import { ToastNotif } from '../Utils';
import { Rating } from 'react-native-ratings';
import { addReviewToRestaurant } from '../Api';
import Toast from 'react-native-toast-message';

import { emojis } from '../data/Emojis';
import { ScrollView } from 'react-native-gesture-handler';

const NewAvisView = () => {
    const { theme, themeName } = useTheme();
    const navigation = useNavigation();

    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedPlat, setSelectedPlat] = useState('');

    const [prix, setPrix] = useState(0);
    const [previousSliderValue, setPreviousSliderValue] = useState(0);

    const [isSliderActive, setIsSliderActive] = useState(false);
    const [isCurrentDate, setIsCurrentDate] = useState(true);

    const {dish,updateRestaurant} = useRestaurant();

    const opacity = useSharedValue(0);

    const { restaurants} = useRestaurant();



    // const platsPredefinis = ['🍕 Pizza', '🍝 Pasta', '🥗 Salad', '🍔 Burger', '🍣 Sushi'];

    const refInput = useRef(null);
    const refAvisInput = useRef(null);

    const [date, setDate] = useState(null);
    const [comment,setComment] = useState('');




    const platsGlobal = dish;

    //TODO : A changer
    const [platsPredefinis,setPlatsPredefinis] = useState(dish);
    
    const [emojiModalVisible, setEmojiModalVisible] = useState(false);

    
    

    const route = useRoute();
    const  {avisModifier} = route?.params || {};
    const {goBackScreenName} = route?.params || null;
    const {EnvoieDirect}= route.params || true;

    const rating = route.params?.rating || null; 

    const {restaurantId} = route.params || null;

    //const translateY = useSharedValue(0);

    if (emojiModalVisible) {
        opacity.value = withTiming(0.7, { duration: 300, easing: Easing.out(Easing.exp) });
       // translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.exp) });
      } else {
        opacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.exp) });
        //translateY.value = withTiming(300, { duration: 300, easing: Easing.in(Easing.exp) });
      }
    
      const animatedStyle = useAnimatedStyle(() => {
        return {
          opacity: opacity.value,
          zIndex: emojiModalVisible ? 1 : -1,
         // transform: [{ translateY: translateY.value }],
        };
      });

    useEffect(() => {
        //setSuggestions(platsPredefinis)

       //set suggestions de tous les plats du restaurant d'id restaurantId

        if(restaurantId){

            let liste = restaurants.filter(restaurant => restaurant.id == restaurantId)[0].reviews.map(avis => avis.dish);
            let liste_prix = restaurants.filter(restaurant => restaurant.id == restaurantId)[0].reviews.map(avis => avis.price);
            setSuggestions([...liste]);
            setPlatsPredefinis([...liste]);
            setPrix(Math.max(...liste_prix));

        }
        //mettre le prix qui apparait le plus dans liste_prix


        

        if(avisModifier)
            {
                setSelectedPlat(avisModifier.dish)
                setInputValue(avisModifier.dish.name)
                setPrix(avisModifier.price)
                setComment(avisModifier.comment)
                
            }
    }, []);

    const handleInputChange = (text) => {
        setInputValue(text);
        setSelectedPlat('');
            console.log(platsGlobal)
            const filteredSuggestions = platsGlobal.filter((plat) =>{
                console.log(plat.name )
            plat.name.toLowerCase().includes(text.toLowerCase())}
        );
        if (text.length > 0 && !platsPredefinis.map(plat => plat.name).includes(text)) {
            filteredSuggestions.push('Ajouter ce plat');
            setSuggestions(filteredSuggestions);

        }
        else 
        {
            setSuggestions(platsPredefinis);
            console.log("setSuggestions");
        }
    
    };

    const handleEmojiPress = (emoji) => {
        setSelectedPlat({ ...selectedPlat, emoji }); // Associer l'émoji sélectionné au plat
        setEmojiModalVisible(false); // Fermer le modal
    };

    const handleSuggestionPress = (suggestion) => {
        if (suggestion === 'Ajouter ce plat') {

            console.log("Ajouter un plat à ce restaurant");
            let newPlat = {
                name: inputValue,
                emoji: '🍴',
                id : 'new'
            };

            setSelectedPlat(newPlat);

            setEmojiModalVisible(true);
            
            // unfocus input
            refInput.current.blur();
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              )


        } 
        else 
        {
            setSelectedPlat(suggestion);
            setInputValue(suggestion.name);
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


    const handleSliderChange = (value) => {
         setPrix(Math.round(value * 10) / 10)   
        //arrondir a 0.1 près
        if (Math.abs(value - previousSliderValue) >= 0.1) {
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              )
            setPreviousSliderValue(value);
        }
        
    };



    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const cancelDatePicker = () => {
        setDate(null);
        hideDatePicker();
        setIsCurrentDate(true);
    };
    const handleConfirm = (date) => {
        
        hideDatePicker();
        // check if date is not in the future
        if (new Date(date) > new Date()) {
            
            ToastNotif("La date ne peut pas être dans le futur", "times-circle", { button_background: "red", text: "white" }, "white", 3000);
            setIsCurrentDate(true);
            setDate(null);
        }
        else {
            setIsCurrentDate(false);
            setDate(date);
        }
    };

    return (
        <View style={{
            backgroundColor: theme.background,
            flex: 1,
            width: "100%",
            alignSelf: "center"
        }}>
            <Animated.View style={[{
                width: '100%',
                backgroundColor: "black",
                borderRadius: 10,
                padding: 20,
                alignSelf : 'flex-start',
                position: 'absolute',
                top: 0,
                zIndex: 1,
                height: '100%'

            }, animatedStyle]}/>
            <TouchableOpacity onPress={() => { navigation.goBack() }}>
                <View style={{ alignItems: "flex-end", marginRight: 10, marginTop: 10 }}>
                    <Ionicons name="close" size={30} color="gray" />
                </View>
            </TouchableOpacity>
            <View style={{ paddingHorizontal: 20 }}>
                <Text style={{ fontFamily: "Inter-Black", fontSize: 24, color: theme.text }}>
                    Ajouter un plat
                </Text>
            </View>
            
            {/* Input avec suggestions */}
            <TouchableOpacity activeOpacity={0.8} onPress={() => {
                //donner le focus à l'input
                refInput.current.focus();
            }}>
            <View style={{flexDirection : 'row', backgroundColor: selectedPlat == '' ? theme.light_gray : theme.background_green, paddingVertical: 10, paddingHorizontal: 5, borderRadius: 10, marginTop: 30, marginHorizontal: 20 }}>
                
               
               <TouchableOpacity onPress={() => {

                if(selectedPlat.id == 'new'){
                setEmojiModalVisible(true)}
                }
                }>
                <Text style={{marginLeft : 2, fontFamily: "Inter-Bold", fontSize: 15, color: theme.dark_gray }}>
                {selectedPlat && selectedPlat.name && selectedPlat.name.length > 0 ? selectedPlat.emoji : '🍴'}
                </Text>
                </TouchableOpacity>

                <TextInput
                    placeholder='Plat (pasta,...)'
                    placeholderTextColor={theme.dark_gray}
                    style={{fontSize:selectedPlat == '' ? 15 : 18, fontFamily: selectedPlat == '' ?  "Inter-SemiBold" : "Inter-Bold",color : selectedPlat == '' ? theme.text : theme.green, marginLeft: 2, marginTop: 3 }}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    ref={refInput}
                />
                
            </View>
            </TouchableOpacity>
            {
                selectedPlat === '' &&
            (
                inputValue.length === 0 ? (
                    <Text style={{ marginHorizontal: 22, color: theme.dark_gray, marginTop: 5,marginBottom : -2, fontFamily: "Inter-SemiBold" }}>
                        Plats déjà ajoutés à ce restaurant :
                    </Text>
                ) : 

                suggestions.length > 1 && inputValue.length > 0 ? (
                    <Text style={{ marginHorizontal: 22, color: theme.dark_gray, marginTop: 5,marginBottom : -2, fontFamily: "Inter-SemiBold" }}>
                        Tous les plats :
                    </Text>
                ) :

                ((
                        suggestions.length == 1 && inputValue.length > 0 ? (
                            <Text style={{ marginHorizontal: 22, color: theme.middle_red, marginTop: 5,marginBottom : 0, fontFamily: "Inter-SemiBold" }}>
                                Ce plat n'existe pas dans l'appli, ameliore l'appli en l'ajoutant 😁
                            </Text>
                        ) : null
                    )

                )
              
                )
            }
            {
            selectedPlat === '' &&(

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
                            <Text style={{  color: theme.text,fontFamily : "Inter-SemiBold" }}>
                                {"Ajouter '"}
                                <Text style={{  color: theme.text,fontFamily : "Inter-Black" }}>{inputValue}</Text>
                                {"' à l'appli"} 
                            </Text>
                            </>
                        ) : 
                        <Text style={{  color: theme.text,fontFamily : "Inter-Bold" }}>
                            {item.emoji} {item.name}
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


             {/* Slider pour le prix */}
             <View style={{
                marginHorizontal: 20,
                marginTop: 15,
                marginBottom: 5,
                paddingVertical: 10,
                paddingHorizontal: 10,
                backgroundColor: theme.light_gray,
                borderRadius: 10,
             }}>
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: theme.dark_gray }}>
                    Prix :
                </Text>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Slider
                        style={{ flex: 1, marginRight: 10 }}
                        minimumValue={0}
                        maximumValue={10.5}
                        step={0.1}
                        value={prix}
                        onValueChange={handleSliderChange}
                        minimumTrackTintColor={theme.dark_gray}
                        maximumTrackTintColor={theme.background}
                        thumbTintColor={theme.dark_gray}
                        thumbStyle={{
                            width: 10, // Réduire la taille du thumb en ajustant la largeur
                            height: 10, // Réduire la taille du thumb en ajustant la hauteur
                            borderRadius: 0, // Assurez-vous que le thumb reste circulaire
                        }}
                        onSlidingStart={() => 
                            {setIsSliderActive(true)

                            }}

                        onSlidingComplete={() =>

                            {
                                //arrondir à 0.1 près
                                setPrix(Math.round(prix * 10) / 10)
                                setIsSliderActive(false)
                               Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Success
                                ) 
                            }
                        }
                    />
                    <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: isSliderActive ? theme.gray : theme.text }}>
                        {prix.toFixed(2)} €
                    </Text>
                </View>
            </View>

            {/* Input pour l'avis */}
            <TouchableOpacity activeOpacity={0.8} onPress={()=>
                {
                    //donner le focus à l'input
                    refAvisInput.current.focus();
                }}>
            <View style={{ backgroundColor: theme.light_gray, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, marginTop: 10, marginHorizontal: 20 }}>
                <Text style={{ width: "100%", fontFamily: "Inter-Bold", fontSize: 15, color: theme.dark_gray }}>
                    💬 Avis
                </Text>
                <TextInput
                    numberOfLines={3}
                    multiline={true}
                    placeholder='Très bon... '
                    placeholderTextColor={theme.gray}
                    blurOnSubmit={true}
                    onChangeText={(text)=>{setComment(text)}}
                    value={comment}
                    onSubmitEditing={Keyboard.dismiss}
                    ref={refAvisInput}
                    style={{
                        fontFamily: "Inter-SemiBold",
                        marginLeft: 2,
                        textAlignVertical: 'top',
                        color: theme.text,
                        maxHeight: 100,
                        marginBottom: 3
                    }}
                />
            </View>
            </TouchableOpacity>


            <View style={{ marginHorizontal: 20,marginBottom : 10, marginTop : 30, flexDirection : "row",justifyContent : "space-between" }} >
           <View style={{flex : 1}}>
            <BouncyCheckbox
                  size={23}
                  fillColor={theme.blue}
                  // unfillColor={theme.background}
                  iconStyle={{ borderColor: theme.blue }}
                  onPress={() => {
                    if(isCurrentDate)
                        {
                            showDatePicker();
                        }
                    else
                        {
                            setDate(null);
                        }
                    setIsCurrentDate(!isCurrentDate)
                }}
                  isChecked={isCurrentDate}
                  text={"Date actuelle"}
                  textStyle={{ color: date ? theme.gray : theme.text,fontFamily: 'Inter-SemiBold',fontSize: 16,textDecorationLine: 'none', margin : -10}}
                  textContainerStyle={{marginHorizontal : 10, flex : 1}}
                />
                </View>
                <Text style={{ fontFamily: "Inter-SemiBold", fontSize: 15, color: date ? theme.text : theme.dark_gray,marginRight : 5 }}>
                    {date
                    ? date.toLocaleDateString('fr-FR', {
                        weekday: undefined, // Ne pas afficher le jour de la semaine
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                    : 'Aujourd\'hui'}
                </Text>
            </View>

            <TouchableOpacity activeOpacity={0.8}
                    // disabled={!(selectedPlat && prix != 0 && comment && comment.length>0)}
                    onPress={
                        async ()=>
                            
                            {

                                if(!selectedPlat)
                                    {
                                        ToastNotif("Sélectionne le plat", "times-circle", { button_background: theme.background, text: theme.red  }, theme.red, 3000);

                                    }
                                else if( prix == 0)
                                    {
                                        ToastNotif("Sélectionne le prix", "times-circle", { button_background: theme.background, text: theme.red  }, theme.red, 3000);
                                    }
                                else if( !comment || comment.length == 0)
                                        {
                                            ToastNotif("Ecris au moins un petit commentaire", "times-circle", { button_background: theme.background, text: theme.red  }, theme.red, 3000);
                                        }

                                else if( comment.length < 5)
                                    {
                                        ToastNotif("Ecris un commentaire plus long", "times-circle", { button_background: theme.background, text: theme.red }, theme.red, 3000);

                                    }
                                    else if (comment.length > 200)
                                        {
                                            ToastNotif("Ton commentaire est trop long", "times-circle", { button_background: theme.background, text: theme.red }, theme.red, 3000);
                                        }
                                else if(!EnvoieDirect && goBackScreenName)
                                    {
                                        const datemtn = new Date();
                                navigation.navigate(goBackScreenName,
                                    {newAvis : 
                                        {
                                            dish : 
                                            {
                                                name : selectedPlat.name,
                                                emoji : selectedPlat.emoji,
                                                id : selectedPlat.id
                                            },
                                            comment : comment,
                                            price : prix,
                                            date_visite : date ? date.toDateString() : datemtn.toDateString(),
                                        }
                                    }
                                )}
                                else if(EnvoieDirect)
                                    {
                                        try{
                                            console.log("rating : ",rating);
                                        const res = await addReviewToRestaurant(restaurantId,
                                            {
                                                dish : 
                                                {
                                                    name : selectedPlat.name,
                                                    emoji : selectedPlat.emoji,
                                                    id : selectedPlat.id
                                                },
                                                rating ,
                                                comment : comment,
                                                price : prix,
                                                date_visite : date ? date.toDateString() : new Date().toDateString(),
                                            }

                                        )
                                        if(res.error)
                                            {

                                                throw res.error;
                                            }
                                           // console.log("Nouveau avis : ",res.newData);
                                        updateRestaurant(restaurantId,res.newData)
                                        ToastNotif("Avis envoyé", "check-circle", theme, "green", 2000);
                                        
                                        navigation.goBack();
                                        }
                                        catch(error)
                                        {
                                            //console.log("Erreur lors de l'envoie de l'avis : ",error);
                                            ToastNotif("Erreur lors de l'envoie de l'avis", "times-circle", { button_background: theme.background, text: theme.red }, theme.red, 3000);
                                        }
                                    }
                                    else{
                                        console.log("Erreur");
                                    }

                            }
                    }
            >
                <View style={{
                    backgroundColor: selectedPlat && prix != 0 && comment && comment.length <200 && comment.length>5 ? theme.text :  theme.light_gray,
                    margin: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 10
                }}>
                    <Text style={{
                        fontFamily: "Inter-Bold",
                        fontSize: 15,
                        color: theme.background,
                        padding: 10
                    }}>
                        {EnvoieDirect ? "Envoyer" : "Valider"}
                    </Text>
                </View>
            </TouchableOpacity>


            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={cancelDatePicker}
                isDarkModeEnabled={themeName === 'dark'}
            />


            <Modal visible={emojiModalVisible} transparent={true} animationType="slide">
                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'transparent' }}>
                        <View style={{ backgroundColor: theme.background, padding: 20, borderRadius: 10 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ marginBottom: 10,fontSize : 16,color : theme.text,fontFamily:"inter-Bold" }}>Sélectionnez un émoji</Text>
                            {/* <FontAwesome name="times" size={20} color={theme.gray} onPress={() => setEmojiModalVisible(false)} /> */}
                            </View>
                            <ScrollView style={{maxHeight : Dimensions.get('window').height / 2 }}>

                            <View style={{ flexDirection: 'row',justifyContent : 'center', flexWrap: 'wrap' }}>
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
        </View>
    );
};

export default NewAvisView;
