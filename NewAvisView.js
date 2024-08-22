import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from './context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import Slider from '@react-native-community/slider';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { ToastNotif } from './Utils';


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

    const platsPredefinis = ['🍕 Pizza', '🍝 Pasta', '🥗 Salad', '🍔 Burger', '🍣 Sushi'];

    const refInput = useRef(null);
    const refAvisInput = useRef(null);

    const [date, setDate] = useState(null);

    const platsGlobal = [
        '🍕 Pizza',
        '🍝 Pasta',
        '🥗 Salad',
        '🍔 Burger',
        '🍣 Sushi',
        '🍛 Curry',
        '🍜 Ramen',
        '🌮 Tacos',
        '🥩 Steak',
        '🍤 Shrimp',
        '🥙 Kebab',
        '🍲 Hotpot',
        '🍱 Bento',
        '🥖 Baguette',
        '🍞 Bread',
        '🥪 Sandwich',
        '🍰 Cake',
        '🍪 Cookies',
        '🥧 Pie',
        '🍮 Flan',
        '🍫 Chocolate',
        '🍬 Candy',
        '🍿 Popcorn',
        '🥐 Croissant',
        '🍩 Donut',
        '🥓 Bacon',
        '🥞 Pancakes',
        '🧇 Waffles',
        '🍠 Sweet Potato',
        '🍳 Eggs',
        '🍟 Fries',
        '🌭 Hot Dog',
        '🍖 Ribs',
        '🍗 Fried Chicken',
        '🥥 Coconut',
        '🍍 Pineapple',
        '🍉 Watermelon',
        '🍇 Grapes',
        '🍒 Cherries',
        '🍓 Strawberries',
        '🍋 Lemon',
        '🍌 Banana',
        '🍎 Apple',
        '🍏 Green Apple',
        '🍊 Orange',
        '🍐 Pear',
        '🍑 Peach',
        '🍈 Melon',
        '🥝 Kiwi',
        '🍅 Tomato',
        '🌽 Corn',
        '🥒 Cucumber',
        '🥕 Carrot',
        '🥦 Broccoli',
        '🥬 Lettuce',
        '🥔 Potato',
        '🍆 Eggplant',
        '🍄 Mushrooms',
        '🌶️ Pepper',
        '🧄 Garlic',
        '🧅 Onion',
        '🍚 Rice',
        '🍘 Rice Cracker',
        '🍢 Oden',
        '🍡 Dango',
        '🍧 Shaved Ice',
        '🍨 Ice Cream',
        '🍦 Soft Serve',
        '🍹 Cocktail',
        '🍸 Martini',
        '🍷 Wine',
        '🍺 Beer',
        '🥂 Champagne',
        '☕ Coffee',
        '🍵 Tea',
        '🥤 Soda',
        '🍶 Sake',
        '🧃 Juice',
        '🥛 Milk',
        '🍯 Honey',
        '🧈 Butter',
        '🥣 Cereal',
        '🧀 Cheese',
        '🍖 Ham',
        '🥩 Beef',
        '🍗 Chicken',
        '🍖 Pork',
        '🍤 Prawns',
        '🐟 Fish',
        '🐠 Salmon',
        '🦐 Shrimp',
        '🦑 Squid',
        '🦀 Crab',
        '🦞 Lobster',
        '🍞 Toast',
        '🥥 Coconut Water',
        '🍉 Melon Juice',
        '🍇 Grape Juice',
        '🍒 Cherry Juice',
        '🍓 Strawberry Shake',
        '🍋 Lemonade',
        '🍌 Banana Smoothie',
        '🍎 Apple Pie',
        '🍏 Green Apple Tart',
        '🍊 Orange Sorbet',
        '🍐 Pear Tart',
        '🍑 Peach Cobbler',
        '🥭 Mango',
        '🍈 Melon Balls',
        '🥝 Kiwi Slice',
        '🍅 Tomato Soup',
        '🌽 Corn on the Cob',
        '🥒 Pickles',
        '🥕 Carrot Cake',
        '🥦 Broccoli Cheese',
        '🥬 Lettuce Wrap',
        '🥔 Mashed Potatoes',
        '🍆 Eggplant Parmesan',
        '🍄 Mushroom Risotto',
        '🌶️ Spicy Chili',
        '🧄 Garlic Bread',
        '🧅 Onion Rings',
        '🍚 Fried Rice',
        '🍘 Seaweed Snack',
        '🍢 Skewers',
        '🍡 Mochi',
        '🍧 Gelato',
        '🍨 Sundae',
        '🍦 Cone Ice Cream',
        '🍹 Mojito',
        '🍸 Cosmopolitan',
        '🍷 Red Wine',
        '🍺 Lager',
        '🥂 Prosecco',
        '☕ Espresso',
        '🍵 Matcha',
        '🥤 Lemon Soda',
        '🍶 Plum Wine',
        '🧃 Orange Juice',
        '🥛 Almond Milk',
        '🍯 Maple Syrup',
        '🧈 Margarine',
        '🥣 Porridge',
        '🧀 Brie Cheese',
        '🍖 Sausage',
        '🥩 Filet Mignon',
        '🍗 Drumstick',
        '🍖 Ribs',
        '🍤 Lobster Roll',
        '🐟 Tuna',
        '🐠 Cod',
        '🦐 Scampi',
        '🦑 Calamari',
        '🦀 King Crab',
        '🦞 Crawfish',
        '🍞 Pita Bread',
        '🥥 Coconut Ice Cream'
      ];


    useEffect(() => {
        setSuggestions(platsPredefinis)
    }, []);

    const handleInputChange = (text) => {
        setInputValue(text);
        setSelectedPlat('');

            const filteredSuggestions = platsGlobal.filter((plat) =>
            plat.toLowerCase().includes(text.toLowerCase())
        );
        if (text.length > 0 && !platsPredefinis.includes(text)) {
            filteredSuggestions.push('Ajouter ce plat');
            setSuggestions(filteredSuggestions);

        }
        else 
        {
            setSuggestions(platsPredefinis);
            console.log("setSuggestions");
        }
    
    };

    const handleSuggestionPress = (suggestion) => {
        if (suggestion === 'Ajouter ce plat') {

            console.log("Ajouter un plat à ce restaurant");
            

        } 
        else 
        {
            setSelectedPlat(suggestion);
            setInputValue(suggestion.slice(2));
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
        setPrix(value);
        if (Math.abs(value - previousSliderValue) >= 0.25) {
            Haptics.selectionAsync();
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
            <View style={{flexDirection : 'row', backgroundColor: selectedPlat == '' ? theme.light_gray : 'transparent', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 5, marginTop: 10, marginHorizontal: 20 }}>
                
               
                <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: theme.dark_gray }}>
                {selectedPlat && selectedPlat.length > 0 ? selectedPlat.slice(0, 2) : '🍴'}
                </Text>

                <TextInput
                    placeholder='Plat (pasta,...)'
                    placeholderTextColor={theme.dark_gray}
                    style={{fontSize:selectedPlat == '' ? 15 : 18, fontFamily: selectedPlat == '' ?  "Inter-SemiBold" : "Inter-Bold",color : selectedPlat == '' ? theme.text : theme.text, marginLeft: 0, marginTop: 3 }}
                    value={inputValue}
                    onChangeText={handleInputChange}
                    ref={refInput}
                />
                
            </View>
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
                            <Text style={{ marginHorizontal: 22, color: theme.red, marginTop: 5,marginBottom : -2, fontFamily: "Inter-SemiBold" }}>
                                Ce plat n'existe pas dans l'appli, ameliore l'appli en l'ajoutant 😁
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


             {/* Slider pour le prix */}
             <View style={{
                marginHorizontal: 20,
                marginTop: 5,
                marginBottom: 0,
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
                        maximumValue={12}
                        step={0.25}
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
                            {setIsSliderActive(false)
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


            <View style={{ marginHorizontal: 20, marginTop : 10, flexDirection : "row",justifyContent : "space-between" }} >
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

            <TouchableOpacity activeOpacity={0.8}>
                <View style={{
                    backgroundColor: theme.text,
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
                        Envoyer
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
            
        </View>
    );
};

export default NewAvisView;
