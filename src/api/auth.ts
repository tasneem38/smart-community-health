// src/api/auth.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'user_jwt_token';

/**
 * Save JWT token securely on the device
 */
export async function saveToken(token: string) {
    try {
        if (Platform.OS === 'web') {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } else {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
        }
    } catch (error) {
        console.error('Error saving token:', error);
    }
}

/**
 * Retrieve JWT token from secure storage
 */
export async function getToken() {
    try {
        if (Platform.OS === 'web') {
            return await AsyncStorage.getItem(TOKEN_KEY);
        } else {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        }
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
}

/**
 * Remove JWT token (Logout)
 */
export async function removeToken() {
    try {
        if (Platform.OS === 'web') {
            await AsyncStorage.removeItem(TOKEN_KEY);
        } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
    } catch (error) {
        console.error('Error removing token:', error);
    }
}
