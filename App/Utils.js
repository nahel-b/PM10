import Toast from 'react-native-toast-message';
import React from 'react';
import { View, Text, StyleSheet,ActivityIndicator, TouchableOpacity, Modal, ScrollView, TextInput, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// const insets = useSafeAreaInsets();


//get the height of non safe area

const toastConfig = {


  tomatoToast: ({ text1, props }) => (
    //TODO : ajuster avec l'encoche la safeview la margin
    <View style={{margin : props.position == "bottom" ? 0 : 60,height: 40, backgroundColor: props.theme.button_background, justifyContent: "center", borderRadius: 20, 
      paddingHorizontal: 10,
      marginHorizontal : 30,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
     }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-start",  }}>
        {props.activityIndicator ?
        <ActivityIndicator size="small" color="black" style={{ alignSelf: "center" }}/>
            :
        <Icon name={props.iconName ? props.iconName : "check-circle"} size={25} color={props.iconColor} style={{ alignSelf: "center" }} />
        
}
        <Text adjustsFontSizeToFit minimumFontScale={0.3}  numberOfLines={2}   style={{ marginLeft: 10, color: props.theme.text, fontSize: 15,fontFamily : 'Inter-Black', textAlign: 'center', paddingVertical: 10 }}>
          {text1}
        </Text>
      </View>
    </View>
  )
};


export function ToastNotif(text, iconName, theme,iconColor,visibilityTime,position = 'bottom',activityIndicator = false) {


  Toast.show({
    type: 'tomatoToast',
    text1: text,
    autoHide: true,
    visibilityTime: visibilityTime,
    props: { iconName: iconName, theme,iconColor,activityIndicator,position},
    topOffset: 0,
    
    position: position,
  });
}

export function ToastHide() {
  Toast.hide();
}   

export const ToastObj = ({}) => 
  {
    
    return(<Toast config={toastConfig} />)
  }


