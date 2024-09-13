import React, { useState,useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {API_URL} from './config/Config';
import { AuthContext } from './context/AuthProvider';

const AuthScreen = ({ navigation }) => {

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState(''); 
    const [username, setUsername] = useState('');

    const [password, setPassword] = useState('');

    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    const {setIsAuthenticated} = useContext(AuthContext);

    const onChangeHandler = () => {
        setIsLogin(!isLogin);
        setMessage('');
    };

    const onLoggedIn = async (token) => { 
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('username', username.toLocaleLowerCase());
        // navigation.navigate('MapView'); 
        console.log("oe")
        setIsAuthenticated(true);
    }

    const onSubmitHandler = () => {
        const payload = {
            email,
            name,
            surname,
            username,
            password,

        };
        fetch(`${API_URL}/${isLogin ? 'login' : 'signup'}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(async res => { 
            
            try {
                const jsonRes = await res.json();
                if (res.status !== 200) {
                    setIsError(true);
                    setMessage(jsonRes.message);
                } else {
                    if(isLogin){
                        onLoggedIn(jsonRes.token);
                    }
                    else{
                        setIsLogin(true);
                    }
                    setIsError(false);
                    setMessage(jsonRes.message);
                }
            } catch (err) {
                console.log(err);
            };
        })
        .catch(err => {
            console.log(err);
        });
    };

    const getMessage = () => {
        const status = isError ? `Error: ` : `Success: `;
        return status + message;
    }

    return (
        <View style={{flex: 1, alignItems: 'center',        backgroundColor: 'rgba(255, 255, 255, 0.4)',    }}>
            <View style={styles.card}>
                <Text style={styles.heading}>{isLogin ? 'Login' : 'Signup'}</Text>
                <View style={styles.form}>
                    <View style={styles.inputs}>
                    {!isLogin      &&<TextInput style={styles.input} placeholder="Email" autoCapitalize="none" placeholderTextColor="#999" keyboardType="email-address" autoComplete="email" autoCorrect={false} onChangeText={setEmail}></TextInput>}
                        <View style={{flexDirection: 'row',width : "80%",justifyContent: 'space-between', alignItems: 'center'}}>
                            {!isLogin && 
                            <TextInput style={[styles.input, styles.halfInput]} placeholderTextColor="#999" placeholder="Prénom" autoComplete="given-name" autoCorrect={false} onChangeText={setName}></TextInput>}
                            {!isLogin       && 
                            <TextInput style={[styles.input, styles.halfInput]} placeholderTextColor="#999" placeholder="Nom" autoComplete="family-name" autoCorrect={false} onChangeText={setSurname}></TextInput>}
                        </View>

                         <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#999" onChangeText={setUsername}></TextInput>
                        <TextInput secureTextEntry={true} style={styles.input} placeholderTextColor="#999" placeholder="Password" autoComplete= {isLogin ? "current-password" : "new-password"} autoCorrect={false}  onChangeText={setPassword}></TextInput>

                        <Text style={[styles.message, {color: isError ? 'red' : 'green'}]}>{message ? getMessage() : "je fais rien de tout ca :)"}</Text>
                        <TouchableOpacity style={styles.button} onPress={onSubmitHandler}>
                            <Text style={styles.buttonText}>Done</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonAlt} onPress={onChangeHandler}>
                            <Text style={styles.buttonAltText}>{isLogin ? 'Sign Up' : 'Log In'}</Text>
                        </TouchableOpacity>
                    </View>    
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    
    card: {
        flex: 1,
        width: '100%',
        marginTop: '40%',
        borderRadius: 20,
        maxHeight: 380,
        paddingBottom: '30%',
        height: '100%',
    },
    heading: {
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: '10%',
        marginTop: '5%',
        marginBottom: '30%',
        color: 'black',
    },
    form: {
        flex: 1,
        justifyContent: 'space-between',
        paddingBottom: '5%',
    },
    inputs: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '10%',
        
    },  
    input: {
        width: '80%',
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        paddingTop: 10,
        fontSize: 16, 
        minHeight: 40,
    },
    button: {
        width: '80%',
        backgroundColor: 'black',
        height: 40,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
        
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '400'
    },
    buttonAlt: {
        width: '80%',
        borderWidth: 1,
        height: 40,
        borderRadius: 50,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
    buttonAltText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '400',
    },
    message: {
        fontSize: 16,
        height: 30,
        width: "100%",
        textAlign: 'center',
        marginTop: 10,

    },
    halfInput: {
        width: '45%',
    },
});

export default AuthScreen;