import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Keyboard,Modal,Dimensions, Platform } from 'react-native';
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
import BouncyAppear from '../components/BouncyAppear';


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
        <SafeAreaView style={{
            backgroundColor: theme.background,
            flex: 1,
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
            
            {/* Header avec bouton de fermeture */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0, 0, 0, 0.05)',
                marginBottom: 20,
            }}>
                <Text style={{ 
                    fontFamily: "Inter-Black", 
                    fontSize: 24, 
                    color: theme.text,
                    letterSpacing: -0.5 
                }}>
                    Ajouter un avis
                </Text>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={{
                        backgroundColor: theme.light_gray,
                        borderRadius: 20,
                        padding: 8,
                    }}
                >
                    <Ionicons name="close" size={20} color={theme.dark_gray} />
                </TouchableOpacity>
            </View>

            {/* Contenu scrollable */}
            <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
            
            {/* Input avec suggestions - Style moderne */}
            <BouncyAppear delay={100} pressable={false}>
            <View style={{
                marginHorizontal: 20,
                marginBottom: 15,
            }}>
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    onPress={() => refInput.current.focus()}
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        paddingVertical: 16,
                        paddingHorizontal: 18,
                        borderRadius: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                        borderWidth: selectedPlat !== '' ? 2 : 1,
                        borderColor: selectedPlat !== '' ? '#007AFF' : 'rgba(0, 0, 0, 0.05)',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    <TouchableOpacity 
                        onPress={() => {
                            if(selectedPlat.id == 'new'){
                                setEmojiModalVisible(true);
                            }
                        }}
                        style={{
                            backgroundColor: selectedPlat !== '' ? 'rgba(0, 122, 255, 0.1)' : theme.light_gray,
                            borderRadius: 12,
                            padding: 8,
                            marginRight: 12,
                        }}
                    >
                        <Text style={{
                            fontSize: 18,
                            textAlign: 'center',
                        }}>
                            {selectedPlat && selectedPlat.name && selectedPlat.name.length > 0 ? selectedPlat.emoji : '🍴'}
                        </Text>
                    </TouchableOpacity>

                    <TextInput
                        placeholder='Quel plat as-tu dégusté ?'
                        placeholderTextColor={theme.dark_gray}
                        style={{
                            fontSize: selectedPlat === '' ? 16 : 18,
                            fontFamily: selectedPlat === '' ? "Inter-Medium" : "Inter-Bold",
                            color: selectedPlat === '' ? theme.text : '#007AFF',
                            flex: 1,
                        }}
                        value={inputValue}
                        onChangeText={handleInputChange}
                        ref={refInput}
                    />
                    
                    {selectedPlat !== '' && (
                        <View style={{
                            backgroundColor: '#007AFF',
                            borderRadius: 10,
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                        }}>
                            <FontAwesome name="check" size={12} color="white" />
                        </View>
                    )}
                </TouchableOpacity>
            </View>
            </BouncyAppear>
            {/* Messages d'aide - Style moderne */}
            {selectedPlat === '' && (
                <View style={{ marginHorizontal: 22, marginBottom: 10 }}>
                    {inputValue.length === 0 ? (
                        <Text style={{ 
                            color: theme.dark_gray, 
                            fontFamily: "Inter-Medium",
                            fontSize: 14,
                            opacity: 0.7
                        }}>
                            💡 Plats déjà ajoutés à ce restaurant
                        </Text>
                    ) : suggestions.length > 1 && inputValue.length > 0 ? (
                        <Text style={{ 
                            color: theme.dark_gray, 
                            fontFamily: "Inter-Medium",
                            fontSize: 14,
                            opacity: 0.7
                        }}>
                            🔍 Résultats de recherche
                        </Text>
                    ) : suggestions.length === 1 && inputValue.length > 0 ? (
                        <View style={{
                            backgroundColor: 'rgba(255, 59, 48, 0.1)',
                            borderRadius: 12,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderWidth: 1,
                            borderColor: 'rgba(255, 59, 48, 0.2)',
                        }}>
                            <Text style={{ 
                                color: '#FF3B30', 
                                fontFamily: "Inter-Medium",
                                fontSize: 14,
                                textAlign: 'center'
                            }}>
                                ✨ Nouveau plat ! Tu améliores l'app en l'ajoutant �
                            </Text>
                        </View>
                    ) : null}
                </View>
            )}

            {/* Liste des suggestions - Style moderne */}
            {selectedPlat === '' && (
                <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity 
                                activeOpacity={0.7} 
                                onPress={() => handleSuggestionPress(item)}
                                style={{
                                    marginBottom: 8,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.03,
                                    shadowRadius: 4,
                                    elevation: 1,
                                }}
                            >
                                <View style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: 16,
                                    paddingVertical: 14,
                                    paddingHorizontal: 18,
                                    borderWidth: 1,
                                    borderColor: 'rgba(0, 0, 0, 0.05)',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                    {(index === suggestions.length - 1) && inputValue.length > 0 ? (
                                        <>
                                            <View style={{
                                                backgroundColor: '#007AFF',
                                                borderRadius: 10,
                                                padding: 6,
                                                marginRight: 12,
                                            }}>
                                                <FontAwesome name="plus" size={14} color="white" />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{
                                                    color: theme.text,
                                                    fontFamily: "Inter-Medium",
                                                    fontSize: 15,
                                                }}>
                                                    Ajouter "
                                                    <Text style={{ fontFamily: "Inter-Bold" }}>
                                                        {inputValue}
                                                    </Text>
                                                    " à l'app
                                                </Text>
                                            </View>
                                            <Ionicons name="arrow-forward" size={16} color={theme.dark_gray} />
                                        </>
                                    ) : (
                                        <>
                                            <View style={{
                                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                                borderRadius: 10,
                                                padding: 6,
                                                marginRight: 12,
                                            }}>
                                                <Text style={{ fontSize: 16 }}>
                                                    {item.emoji}
                                                </Text>
                                            </View>
                                            <Text style={{
                                                color: theme.text,
                                                fontFamily: "Inter-Medium",
                                                fontSize: 15,
                                                flex: 1,
                                            }}>
                                                {item.name}
                                            </Text>
                                            <Ionicons name="arrow-forward" size={16} color={theme.dark_gray} />
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                        style={{
                            maxHeight: (suggestions.length > 4 ? 4 : suggestions.length) * 60,
                        }}
                        scrollEnabled={suggestions.length > 4}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}


             {/* Slider pour le prix - Style moderne */}
             <BouncyAppear delay={200} pressable={false}>
             <View style={{
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                paddingVertical: 18,
                paddingHorizontal: 20,
                borderRadius: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.05)',
             }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 15,
                }}>
                    <View style={{
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        borderRadius: 10,
                        padding: 8,
                        marginRight: 12,
                    }}>
                        <Text style={{ fontSize: 16 }}>💰</Text>
                    </View>
                    <Text style={{ 
                        fontFamily: "Inter-Bold", 
                        fontSize: 16, 
                        color: theme.text,
                        flex: 1,
                    }}>
                        Prix du plat
                    </Text>
                    <View style={{
                        backgroundColor: isSliderActive ? '#007AFF' : 'rgba(0, 0, 0, 0.05)',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                        shadowColor: isSliderActive ? '#007AFF' : 'transparent',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: isSliderActive ? 3 : 0,
                    }}>
                        <Text style={{ 
                            fontFamily: "Inter-Bold", 
                            fontSize: 15, 
                            color: isSliderActive ? 'white' : theme.text,
                        }}>
                            {prix.toFixed(2)} €
                        </Text>
                    </View>
                </View>
                
                <View style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 12,
                    paddingVertical: 10,
                    paddingHorizontal: 5,
                }}>
                    <Slider
                        style={{ height: 40 }}
                        minimumValue={0}
                        maximumValue={10.5}
                        step={0.1}
                        value={prix}
                        onValueChange={handleSliderChange}
                        minimumTrackTintColor={'#007AFF'}
                        maximumTrackTintColor={'rgba(0, 0, 0, 0.1)'}
                        thumbTintColor={'#007AFF'}
                        onSlidingStart={() => setIsSliderActive(true)}
                        onSlidingComplete={() => {
                            setPrix(Math.round(prix * 10) / 10);
                            setIsSliderActive(false);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }}
                    />
                </View>
                
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 5,
                }}>
                    <Text style={{ 
                        fontFamily: "Inter-Medium", 
                        fontSize: 12, 
                        color: theme.dark_gray,
                    }}>
                        0 €
                    </Text>
                    <Text style={{ 
                        fontFamily: "Inter-Medium", 
                        fontSize: 12, 
                        color: theme.dark_gray,
                    }}>
                        10,50 €
                    </Text>
                </View>
            </View>
            </BouncyAppear>

            {/* Input pour l'avis - Style moderne */}
            <BouncyAppear delay={300} pressable={false}>
            <View style={{
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
            }}>
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    onPress={() => refAvisInput.current.focus()}
                    style={{
                        paddingVertical: 18,
                        paddingHorizontal: 20,
                    }}
                >
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 12,
                    }}>
                        <View style={{
                            backgroundColor: 'rgba(0, 122, 255, 0.1)',
                            borderRadius: 10,
                            padding: 8,
                            marginRight: 12,
                        }}>
                            <Text style={{ fontSize: 16 }}>💬</Text>
                        </View>
                        <Text style={{ 
                            fontFamily: "Inter-Bold", 
                            fontSize: 16, 
                            color: theme.text 
                        }}>
                            Ton avis sur ce plat
                        </Text>
                    </View>
                    
                    <TextInput
                        numberOfLines={4}
                        multiline={true}
                        placeholder='Partage ton expérience... Était-ce délicieux ? Quelle était la présentation ?'
                        placeholderTextColor={theme.dark_gray}
                        blurOnSubmit={true}
                        onChangeText={setComment}
                        value={comment}
                        onSubmitEditing={Keyboard.dismiss}
                        ref={refAvisInput}
                        style={{
                            fontFamily: "Inter-Medium",
                            fontSize: 15,
                            textAlignVertical: 'top',
                            color: theme.text,
                            minHeight: 80,
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 12,
                            paddingVertical: 12,
                            paddingHorizontal: 15,
                            lineHeight: 20,
                        }}
                    />
                    
                    {/* Compteur de caractères */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 8,
                    }}>
                        <Text style={{
                            fontFamily: "Inter-Medium",
                            fontSize: 12,
                            color: comment.length < 5 ? '#FF3B30' : comment.length > 200 ? '#FF3B30' : '#34C759',
                        }}>
                            {comment.length < 5 ? 'Minimum 5 caractères' : comment.length > 200 ? 'Maximum 200 caractères' : 'Parfait !'}
                        </Text>
                        <Text style={{
                            fontFamily: "Inter-Medium",
                            fontSize: 12,
                            color: comment.length > 200 ? '#FF3B30' : theme.dark_gray,
                        }}>
                            {comment.length}/200
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            </BouncyAppear>


            {/* Section de date - Style moderne */}
            <BouncyAppear delay={400} pressable={false}>
            <View style={{
                marginHorizontal: 20,
                marginBottom: 30,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.05)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={{
                        backgroundColor: 'rgba(52, 199, 89, 0.1)',
                        borderRadius: 10,
                        padding: 8,
                        marginRight: 12,
                    }}>
                        <Text style={{ fontSize: 16 }}>📅</Text>
                    </View>
                    
                    <BouncyCheckbox
                        size={20}
                        fillColor={'#007AFF'}
                        iconStyle={{ borderColor: '#007AFF', borderRadius: 6 }}
                        onPress={() => {
                            if(isCurrentDate) {
                                showDatePicker();
                            } else {
                                setDate(null);
                            }
                            setIsCurrentDate(!isCurrentDate);
                        }}
                        isChecked={isCurrentDate}
                        text={"Aujourd'hui"}
                        textStyle={{ 
                            color: theme.text,
                            fontFamily: 'Inter-Medium',
                            fontSize: 15,
                            textDecorationLine: 'none',
                            marginLeft: -8,
                        }}
                        textContainerStyle={{ flex: 1 }}
                    />
                </View>
                
                <View style={{
                    backgroundColor: date ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                }}>
                    <Text style={{ 
                        fontFamily: "Inter-Medium", 
                        fontSize: 14, 
                        color: date ? '#007AFF' : theme.dark_gray,
                    }}>
                        {date
                            ? date.toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })
                            : 'Aujourd\'hui'
                        }
                    </Text>
                </View>
            </View>
            </BouncyAppear>

            {/* Bouton de validation - Style moderne */}
            <BouncyAppear delay={500} pressable={false}>
            <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
                <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={async () => {
                        if(!selectedPlat) {
                            ToastNotif("Sélectionne le plat", "times-circle", { button_background: theme.background, text: theme.red }, theme.red, 3000);
                        } else if(prix == 0) {
                            ToastNotif("Sélectionne le prix", "times-circle", { button_background: theme.background, text: theme.red }, theme.red, 3000);
                        } else if(!comment || comment.length == 0) {
                            ToastNotif("Écris au moins un petit commentaire", "times-circle", { button_background: theme.background, text: theme.red }, theme.red, 3000);
                        } else if(comment.length < 5) {
                            ToastNotif("Écris un commentaire plus long", "times-circle", { button_background: theme.background, text: theme.red }, theme.red, 3000);
                        } else if(comment.length > 200) {
                            ToastNotif("Ton commentaire est trop long", "times-circle", { button_background: theme.background, text: theme.red }, theme.red, 3000);
                        } else if(!EnvoieDirect && goBackScreenName) {
                            const datemtn = new Date();
                            navigation.navigate(goBackScreenName, {
                                newAvis: {
                                    dish: {
                                        name: selectedPlat.name,
                                        emoji: selectedPlat.emoji,
                                        id: selectedPlat.id
                                    },
                                    comment: comment,
                                    price: prix,
                                    date_visite: date ? date.toDateString() : datemtn.toDateString(),
                                }
                            });
                        } else if(EnvoieDirect) {
                            try {
                                const res = await addReviewToRestaurant(restaurantId, {
                                    dish: {
                                        name: selectedPlat.name,
                                        emoji: selectedPlat.emoji,
                                        id: selectedPlat.id
                                    },
                                    rating,
                                    comment: comment,
                                    price: prix,
                                    date_visite: date ? date.toDateString() : new Date().toDateString(),
                                });
                                if(res.error) {
                                    throw res.error;
                                }
                                updateRestaurant(restaurantId, res.newData);
                                ToastNotif("Avis envoyé", "check-circle", theme, "green", 2000);
                                navigation.goBack();
                            } catch(error) {
                                ToastNotif("Erreur lors de l'envoi de l'avis", "times-circle", { button_background: theme.background, text: theme.red }, theme.red, 3000);
                            }
                        }
                    }}
                    style={{
                        backgroundColor: (selectedPlat && prix != 0 && comment && comment.length < 200 && comment.length > 5) 
                            ? '#007AFF' 
                            : 'rgba(0, 0, 0, 0.1)',
                        borderRadius: 20,
                        paddingVertical: 16,
                        shadowColor: (selectedPlat && prix != 0 && comment && comment.length < 200 && comment.length > 5) 
                            ? '#007AFF' 
                            : 'transparent',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: (selectedPlat && prix != 0 && comment && comment.length < 200 && comment.length > 5) ? 4 : 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <View style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 10,
                        padding: 6,
                        marginRight: 10,
                    }}>
                        <FontAwesome 
                            name={EnvoieDirect ? "paper-plane" : "check"} 
                            size={16} 
                            color={(selectedPlat && prix != 0 && comment && comment.length < 200 && comment.length > 5) 
                                ? "white" 
                                : theme.dark_gray
                            } 
                        />
                    </View>
                    <Text style={{
                        fontFamily: "Inter-Bold",
                        fontSize: 16,
                        color: (selectedPlat && prix != 0 && comment && comment.length < 200 && comment.length > 5) 
                            ? "white" 
                            : theme.dark_gray,
                        textShadowColor: (selectedPlat && prix != 0 && comment && comment.length < 200 && comment.length > 5) 
                            ? 'rgba(0,0,0,0.2)' 
                            : 'transparent',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                    }}>
                        {EnvoieDirect ? "Publier l'avis" : "Valider"}
                    </Text>
                </TouchableOpacity>
            </View>
            </BouncyAppear>
            </ScrollView>


            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={cancelDatePicker}
                isDarkModeEnabled={themeName === 'dark'}
            />


            <Modal visible={emojiModalVisible} transparent={true} animationType="slide">
                <View style={{ 
                    flex: 1, 
                    justifyContent: 'flex-end', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    paddingHorizontal: 20,
                    paddingBottom: 20,
                }}>
                    <View style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        padding: 25,
                        borderRadius: 25,
                        width: '100%',
                        maxHeight: Dimensions.get('window').height * 0.7,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.25,
                        shadowRadius: 25,
                        elevation: 10,
                        borderWidth: 1,
                        borderColor: 'rgba(0, 0, 0, 0.05)',
                    }}>
                        <View style={{ 
                            flexDirection: 'row', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 20,
                            paddingBottom: 15,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(0, 0, 0, 0.05)',
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{
                                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                    borderRadius: 10,
                                    padding: 8,
                                    marginRight: 12,
                                }}>
                                    <Text style={{ fontSize: 16 }}>🎯</Text>
                                </View>
                                <Text style={{ 
                                    fontSize: 18,
                                    color: theme.text,
                                    fontFamily: "Inter-Bold"
                                }}>
                                    Choisis un émoji
                                </Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => setEmojiModalVisible(false)}
                                style={{
                                    backgroundColor: theme.light_gray,
                                    borderRadius: 15,
                                    padding: 8,
                                }}
                            >
                                <FontAwesome name="times" size={16} color={theme.dark_gray} />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView 
                            style={{ maxHeight: Dimensions.get('window').height * 0.5 }}
                            contentContainerStyle={{ paddingBottom: 10 }}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={{ 
                                flexDirection: 'row',
                                justifyContent: 'center', 
                                flexWrap: 'wrap',
                                paddingHorizontal: 10,
                            }}>
                                {emojis.map((emoji, index) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        onPress={() => handleEmojiPress(emoji)}
                                        style={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                            borderRadius: 15,
                                            padding: 12,
                                            margin: 6,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 2,
                                            elevation: 1,
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={{ 
                                            fontSize: 28,
                                            textAlign: 'center',
                                        }}>
                                            {emoji}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default NewAvisView;
