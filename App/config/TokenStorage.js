import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'authToken';

export const getToken = async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
        return token;
    }

    // Migration : les versions précédentes stockaient le token en clair dans AsyncStorage
    const legacyToken = await AsyncStorage.getItem(TOKEN_KEY);
    if (legacyToken) {
        await SecureStore.setItemAsync(TOKEN_KEY, legacyToken);
        await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return legacyToken;
};

export const setToken = async (token) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const removeToken = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await AsyncStorage.removeItem(TOKEN_KEY);
};
