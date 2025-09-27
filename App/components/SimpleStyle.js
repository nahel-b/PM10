import { StyleSheet } from 'react-native';

import { Platform } from 'react-native';



const stylesSimple = StyleSheet.create({

    blueButtonContainer : {
        shadowColor: '#007AFF',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 3,
                  alignItems : "center",
                    ...(Platform.OS === 'ios' && {
                      shadowColor: '#007AFF',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                    })
    },

    blueButton : {
        backgroundColor : '#007AFF'
    }
    
});

export default stylesSimple;