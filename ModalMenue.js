import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modal } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from './context/ThemeContext';

const CustomModal = ({ visible, onClose, onDeleteForEveryone, onDeleteForMe }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(100);

  const { theme } = useTheme();

  if (visible) {
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.exp) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.exp) });
  } else {
    opacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.exp) });
    translateY.value = withTiming(100, { duration: 300, easing: Easing.in(Easing.exp) });
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
      width: '100%',
      backgroundColor: theme.background,
      borderRadius: 10,
      padding: 20,
      alignSelf : 'flex-start',
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    option: {
      paddingVertical: 15,
    },
    deleteForEveryoneText: {
      color: theme.red,
      textAlign: 'center',
      fontSize: 16,
      fontFamily: 'Inter-Medium',
    },
    deleteForMeText: {
      color: theme.text,
      textAlign: 'center',
      fontSize: 16,
        fontFamily: 'Inter-Medium',
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
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <SafeAreaView style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, animatedStyle]}>

            <View style={{flexDirection : 'row', backgroundColor : 'transparent',marginTop : -10,marginRight : -30,width : "100%",alignSelf : "center",justifyContent : "flex-end", alignItems: "flex-start" }}>
                    <View style={{flex : 1}}>
                    <Text style={styles.title}>Commentaire</Text>
                    </View>

                    <TouchableOpacity  onPress={onClose}>
                    <View style={{backgroundColor : theme.light_gray, borderRadius : 50, padding : 0,marginRight : 3}}>
                        <Ionicons name="close" size={25} color="gray" />
                    </View>
                    </TouchableOpacity>
            </View>
                    
            <SafeAreaView style={{ backgroundColor : theme.light_gray, borderRadius : 10 }} >
          <TouchableOpacity style={styles.option} onPress={ onDeleteForMe}>
            <Text style={styles.deleteForMeText}>Modifier le commentaire</Text>
          </TouchableOpacity>
          <View style={{borderBottomWidth : 1, borderBottomColor : theme.gray, marginHorizontal : 20}}></View>
          <TouchableOpacity style={styles.option} onPress={onDeleteForEveryone}>
            <Text style={styles.deleteForEveryoneText}>Supprimer le commentaire</Text>
          </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};


export default CustomModal;
