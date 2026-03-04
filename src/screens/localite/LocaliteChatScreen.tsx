import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Animated, Modal } from 'react-native';
import { Text, TextInput, IconButton, Avatar, ActivityIndicator, Surface, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { sarvamChatApi, transcribeAudioApi, fetchSarvamHistoryApi, saveSarvamMessageApi, textToSpeechApi } from '../../api/api';
import { AuthContext } from '../../store/authContext';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    audioLoading?: boolean;
}

export default function LocaliteChatScreen({ navigation }: any) {
    const { state } = useContext(AuthContext);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const soundRef = useRef<Audio.Sound | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);

    // Cleanup sound on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
            if (recordingRef.current) {
                try { recordingRef.current.stopAndUnloadAsync(); } catch (e) { /* ignore */ }
            }
        };
    }, []);

    // Load history
    useEffect(() => {
        const loadHistory = async () => {
            if (!state.user?.id) return;
            try {
                const res = await fetchSarvamHistoryApi(state.user.id);
                if (res.ok && res.data) {
                    const history = res.data.map((m: any, idx: number) => ({
                        id: `hist-${idx}`,
                        role: m.role,
                        content: m.content,
                        timestamp: new Date(m.timestamp)
                    }));

                    if (history.length > 0) {
                        setMessages(history);
                    } else {
                        // Default welcome if no history
                        setMessages([{
                            id: '1',
                            role: 'assistant',
                            content: `Hello ${state.user?.name?.split(' ')[0] || 'Friend'}, I am Simran! Your AI Health Assistant. How can I help you today?`,
                            timestamp: new Date()
                        }]);
                    }
                }
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setInitialLoading(false);
            }
        };
        loadHistory();
    }, [state.user?.id]);

    const playTTS = async (messageId: string, text: string) => {
        // Find language (simple detection: if it contains non-english chars, use Hindi)
        const hasHindi = /[\u0900-\u097F]/.test(text);
        const lang = hasHindi ? 'hi-IN' : 'en-IN';

        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioLoading: true } : m));

        try {
            const res = await textToSpeechApi(text, lang);
            if (res.ok && res.data) {
                const base64 = res.data;
                const path = `${FileSystem.cacheDirectory}tts-${messageId}.mp3`;
                await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });

                // Unload previous sound
                if (soundRef.current) {
                    try { await soundRef.current.unloadAsync(); } catch (e) { /* ignore */ }
                    soundRef.current = null;
                }

                // Switch audio mode to playback (disable recording)
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                });

                const { sound: newSound } = await Audio.Sound.createAsync({ uri: path });
                soundRef.current = newSound;
                await newSound.playAsync();
            }
        } catch (err) {
            console.error("TTS Playback error", err);
        } finally {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioLoading: false } : m));
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                // Unload any existing sound (from TTS playback) to free the audio session
                if (soundRef.current) {
                    try { await soundRef.current.unloadAsync(); } catch (e) { /* ignore */ }
                    soundRef.current = null;
                }
                // Unload any lingering recording object
                if (recordingRef.current) {
                    try { await recordingRef.current.stopAndUnloadAsync(); } catch (e) { /* ignore */ }
                    recordingRef.current = null;
                }

                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                const { recording: newRec } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                recordingRef.current = newRec;
                setIsRecording(true);
            }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recordingRef.current) return;
        setIsRecording(false);
        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            if (uri) {
                handleAudioTranscription(uri);
            }
        } catch (err) {
            console.error('Failed to stop recording', err);
        }
    };

    const handleAudioTranscription = async (uri: string) => {
        setLoading(true);
        try {
            const res = await transcribeAudioApi(uri);
            if (res.ok && res.data) {
                setInput(res.data);
            } else {
                console.error("Transcription failed", res.error);
            }
        } catch (err) {
            console.error("STT Error", err);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || loading || !state.user?.id) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // Save User Message to DB
        saveSarvamMessageApi(state.user.id, 'user', userMessage.content).catch(err => console.error("Error saving user message", err));

        try {
            const apiMessages = messages.concat(userMessage).slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await sarvamChatApi(apiMessages);

            if (res.ok) {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: res.data,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
                // Save AI Message to DB
                saveSarvamMessageApi(state.user.id, 'assistant', assistantMessage.content).catch(err => console.error("Error saving AI message", err));
            } else {
                throw new Error(res.error);
            }
        } catch (error: any) {
            console.error("Chat Error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: !initialLoading });
        }, 100);
    }, [messages, loading]);

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const formatDateHeader = (date: Date) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (isSameDay(date, today)) return "Today";
        if (isSameDay(date, yesterday)) return "Yesterday";

        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.header}>
                <IconButton
                    icon="arrow-left"
                    iconColor="#fff"
                    size={24}
                    onPress={() => navigation.goBack()}
                />
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Health Assistant</Text>
                    <View style={styles.onlineStatus}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Voice & Text Support</Text>
                    </View>
                </View>
                <Avatar.Icon size={40} icon="robot" style={{ backgroundColor: '#FFD700' }} color="#001F3F" />
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.scrollContent}
            >
                {initialLoading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#001F3F" />
                ) : (
                    messages.map((msg, index) => {
                        const showDateHeader = index === 0 || !isSameDay(messages[index - 1].timestamp, msg.timestamp);
                        return (
                            <View key={msg.id}>
                                {showDateHeader && (
                                    <View style={styles.dateHeader}>
                                        <Divider style={styles.dateDivider} />
                                        <View style={styles.dateLabelContainer}>
                                            <Text style={styles.dateLabel}>{formatDateHeader(msg.timestamp)}</Text>
                                        </View>
                                        <Divider style={styles.dateDivider} />
                                    </View>
                                )}
                                <View style={[
                                    styles.messageWrapper,
                                    msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper
                                ]}>
                                    <Surface style={[
                                        styles.messageBubble,
                                        msg.role === 'user' ? styles.userBubble : styles.assistantBubble
                                    ]}>
                                        <Text style={[
                                            styles.messageText,
                                            msg.role === 'user' ? styles.userText : styles.assistantText
                                        ]}>
                                            {msg.content}
                                        </Text>
                                        <View style={styles.bubbleFooter}>
                                            {msg.role === 'assistant' && (
                                                <TouchableOpacity
                                                    onPress={() => playTTS(msg.id, msg.content)}
                                                    style={styles.speakerIcon}
                                                    disabled={msg.audioLoading}
                                                >
                                                    {msg.audioLoading ? (
                                                        <ActivityIndicator size={12} color="#001F3F" />
                                                    ) : (
                                                        <MaterialCommunityIcons name="volume-high" size={16} color="#001F3F" />
                                                    )}
                                                </TouchableOpacity>
                                            )}
                                            <Text style={styles.timestamp}>
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </Surface>
                                </View>
                            </View>
                        );
                    })
                )}
                {loading && (
                    <View style={styles.assistantWrapper}>
                        <Surface style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
                            <ActivityIndicator size="small" color="#001F3F" />
                            <Text style={[styles.messageText, styles.assistantText, { marginLeft: 8 }]}>
                                {isRecording ? "Recording..." : "Processing..."}
                            </Text>
                        </Surface>
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputArea}>
                <View style={styles.inputRow}>
                    <TextInput
                        mode="outlined"
                        placeholder="Ask anything..."
                        value={input}
                        onChangeText={setInput}
                        style={[styles.input, { flex: 1, maxHeight: 100 }]}
                        outlineStyle={styles.inputOutline}
                        multiline
                    />

                    <View style={styles.actionButtons}>
                        {input.trim() ? (
                            <IconButton
                                icon="send"
                                mode="contained"
                                containerColor="#001F3F"
                                iconColor="#fff"
                                size={28}
                                onPress={() => sendMessage()}
                                disabled={loading}
                            />
                        ) : (
                            <IconButton
                                icon={isRecording ? "stop" : "microphone"}
                                mode="contained"
                                containerColor={isRecording ? "#D9534F" : "#001F3F"}
                                iconColor="#fff"
                                size={28}
                                onPress={isRecording ? stopRecording : startRecording}
                                disabled={loading && !isRecording}
                            />
                        )}
                    </View>
                </View>
            </View>

            {/* Recording Feedback Overlay */}
            {isRecording && (
                <View style={styles.recordingOverlay}>
                    <View style={styles.recordingCard}>
                        <MaterialCommunityIcons name="microphone" size={48} color="#D9534F" />
                        <Text style={styles.recordingStatus}>Listening...</Text>
                        <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
                            <Text style={styles.stopBtnText}>Stop & Transcribe</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#001F3F',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 15,
        paddingHorizontal: 10,
        elevation: 4,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    onlineStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 6,
    },
    onlineText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontWeight: '600',
    },
    chatContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dateDivider: {
        flex: 1,
        backgroundColor: '#E0E7ED',
        height: 1,
    },
    dateLabelContainer: {
        paddingHorizontal: 12,
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    messageWrapper: {
        marginVertical: 8,
        flexDirection: 'row',
        width: '100%',
    },
    userWrapper: {
        justifyContent: 'flex-end',
    },
    assistantWrapper: {
        justifyContent: 'flex-start',
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 20,
        elevation: 1,
    },
    userBubble: {
        backgroundColor: '#001F3F',
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: '#fff',
        borderBottomLeftRadius: 4,
    },
    loadingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: '#fff',
    },
    assistantText: {
        color: '#333',
    },
    bubbleFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    speakerIcon: {
        marginRight: 8,
        padding: 4,
    },
    timestamp: {
        fontSize: 10,
        opacity: 0.5,
    },
    inputArea: {
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E0E7ED',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        backgroundColor: '#F8FAFC',
    },
    inputOutline: {
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E0E7ED',
    },
    actionButtons: {
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,31,63,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    recordingCard: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        elevation: 10,
    },
    recordingStatus: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    stopBtn: {
        marginTop: 20,
        backgroundColor: '#D9534F',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    stopBtnText: {
        color: '#fff',
        fontWeight: '700',
    }
});
