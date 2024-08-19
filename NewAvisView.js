import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from './context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewAvisView = ({ onClose }) => {
    const { theme } = useTheme();

    return (
        <View style={{
            position: 'absolute',
            bottom: 0,
            left: 20,
            right: 0,
            bottom : 0,
            backgroundColor: theme.background,
            borderRadius: 20,
            padding: 0,
            width: '90%',
            alignSelf : "center"
        }}>

            
                <TouchableOpacity onPress={onClose}>
                    <View style={{ alignItems: "flex-end",marginRight : 10,marginTop : 10 }}>
                        <Ionicons name="close" size={30} color="gray" />
                    </View>
                </TouchableOpacity>
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={{ fontFamily: "Inter-Black", fontSize: 22, color: theme.text }}>
                        Ajouter un plat
                    </Text>
                </View>
                
                {/* Contenu du modal */}
                


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


                <TouchableOpacity activeOpacity={0.8} onPress={onClose}>
                    <View style={{ backgroundColor: theme.text, margin: 20, justifyContent: "center", alignItems: "center", borderRadius: 10 }}>
                        <Text style={{ fontFamily: "Inter-Bold", fontSize: 15, color: theme.background, padding: 10 }}>Envoyer</Text>
                    </View>
                </TouchableOpacity>
        </View>
    );
};

export default NewAvisView;
