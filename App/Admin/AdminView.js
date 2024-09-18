import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity,Dimensions, Keyboard,StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { TabView, SceneMap } from 'react-native-tab-view';

import ReportView from './ReportView';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');


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


function AdminView ({})  {
    const { theme, themeName } = useTheme();
   
    const insets = useSafeAreaInsets();
    const navigation = useNavigation()
    const [isModalVisible, setIsModalVisible] = useState(false);

    const { reportData,refreshDataReport } = useRestaurant();

    const openModal = () => {
      setIsModalVisible(true);
    };
  
    const closeModal = () => {
      setIsModalVisible(false);
    };
    const [index, setIndex] = useState(0);

    const indicatorPosition = useSharedValue(0);

    useEffect(() => {
        indicatorPosition.value = withSpring(index === 0 ? 0 : index === 1 ? windowWidth/3*0.95 : windowWidth*2/3*0.95 ,{damping: 15, stiffness: 200,});
    }, [index]);


  const handleSwitch = (newIndex) => {
    setIndex(newIndex);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  const [routes] = useState([
    { key: 'Report', title: 'Report' },
    { key: 'Log', title: 'Log' },
    { key: 'Ajout', title: 'Ajout' },
  ]);
  const renderScene = SceneMap({
    Report: () => <ReportView reportData={reportData} theme={theme} />,
    Log: () => <Log theme={theme} />,
    Ajout: () => <Ajout theme={theme} />,
  });

    const styles = StyleSheet.create({
        
        
        switchContainer: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center', // Ajouter cet alignement
            
            
            backgroundColor: theme.button_spec_background,
            borderRadius: 10,
            width: '95%',
            alignSelf: 'center',
          },
          switchButton: {
            flex: 1,
            paddingVertical: 10,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
          },
         
        indicator: {
          position: 'absolute',
          width: windowWidth*0.95/3,
          height: '100%',
          backgroundColor: theme.background_blue, // Couleur de l'indicateur
          borderRadius: 10,
        },
        
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 20,
            marginBottom: 5,
          },
          buttonText: {
            color: theme.text, textAlign : 'center', fontFamily : 'Inter-SemiBold',
            marginLeft : 3
          },
      });

   


    return (
        <View style={{
            backgroundColor: theme.background,
            flex: 1,
            width: "100%",
            alignSelf: "center"
        }}>
            
            <View style={{flexDirection : "row",justifyContent : "space-between", alignItems : "center", paddingHorizontal: 20,marginTop : insets.top }}>
                <Text style={{ fontFamily: "Inter-Black", fontSize: 24, color: theme.text }}>
                    🔮 Admin
                </Text>
                <TouchableOpacity onPress={() => { navigation.goBack() }}>
                <View style={{ alignItems: "flex-end", marginRight: 0, }}>
                    <Ionicons name="close" size={30} color="gray" />
                </View>
            </TouchableOpacity>
            </View>
            


            <View style={{ flexDirection: "row", width: "100%", justifyContent: "center", alignItems: "center", marginTop : 20,marginBottom : 5 }}>
            <View style={styles.switchContainer}>
            <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
            <TouchableOpacity style={styles.switchButton} onPress={() => handleSwitch(0)}>
            <View style={{flexDirection:"row",alignItems:"center",justifyContent : "center",marginHorizontal : 10}}>
            <MaterialIcons name="report" size={18} color={theme.text} />
                <Text style={styles.buttonText}>Report</Text>
                <View style={{backgroundColor : theme.background_blue, borderRadius : 50, padding : 2,marginLeft : 3}}>
                <Text style={{fontFamily : 'Inter-Black', color : theme.blue}}>3</Text>
                </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.switchButton} onPress={() => handleSwitch(1)}>
            <View style={{flexDirection:"row",alignItems:"center",marginHorizontal : 10}}>
            <Feather name="file-text" size={15} color={theme.text} />
            
                            <Text  style={styles.buttonText}>Log</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.switchButton} onPress={() => handleSwitch(2)}>
            <View style={{flexDirection:"row",alignItems:"center",marginHorizontal : 10}}>
                <FontAwesome5 name="plus" size="15"  color={theme.text} />
                <Text numberOfLines={1} adjustsFontSizeToFit style={styles.buttonText}>Ajout</Text>
                </View>
            </TouchableOpacity>
            
            </View>

            </View>

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: windowWidth }}
                renderTabBar={() => null} // Hide the default tab bar
            />







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
const Log = ({theme}) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{color : "white"}}>Log</Text>
        </View>
    )
}
const Ajout = ({theme}) => {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Ajout</Text>
        </View>

    )
}


export default AdminView;
