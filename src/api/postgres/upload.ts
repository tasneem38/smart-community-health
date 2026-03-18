import { API_URL } from './client';
import { getToken } from '../auth';

/**
 * Upload an image to the server
 * @param imageUri - Local URI of the image (from expo-image-picker)
 * @returns Promise with the server URL of the uploaded image
 */
export async function uploadImage(imageUri: string): Promise<string> {
    try {
        const token = await getToken();
        // Create FormData
        const formData = new FormData();

        // Extract filename from URI
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // Append image to form data
        formData.append('image', {
            uri: imageUri,
            name: filename,
            type: type,
        } as any);

        // Upload to server
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Upload failed. Status: ${response.status}, Body: ${text}`);
            throw new Error(`Upload failed: ${response.status} ${text}`);
        }

        const data = await response.json();

        // Return full URL to access the image
        return `${API_URL}${data.url}`;
    } catch (error: any) {
        console.error('Image upload error details:', error);
        throw new Error(error.message || 'Failed to upload image');
    }
}

/**
 * Upload an audio file to the server
 * @param audioUri - Local URI of the audio file (from expo-av)
 * @returns Promise with the server URL of the uploaded audio
 */
export async function uploadAudio(audioUri: string): Promise<string> {
    try {
        const token = await getToken();
        const formData = new FormData();
        const filename = audioUri.split('/').pop() || 'audio.m4a';

        formData.append('image', { // Server expects 'image' field for all uploads currently
            uri: audioUri,
            name: filename,
            type: 'audio/m4a',
        } as any);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Audio upload failed: ${response.status} ${text}`);
        }

        const data = await response.json();
        return `${API_URL}${data.url}`;
    } catch (error: any) {
        console.error('Audio upload error:', error);
        throw new Error(error.message || 'Failed to upload audio');
    }
}
