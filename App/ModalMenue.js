import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Modal } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from './context/ThemeContext';
import { getDeviceCornerRadius } from './Utils';
import BouncyAppear from './components/BouncyAppear';

const CustomModal = ({ visible, onClose, options,title }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(100);

  const { theme } = useTheme();

  const options_filtre = options.filter(option => option);

  if (visible) {
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.exp) });
  } else {
    opacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.exp) });
    translateY.value = withTiming(200, { duration: 300, easing: Easing.out(Easing.exp) });
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      width: '93%',
      marginBottom: 15,
      borderRadius : getDeviceCornerRadius(),
      alignSelf: 'center',
      backgroundColor: theme.background,
      //paddingVertical: 20,
      paddingHorizontal: 0,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter-Black',
      color: theme.text,

      marginTop : 20,
      textAlign: 'center',
    },
    option: {
      paddingVertical: 15,
      
    },
    optionText: {
      color: theme.text,
      opacity : 0.8,
      textAlign: 'center',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      marginHorizontal : 30,
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
    closeText: {
      color: theme.text,
      fontSize: 18,
    },

    dangerousText: {
      color: theme.red,
      textAlign: 'center',
      fontSize: 16,
      fontFamily: 'Inter-Bold',
    },

  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity activeOpacity={1} style={{flex : 1}}  onPress={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, animatedStyle]}>

          <View style={{flexDirection : 'row', backgroundColor : 'transparent',marginTop : 0,marginRight : 0,width : "100%",alignSelf : "center",justifyContent : "flex-end", alignItems: "flex-start" }}>
            <View style={{flex : 1}}>
              <Text style={styles.title}>{title}</Text>
            </View>

            <BouncyAppear pressScale={1.5} pressable={true} onPress={onClose} style={{position : 'absolute', top : 0, top : getDeviceCornerRadius()/2, right : getDeviceCornerRadius()/2 ,backgroundColor : theme.light_gray, borderRadius : 50, padding : 0}} >
              <View >
                <Ionicons name="close" size={25} color="gray" />
              </View>
            </BouncyAppear>
          </View>
          
          <View style={{ borderRadius : 10,marginTop : getDeviceCornerRadius()/2 ,marginBottom : getDeviceCornerRadius()/2 }}>
            {options_filtre.map((option, index) => {
              if(!option) return null;

              return (
              <View key={index} style>

                <BouncyAppear pressable={true} delay={index*50 + 100} 
                                                  key={index} 
                                                  onPress={option.handle}
                                                  activeOpacity={0.7}
                                                  style={{
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.05,
                                                    shadowRadius: 12,
                                                    elevation: 3,
                                                    marginBottom: 2,
                                                    ...(Platform.OS === 'ios' && {
                                                      shadowColor: '#000',
                                                      shadowOffset: { width: 0, height: 4 },
                                                      shadowOpacity: 0.08,
                                                      shadowRadius: 12,
                                                    }),
                                                  }}
                                                >
                                                <View key={index} style={{ 
                                                  backgroundColor : 'rgba(255, 255, 255, 0.8)',
                                                  paddingVertical : 13,
                                                  borderRadius : 20,
                                                  marginHorizontal : 10,
                                                  borderWidth: 1,
                                                  borderColor: 'rgba(0, 0, 0, 0.06)',
                                                }}>
                                                  
                  <Text adjustsFontSizeToFit={true} numberOfLines={2} style={[styles.optionText,option.dangerous ? styles.dangerousText : {}]}>{option.label}</Text>
                {/* {index < options_filtre.length - 1 && (
                  <View style={{borderBottomWidth : 1, opacity : 0.8, borderBottomColor : theme.gray, marginHorizontal : 30}} />
                )} */}



                                                </View>
                                                </BouncyAppear>
                
              </View>
              )
        })}
          </View>
        </Animated.View>
      </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomModal;
