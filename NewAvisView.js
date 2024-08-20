import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from './context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const NewAvisView = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();

    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedPlat, setSelectedPlat] = useState('');

    const [isGlobalPlat, setIsGlobalPlat] = useState(false);   

    const platsPredefinis = ['🍕 Pizza', '🍝 Pasta', '🥗 Salad', '🍔 Burger', '🍣 Sushi'];

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

    const handleInputChange = (text) => {
        setInputValue(text);
        console.log("change");

        if(!isGlobalPlat){
        const filteredSuggestions = platsPredefinis.filter((plat) =>
            plat.toLowerCase().includes(text.toLowerCase())
        );

        if (text.length > 0 && !platsPredefinis.includes(text)) {
            filteredSuggestions.push('Ajouter un plat à ce restaurant');
        }

        setSuggestions(filteredSuggestions);}
        else {
            const filteredSuggestions = platsGlobal.filter((plat) =>
            plat.toLowerCase().includes(text.toLowerCase())
        );
        if (text.length > 0 && !platsPredefinis.includes(text)) {
            filteredSuggestions.push('Ajouter ce plat');
        }
        setSuggestions(filteredSuggestions);
    }
    };

    const handleSuggestionPress = (suggestion) => {
        if (suggestion === 'Ajouter un plat à ce restaurant') {

            console.log("Ajouter un plat à ce restaurant");
            setIsGlobalPlat(true);
            // setSelectedPlat(inputValue);
            


        } else {
            setSelectedPlat(suggestion);
        }
        setTimeout(() => {
        handleInputChange(inputValue), 100});
        // setInputValue('');
        // setSuggestions([]);
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
                <Text style={{ fontFamily: "Inter-Black", fontSize: 22, color: theme.text }}>
                    Ajouter un plat
                </Text>
            </View>
            
            {/* Input avec suggestions */}
            <View style={{ backgroundColor: theme.light_gray, paddingVertical: 5, paddingHorizontal: 5, borderRadius: 5, marginTop: 10, marginHorizontal: 20 }}>
                <Text style={{ width: "100%", fontFamily: "Inter-Bold", fontSize: 15, color: theme.dark_gray }}>
                    🍴Plat
                </Text>
                <TextInput
                    placeholder='pasta...'
                    style={{ fontFamily: "Inter-SemiBold", marginLeft: 6, marginTop: 0 }}
                    value={inputValue}
                    onChangeText={handleInputChange}
                />
                
            </View>
            {
                suggestions.length > 1 && inputValue.length > 0 && !isGlobalPlat ? (
                    <Text style={{ marginHorizontal: 22, color: theme.dark_gray, marginTop: 5,marginBottom : -2, fontFamily: "Inter-SemiBold" }}>
                        Plat de ce restaurant
                    </Text>
                ) :
                (
                    isGlobalPlat && inputValue.length > 0 && suggestions.length > 1 ? (
                    
                    <Text style={{ marginHorizontal: 22, color: theme.dark_gray, marginTop: 5,marginBottom : -2, fontFamily: "Inter-SemiBold" }}>
                        Plat de l'appli
                    </Text>
                    ) : (
                        isGlobalPlat ? (
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
            }
            {inputValue.length > 0 && (
    <FlatList
        data={ suggestions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item,index }) => (
            <TouchableOpacity activeOpacity={0.8} onPress={() => handleSuggestionPress(item)}>
                <View style={{ marginHorizontal: 20,marginBottom : 4, borderColor : theme.gray,borderWidth : 1 ,backgroundColor : theme.light_gray,borderRadius : 10  }}>
                    <View style={{ padding: 10,flexDirection: 'row',alignItems : "center"}}>
                    {
                        (index === suggestions.length - 1)  ? (
                            <FontAwesome name="plus-circle" size={16} color={theme.dark_gray} style={{marginRight : 5  }} />
                        ) : null
                    }
                    <Text style={{  color: theme.text,fontFamily : "Inter-Bold" }}>
                        {item}
                    </Text>
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
        scrollEnabled={(!isGlobalPlat && suggestions.length > 4) || (isGlobalPlat && platsGlobal.length > 4) ? true : false}
        contentContainerStyle={{ flexGrow: 1 }}
    />
)}


            {/* Les autres composants restent inchangés */}
            <View style={{ backgroundColor: theme.light_gray, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, marginTop: 10, marginHorizontal: 20 }}>
                <Text style={{ width: "100%", fontFamily: "Inter-Bold", fontSize: 15, color: theme.dark_gray }}>
                    💬Avis
                </Text>
                <TextInput
                    numberOfLines={2}
                    placeholder='Très bon... '
                    style={{ fontFamily: "Inter-SemiBold", marginLeft: 2 }}
                />
            </View>

            <TouchableOpacity activeOpacity={0.8}>
                <View style={{ backgroundColor: theme.text, margin: 20, justifyContent: "center", alignItems: "center", borderRadius: 10 }}>
                    <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: theme.background, padding: 10 }}>
                        Envoyer
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

export default NewAvisView;
