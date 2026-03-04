import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View, StyleSheet, Animated, Easing, Linking, Platform, StatusBar, TouchableOpacity
} from 'react-native';
import { Text, IconButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { AuthContext } from '../../store/authContext';
import { textToSpeechApi } from '../../api/api';
import { API_URL } from '../../api/postgres/client';

// ── CONFIG ──────────────────────────────────────────────
// Demo ASHA worker number — change this to any real number for demo
const ASHA_WORKER_PHONE = 'tel:+919483980207';

const LANGUAGES = [
    { key: 'en-IN', label: 'English', flag: '🇬🇧', digit: '1' },
    { key: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳', digit: '2' },
    { key: 'as-IN', label: 'অসমীয়া', flag: '🏔️', digit: '3' },
];

type Phase = 'ringing' | 'greeting' | 'language' | 'connecting' | 'fallback' | 'ended';

export default function HelplineCallScreen({ navigation }: any) {
    const { state } = useContext(AuthContext);
    const user = state?.user;

    const [phase, setPhase] = useState<Phase>('ringing');
    const [selectedLang, setSelectedLang] = useState<string | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [fallbackSent, setFallbackSent] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const soundRef = useRef<Audio.Sound | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const goodbyeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const languageLoopRef = useRef<boolean>(false);
    const callActiveRef = useRef<boolean>(true);

    // ── PULSE ANIMATION ─────────────────────────────────
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // ── FADE IN ─────────────────────────────────────────
    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, [phase]);

    // ── CALL TIMER ──────────────────────────────────────
    useEffect(() => {
        if (phase !== 'ringing' && phase !== 'ended') {
            timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [phase]);

    // ── AUTO-ADVANCE: ringing → greeting ────────────────
    useEffect(() => {
        if (phase === 'ringing') {
            const timer = setTimeout(() => setPhase('greeting'), 2500);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    // ── GREETING & LANGUAGE LOOP ────────────────────────
    useEffect(() => {
        if (phase === 'greeting') {
            const runLanguageLoop = async () => {
                languageLoopRef.current = true;

                // Initial greeting
                await speakTTS('Welcome to Smart Health Helpline.', 'en-IN');

                // Move to language phase UI
                if (!callActiveRef.current || phase !== 'greeting') return;
                setPhase('language');

                // Loop instructions until user selects or leaves
                while (languageLoopRef.current && callActiveRef.current) {
                    if (!languageLoopRef.current) break;
                    await speakTTS('For English, press 1.', 'en-IN', true);

                    if (!languageLoopRef.current) break;
                    await new Promise(r => setTimeout(r, 600)); // short pause

                    if (!languageLoopRef.current) break;
                    await speakTTS('हिन्दी के लिए दो दबाएं।', 'hi-IN', true);

                    if (!languageLoopRef.current) break;
                    await new Promise(r => setTimeout(r, 600));

                    if (!languageLoopRef.current) break;
                    await speakTTS('অসমীয়াৰ বাবে তিনি টিপক।', 'as-IN', true);

                    if (!languageLoopRef.current) break;
                    await new Promise(r => setTimeout(r, 1500)); // longer pause before repeating loop
                }
            };
            runLanguageLoop();
        }

        return () => {
            languageLoopRef.current = false;
        };
    }, [phase]);

    // ── FALLBACK: TTS + 7s auto-goodbye ──────────────────
    useEffect(() => {
        if (phase === 'fallback' && !fallbackSent) {
            const lang = selectedLang || 'en-IN';
            const msg = lang === 'hi-IN'
                ? 'आशा कार्यकर्ता अभी उपलब्ध नहीं हैं। यदि आप चाहें तो हम उन्हें सूचित कर सकते हैं। कृपया नीचे बटन दबाएं।'
                : lang === 'as-IN'
                    ? 'আশা কৰ্মী এতিয়া উপলব্ধ নহয়। আমি তেওঁক জনাব পাৰোঁ। তলৰ বুটামটো টিপক।'
                    : 'The ASHA worker is currently unavailable. If you would like, we can notify them to call you back. Please tap the button below.';

            speakTTS(msg, lang).then(() => {
                // Start 7-second countdown — if no interaction, say goodbye and end
                goodbyeTimerRef.current = setTimeout(async () => {
                    if (!fallbackSent && callActiveRef.current) {
                        const bye = lang === 'hi-IN'
                            ? 'धन्यवाद। अलविदा।'
                            : lang === 'as-IN'
                                ? 'ধন্যবাদ। বিদায়।'
                                : 'Thank you for calling. Goodbye.';
                        await speakTTS(bye, lang);
                        if (callActiveRef.current) endCall();
                    }
                }, 7000);
            });
        }

        return () => {
            if (goodbyeTimerRef.current) {
                clearTimeout(goodbyeTimerRef.current);
                goodbyeTimerRef.current = null;
            }
        };
    }, [phase, fallbackSent]);

    // ── CLEANUP ─────────────────────────────────────────
    useEffect(() => {
        return () => {
            callActiveRef.current = false;
            languageLoopRef.current = false;
            if (soundRef.current) {
                try { soundRef.current.unloadAsync(); } catch (e) { /* ignore */ }
            }
            if (timerRef.current) clearInterval(timerRef.current);
            if (goodbyeTimerRef.current) clearTimeout(goodbyeTimerRef.current);
        };
    }, []);

    // ── TTS HELPER ──────────────────────────────────────
    const speakTTS = async (text: string, lang: string, isInterruptible: boolean = false) => {
        if (!callActiveRef.current) return;
        if (isInterruptible && !languageLoopRef.current) return;

        try {
            if (soundRef.current) {
                try { await soundRef.current.unloadAsync(); } catch (e) { /* */ }
                soundRef.current = null;
            }

            // Pass 'true' as the third argument to use SARVAM_CALL_AGENT key
            const res = await textToSpeechApi(text, lang, true);
            if (res.ok && res.data) {
                // Check if call was ended or language selected while waiting for API
                if (!callActiveRef.current) return;
                if (isInterruptible && !languageLoopRef.current) return;

                const path = `${FileSystem.cacheDirectory}helpline-tts-${Date.now()}.mp3`;
                await FileSystem.writeAsStringAsync(path, res.data, { encoding: FileSystem.EncodingType.Base64 });

                await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
                const { sound } = await Audio.Sound.createAsync({ uri: path });

                // Final check before playing
                if (!callActiveRef.current || (isInterruptible && !languageLoopRef.current)) {
                    await sound.unloadAsync();
                    return;
                }

                soundRef.current = sound;

                // Wait for playback to finish
                await new Promise<void>((resolve) => {
                    sound.setOnPlaybackStatusUpdate((status: any) => {
                        if (status.didJustFinish) resolve();
                        else if (status.isLoaded === false) resolve(); // Unloaded abruptly
                        else if (status.error) resolve();
                    });
                    sound.playAsync().catch(() => resolve());
                });
            }
        } catch (err) {
            console.error('Helpline TTS error', err);
        }
    };

    // ── LANGUAGE SELECTED ───────────────────────────────
    const handleLanguageSelect = async (langKey: string, langLabel: string) => {
        languageLoopRef.current = false; // Stop the repeating language loop
        setSelectedLang(langKey);
        setPhase('connecting');

        // Speak confirmation
        const confirmMsg = langKey === 'hi-IN'
            ? `आपने हिन्दी चुनी है। आपको आशा कार्यकर्ता से जोड़ा जा रहा है।`
            : langKey === 'as-IN'
                ? `আপুনি অসমীয়া বাছনি কৰিছে। আশা কৰ্মীৰ সৈতে সংযোগ কৰা হৈছে।`
                : `You selected ${langLabel}. Connecting you to the nearest ASHA worker.`;

        await speakTTS(confirmMsg, langKey);

        // Try to make the real phone call
        try {
            const supported = await Linking.canOpenURL(ASHA_WORKER_PHONE);
            if (supported) {
                await Linking.openURL(ASHA_WORKER_PHONE);
                // After returning from the dialer, show fallback option
                setTimeout(() => {
                    setPhase('fallback');
                }, 2000);
            } else {
                // Can't dial — go straight to fallback
                setPhase('fallback');
            }
        } catch (err) {
            console.error('Phone dial error', err);
            setPhase('fallback');
        }
    };

    // ── SEND URGENT REQUEST ─────────────────────────────
    const sendUrgentRequest = async () => {
        if (fallbackSent) return;

        // Cancel the auto-goodbye timer since user interacted
        if (goodbyeTimerRef.current) {
            clearTimeout(goodbyeTimerRef.current);
            goodbyeTimerRef.current = null;
        }

        setFallbackSent(true);

        try {
            await fetch(`${API_URL}/api/helpline/urgent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id,
                    userName: user?.name,
                    village: user?.village,
                    language: selectedLang,
                    timestamp: new Date().toISOString(),
                }),
            });

            // Speak confirmation
            const msg = selectedLang === 'hi-IN'
                ? 'आशा कार्यकर्ता को सूचित कर दिया गया है। वे जल्द ही आपको कॉल करेंगे।'
                : selectedLang === 'as-IN'
                    ? 'আশা কৰ্মীক জনোৱা হৈছে। তেওঁ সোনকালে আপোনাক ফোন কৰিব।'
                    : 'ASHA worker has been notified. You will receive a callback shortly.';

            await speakTTS(msg, selectedLang || 'en-IN');
        } catch (err) {
            console.error('Urgent request error', err);
        }
    };

    // ── END CALL ────────────────────────────────────────
    const endCall = () => {
        callActiveRef.current = false;
        languageLoopRef.current = false;
        
        setPhase('ended');
        if (soundRef.current) {
            try { soundRef.current.unloadAsync(); } catch (e) { /* */ }
            soundRef.current = null;
        }
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => navigation.goBack(), 500);
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // ── RENDER ──────────────────────────────────────────
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />

            {/* Call Duration */}
            {phase !== 'ringing' && phase !== 'ended' && (
                <Text style={styles.duration}>{formatTime(callDuration)}</Text>
            )}

            {/* ─── RINGING PHASE ─── */}
            {phase === 'ringing' && (
                <View style={styles.centerContent}>
                    <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                        <View style={styles.phoneCircle}>
                            <MaterialCommunityIcons name="phone-outgoing" size={48} color="#fff" />
                        </View>
                    </Animated.View>
                    <Text style={styles.callingText}>Calling Health Helpline...</Text>
                    <Text style={styles.subText}>Smart Community Health</Text>
                </View>
            )}

            {/* ─── GREETING PHASE ─── */}
            {phase === 'greeting' && (
                <View style={styles.centerContent}>
                    <View style={styles.connectedCircle}>
                        <MaterialCommunityIcons name="phone-in-talk" size={48} color="#fff" />
                    </View>
                    <Text style={styles.callingText}>Connected</Text>
                    <Text style={styles.subText}>Listening...</Text>
                    <View style={styles.waveContainer}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <Animated.View key={i} style={[styles.waveBar, {
                                height: 8 + Math.random() * 20,
                                opacity: 0.5 + Math.random() * 0.5,
                            }]} />
                        ))}
                    </View>
                </View>
            )}

            {/* ─── LANGUAGE SELECTION PHASE ─── */}
            {phase === 'language' && (
                <View style={[styles.centerContent, { justifyContent: 'flex-start', paddingTop: 60 }]}>
                    <Text style={styles.promptText}>Select Language</Text>
                    <Text style={styles.subText}>Dial 1, 2, or 3</Text>

                    <View style={styles.dialpadContainer}>
                        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['*', '0', '#']].map((row, i) => (
                            <View key={i} style={styles.dialpadRow}>
                                {row.map(key => (
                                    <TouchableOpacity
                                        key={key}
                                        style={styles.dialpadKey}
                                        onPress={() => {
                                            if (key === '1') handleLanguageSelect('en-IN', 'English');
                                            else if (key === '2') handleLanguageSelect('hi-IN', 'हिन्दी');
                                            else if (key === '3') handleLanguageSelect('as-IN', 'অসমীয়া');
                                        }}
                                        activeOpacity={0.6}
                                    >
                                        <Text style={styles.dialpadKeyText}>{key}</Text>
                                        {key === '1' && <Text style={styles.dialpadSubText}>ENG</Text>}
                                        {key === '2' && <Text style={styles.dialpadSubText}>HIN</Text>}
                                        {key === '3' && <Text style={styles.dialpadSubText}>ASM</Text>}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* ─── CONNECTING PHASE ─── */}
            {phase === 'connecting' && (
                <View style={styles.centerContent}>
                    <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                        <View style={[styles.phoneCircle, { backgroundColor: '#2E7D32' }]}>
                            <MaterialCommunityIcons name="phone-forward" size={48} color="#fff" />
                        </View>
                    </Animated.View>
                    <Text style={styles.callingText}>Connecting to ASHA Worker...</Text>
                    <Text style={styles.phoneNumber}>{ASHA_WORKER_PHONE.replace('tel:', '')}</Text>
                    <Text style={styles.subText}>
                        {selectedLang === 'hi-IN' ? 'आशा कार्यकर्ता से जोड़ रहे हैं...'
                            : selectedLang === 'as-IN' ? 'আশা কৰ্মীৰ সৈতে সংযোগ কৰা হৈছে...'
                                : 'Please wait while we connect you'}
                    </Text>
                </View>
            )}

            {/* ─── FALLBACK PHASE ─── */}
            {phase === 'fallback' && (
                <View style={styles.centerContent}>
                    <View style={[styles.connectedCircle, { backgroundColor: fallbackSent ? '#2E7D32' : '#FF9800' }]}>
                        <MaterialCommunityIcons
                            name={fallbackSent ? 'check-circle' : 'phone-missed'}
                            size={48}
                            color="#fff"
                        />
                    </View>

                    {!fallbackSent ? (
                        <>
                            <Text style={styles.callingText}>Worker Unavailable</Text>
                            <Text style={styles.subText}>
                                {selectedLang === 'hi-IN' ? 'कार्यकर्ता अभी उपलब्ध नहीं हैं'
                                    : selectedLang === 'as-IN' ? 'কৰ্মী এতিয়া উপলব্ধ নহয়'
                                        : 'The ASHA worker is currently unavailable'}
                            </Text>

                            <Surface style={styles.fallbackCard} elevation={3}>
                                <MaterialCommunityIcons name="bell-ring" size={28} color="#FF9800" />
                                <Text style={styles.fallbackTitle}>
                                    {selectedLang === 'hi-IN' ? 'कॉलबैक का अनुरोध करें'
                                        : selectedLang === 'as-IN' ? 'কলবেক অনুৰোধ কৰক'
                                            : 'Request a Callback'}
                                </Text>
                                <Text style={styles.fallbackDesc}>
                                    {selectedLang === 'hi-IN' ? 'आशा कार्यकर्ता को अधिसूचित किया जाएगा और वे जल्द ही आपको कॉल करेंगे।'
                                        : selectedLang === 'as-IN' ? 'আশা কৰ্মীক জনোৱা হ\'ব আৰু সোনকালে ফোন কৰিব।'
                                            : 'The ASHA worker will be notified and will call you back as soon as possible.'}
                                </Text>
                                <IconButton
                                    icon="phone-ring"
                                    mode="contained"
                                    containerColor="#FF9800"
                                    iconColor="#fff"
                                    size={36}
                                    onPress={sendUrgentRequest}
                                    style={{ marginTop: 8 }}
                                />
                                <Text style={{ color: '#B0C4DE', fontSize: 12, marginTop: 4 }}>
                                    {selectedLang === 'hi-IN' ? 'कॉलबैक अनुरोध भेजें' : selectedLang === 'as-IN' ? 'কলবেক অনুৰোধ পঠাওক' : 'Tap to send callback request'}
                                </Text>
                            </Surface>
                        </>
                    ) : (
                        <>
                            <Text style={styles.callingText}>
                                {selectedLang === 'hi-IN' ? 'अनुरोध भेज दिया गया!' : selectedLang === 'as-IN' ? 'অনুৰোধ পঠোৱা হৈছে!' : 'Request Sent!'}
                            </Text>
                            <Text style={styles.subText}>
                                {selectedLang === 'hi-IN' ? 'आशा कार्यकर्ता को सूचित किया गया है। वे जल्द ही आपको कॉल करेंगे।'
                                    : selectedLang === 'as-IN' ? 'আশা কৰ্মীক জনোৱা হৈছে। তেওঁ সোনকালে আপোনাক ফোন কৰিব।'
                                        : 'ASHA worker has been notified.\nExpect a callback shortly.'}
                            </Text>
                            <MaterialCommunityIcons name="check-decagram" size={60} color="#4CAF50" style={{ marginTop: 20 }} />
                        </>
                    )}
                </View>
            )}

            {/* ─── END CALL BUTTON ─── */}
            <View style={styles.bottomBar}>
                <IconButton
                    icon="phone-hangup"
                    mode="contained"
                    containerColor="#D9534F"
                    iconColor="#fff"
                    size={36}
                    onPress={endCall}
                    style={styles.endCallBtn}
                />
                <Text style={styles.endCallLabel}>End Call</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0E27',
        justifyContent: 'space-between',
    },
    duration: {
        color: '#B0C4DE',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: Platform.OS === 'ios' ? 60 : 45,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    /* Pulse & Phone Circle */
    pulseCircle: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    phoneCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectedCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },

    /* Text */
    callingText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 8,
    },
    subText: {
        color: '#B0C4DE',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 6,
    },
    promptText: {
        color: '#FFD700',
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 8,
    },
    phoneNumber: {
        color: '#4CAF50',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 8,
        letterSpacing: 2,
    },

    /* Wave Bars */
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 24,
    },
    waveBar: {
        width: 6,
        backgroundColor: '#4CAF50',
        borderRadius: 3,
    },

    /* Dialpad */
    dialpadContainer: {
        marginTop: 40,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    dialpadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    dialpadKey: {
        width: 75,
        height: 75,
        borderRadius: 37.5,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialpadKeyText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '400',
    },
    dialpadSubText: {
        color: '#888',
        fontSize: 10,
        fontWeight: '700',
        marginTop: -2,
    },

    /* Fallback Card */
    fallbackCard: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: 24,
        marginTop: 32,
        alignItems: 'center',
        width: '90%',
        borderWidth: 1,
        borderColor: 'rgba(255, 152, 0, 0.3)',
    },
    fallbackTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginTop: 8,
    },
    fallbackDesc: {
        color: '#B0C4DE',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },

    /* Bottom Bar */
    bottomBar: {
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 50 : 36,
    },
    endCallBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
    },
    endCallLabel: {
        color: '#D9534F',
        fontSize: 13,
        fontWeight: '700',
        marginTop: 8,
    },
});
