// src/api/auth.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'user_jwt_token';

/**
 * Save JWT token securely on the device
 */
export async function saveToken(token: string) {
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
        console.error('Error saving token:', error);
    }
}

/**
 * Retrieve JWT token from secure storage
 */
export async function getToken() {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
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
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('Error removing token:', error);
    }
}
