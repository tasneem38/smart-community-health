const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool } = require('./db');
const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { SarvamAIClient } = require('sarvamai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-for-dev-only';

// ---------------------------------------------------------
// SECURITY HELPERS & MIDDLEWARE
// ---------------------------------------------------------

/**
 * Middleware to verify JWT and attach user to request
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Authentication required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
}

/**
 * Log sensitive actions for DPDP audit trail
 */
async function logAudit(userId, action, resourceId, resourceType, metadata = {}) {
    try {
        await pool.query(
            'INSERT INTO audit_logs (user_id, action, resource_id, resource_type, metadata) VALUES ($1, $2, $3, $4, $5)',
            [userId, action, resourceId, resourceType, metadata]
        );
    } catch (err) {
        console.error('[AUDIT ERROR]:', err.message);
    }
}

/**
 * Log user consent for specific processing purposes
 */
async function logConsent(userId, purpose, consentGiven, ipAddress) {
    try {
        await pool.query(
            'INSERT INTO user_consents (user_id, purpose, consent_given, ip_address) VALUES ($1, $2, $3, $4)',
            [userId, purpose, consentGiven, ipAddress]
        );
    } catch (err) {
        console.error('[CONSENT LOG ERROR]:', err.message);
    }
}

app.get('/ping', (req, res) => {
    res.json({ ok: true, message: 'Server is reachable!', timestamp: new Date().toISOString() });
});

// Global error handler for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON received:', err.message);
        return res.status(400).json({ error: 'Malformed JSON payload' });
    }
    next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Increase to 10MB for audio
    },
    fileFilter: function (req, file, cb) {
        // Accept images and audio
        if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('audio/')) {
            return cb(new Error('Only image and audio files are allowed!'), false);
        }
        cb(null, true);
    }
});

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper: Ask Groq
async function askGroq(prompt) {
    if (!GROQ_API_KEY || GROQ_API_KEY.includes('your_')) {
        console.warn("GROQ_API_KEY not set, skipping AI analysis");
        return "";
    }
    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2,
            }),
        });
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
    } catch (err) {
        console.error("Groq AI Error:", err.message);
        return "";
    }
}

// Helper: Transcribe Audio using Whisper
async function transcribeAudio(fileUrl) {
    if (!GROQ_API_KEY || GROQ_API_KEY.includes('your_')) return "";

    try {
        // fileUrl is something like /uploads/filename.m4a
        const filePath = path.join(__dirname, fileUrl);
        if (!fs.existsSync(filePath)) return "";

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('model', 'whisper-large-v3');

        const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                ...form.getHeaders()
            },
            body: form
        });

        const data = await res.json();
        return data.text || "";
    } catch (err) {
        console.error("Transcription Error:", err.message);
        return "";
    }
}

// Helper: Ask Sarvam AI
async function askSarvam(messages) {
    const key = process.env.SARVAM_API_KEY;
    if (!key || key.includes('your_')) {
        console.warn("SARVAM_API_KEY not set");
        return { content: "[API Key missing]" };
    }

    try {
        const sarvam = new SarvamAIClient({
            apiSubscriptionKey: key,
        });

        // Sarvam AI often requires the first message to be from the 'user'.
        // 1. Filter out any leading messages that are NOT from a user (like initial UI welcomes)
        let firstUserIdx = messages.findIndex(m => m.role === 'user');
        let filteredMessages = firstUserIdx !== -1 ? messages.slice(firstUserIdx) : messages;

        // 2. Prepend guidance to the first user message
        const guidance = "GUIDANCE: You are a helpful Rural Health Assistant for Smart Health in North East India. Use simple, supportive language. Respond in the language of the user's query.\n\n";

        const validatedMessages = filteredMessages.map((m, idx) => {
            if (idx === 0 && m.role === 'user') {
                return { ...m, content: guidance + m.content };
            }
            return m;
        });

        const response = await sarvam.chat.completions({
            model: "sarvam-m",
            messages: validatedMessages,
        });

        return {
            content: response.choices?.[0]?.message?.content || "",
        };
    } catch (err) {
        console.error("Sarvam SDK Error:", err.message);
        throw err;
    }
}

// Helper: Transcribe Audio using Sarvam AI
async function transcribeAudio(filePath) {
    const key = process.env.SARVAM_API_KEY;
    if (!key || key.includes('your_')) {
        throw new Error("SARVAM_API_KEY not set");
    }

    try {
        const sarvam = new SarvamAIClient({
            apiSubscriptionKey: key,
        });

        // The JS SDK usually needs a File object or stream. 
        // We'll use fs.createReadStream for the file.
        const response = await sarvam.speechToText.transcribe({
            file: fs.createReadStream(filePath),
            model: "saaras:v3",
        });

        return response.transcript || response.text || "";
    } catch (err) {
        console.error("Sarvam STT Error:", err.message);
        throw err;
    }
}

// Helper: Split text into chunks of maxLen at sentence boundaries
function splitTextIntoChunks(text, maxLen = 500) {
    if (text.length <= maxLen) return [text];

    const chunks = [];
    let remaining = text;

    while (remaining.length > 0) {
        if (remaining.length <= maxLen) {
            chunks.push(remaining);
            break;
        }

        // Find the last sentence boundary within maxLen
        const slice = remaining.substring(0, maxLen);
        // Look for sentence-ending punctuation (., !, ?, Hindi danda ।)
        let splitIdx = -1;
        for (let i = slice.length - 1; i >= 0; i--) {
            if (['.', '!', '?', '।'].includes(slice[i])) {
                splitIdx = i + 1;
                break;
            }
        }

        // If no sentence boundary found, split at last space
        if (splitIdx <= 0) {
            splitIdx = slice.lastIndexOf(' ');
        }

        // If still no good split point, force split at maxLen
        if (splitIdx <= 0) {
            splitIdx = maxLen;
        }

        chunks.push(remaining.substring(0, splitIdx).trim());
        remaining = remaining.substring(splitIdx).trim();
    }

    return chunks.filter(c => c.length > 0);
}

// Helper: Text to Speech using Sarvam AI (with chunking for long text)
async function textToSpeech(text, languageCode = 'hi-IN', isCallAgent = false) {
    const key = isCallAgent ? process.env.SARVAM_CALL_AGENT : process.env.SARVAM_API_KEY;
    if (!key || key.includes('your_')) {
        throw new Error(`API key not set for ${isCallAgent ? 'SARVAM_CALL_AGENT' : 'SARVAM_API_KEY'}`);
    }

    try {
        const sarvam = new SarvamAIClient({
            apiSubscriptionKey: key,
        });

        const chunks = splitTextIntoChunks(text, 500);
        console.log(`[TTS] Split text into ${chunks.length} chunk(s)`);

        const audioBuffers = [];

        for (let i = 0; i < chunks.length; i++) {
            console.log(`[TTS] Processing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
            const response = await sarvam.textToSpeech.convert({
                inputs: [chunks[i]],
                target_language_code: languageCode,
                speaker: "simran",
                model: "bulbul:v3",
            });

            const audioBase64 = response.audios?.[0];
            if (audioBase64) {
                audioBuffers.push(Buffer.from(audioBase64, 'base64'));
            }
        }

        // Concatenate all audio buffers and return as single base64 string
        const combined = Buffer.concat(audioBuffers);
        return combined.toString('base64');
    } catch (err) {
        console.error("Sarvam TTS Error:", err.message);
        throw err;
    }
}

// ---------------------------------------------------------
// AUTH
// ---------------------------------------------------------

app.post('/register', async (req, res) => {
    const { name, email, password, role, village } = req.body;

    // 1. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    // 2. Validate Password Strength
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
        // 3. Hash Password
        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, village) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, village',
            [name, email, password_hash, role || 'user', village]
        );

        const user = result.rows[0];
        const token = jwt.sign(
            { uid: user.id, role: user.role, village: user.village },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        await logAudit(user.id, 'USER_REGISTERED', user.id.toString(), 'users');

        res.json({ user, token });
    } catch (err) {
        console.error(err);
        if (err.constraint === 'users_email_key') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = result.rows[0];

        // 4. Compare Hash
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { uid: user.id, role: user.role, village: user.village },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        await logAudit(user.id, 'USER_LOGIN', user.id.toString(), 'users');

        res.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role, village: user.village },
            token: token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ---------------------------------------------------------
// FILE UPLOAD
// ---------------------------------------------------------

app.post('/upload', authenticateToken, upload.single('image'), (req, res) => {
    console.log("Received upload request");
    if (req.file) {
        console.log("File details:", req.file);
    } else {
        console.log("No file in request");
    }

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Return the secure URL path
        const fileUrl = `/files/${req.file.filename}`;
        console.log("Upload successful:", fileUrl);

        logAudit(req.user.uid, 'FILE_UPLOADED', req.file.filename, 'files');

        res.json({
            success: true,
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

/**
 * Secure file serving endpoint
 */
app.get('/files/:filename', authenticateToken, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    // In a real app, you might check if the user belongs to the village linked to the file
    // For now, any authenticated user can view files (basic protection)
    res.sendFile(filePath);
});

// ---------------------------------------------------------
// WATER TESTS
// ---------------------------------------------------------

app.post('/water-tests', authenticateToken, async (req, res) => {
    console.log("Received water test payload:", JSON.stringify(req.body, null, 2));
    const { village, ph, turbidity, consentGiven, ...additionalFields } = req.body;

    // DPDP Requirement: Block if consent not provided
    if (!consentGiven) {
        return res.status(400).json({ error: 'Consent required for data collection' });
    }

    const timestamp = new Date().toISOString();

    try {
        // AI Analysis for simple explanation
        let aiExplanation = "Water quality data recorded.";
        try {
            const { nitrate, chlorine, h2sResult } = additionalFields;
            const prompt = `Analyze water quality for a villager. 
            Metrics: pH: ${ph}, Turbidity: ${turbidity} NTU, Nitrate: ${nitrate || 0} mg/L, Chlorine: ${chlorine || 0} mg/L, H2S Contamination: ${h2sResult || 'safe'}.
            Provide a very simple, 1-sentence explanation of whether it is safe to drink or what to do (e.g. "Safe to drink", "Boil before drinking", "Do not drink").
            Language: English (simple).
            Output ONLY the sentence.`;

            const aiRes = await askGroq(prompt);
            if (aiRes) aiExplanation = aiRes.replace(/['"]+/g, '').trim();
        } catch (e) {
            console.error("AI Gen Failed", e);
        }

        const rawData = {
            ...additionalFields,
            ai_explanation: aiExplanation
        };

        const phNum = parseFloat(ph);
        const turbNum = parseFloat(turbidity);

        console.log("Saving to DB - Village:", village, "pH:", phNum, "Turbidity:", turbNum);

        const result = await pool.query(
            'INSERT INTO water_tests (village, ph, turbidity, timestamp, raw_data) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [village, phNum, turbNum, timestamp, rawData]
        );

        // Rule 1: Water Alerts
        if (turbidity > 30) {
            await pool.query(
                'INSERT INTO alerts (type, description, risk, village, timestamp) VALUES ($1, $2, $3, $4, $5)',
                ['Water Contamination', `High turbidity detected (${turbidity} NTU)`, 'High', village, timestamp]
            );
        }
        if (ph < 6.5 || ph > 8.5) {
            await pool.query(
                'INSERT INTO alerts (type, description, risk, village, timestamp) VALUES ($1, $2, $3, $4, $5)',
                ['Unsafe pH', `pH out of safe range: ${ph}`, 'Medium', village, timestamp]
            );
        }

        console.log("Water test saved successfully. ID:", result.rows[0].id);
        res.json({ ok: true, id: result.rows[0].id });
    } catch (err) {
        console.error("DATABASE ERROR (water-tests):", err.message);
        console.error("Error Details:", err);
        res.status(500).json({ error: 'Failed to save water test: ' + err.message });
    }
});

app.get('/water-tests/village', authenticateToken, async (req, res) => {
    const { village } = req.query;
    if (!village) return res.status(400).json({ error: 'Village is required' });
    try {
        const result = await pool.query(
            'SELECT * FROM water_tests WHERE village = $1 ORDER BY timestamp DESC',
            [village]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch water tests' });
    }
});

app.get('/water-status', authenticateToken, async (req, res) => {
    const { village } = req.query;
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (raw_data->>'sourceType') * 
             FROM water_tests 
             WHERE village = $1 
             ORDER BY raw_data->>'sourceType', timestamp DESC`,
            [village]
        );
        res.json(result.rows); // Returns array of latest per source
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// ---------------------------------------------------------
// SYMPTOM REPORTS
// ---------------------------------------------------------

app.post('/symptom-reports', authenticateToken, async (req, res) => {
    const { village, name, symptoms, timestamp: clientTs, reporterRole, consentGiven } = req.body; // symptoms is array

    // DPDP Requirement: Block if consent not provided
    if (!consentGiven) {
        return res.status(400).json({ error: 'Consent required for data collection' });
    }

    const timestamp = clientTs || new Date().toISOString();

    try {
        const result = await pool.query(
            'INSERT INTO symptom_reports (village, name, symptoms, timestamp) VALUES ($1, $2, $3, $4) RETURNING id',
            [village, name, symptoms, timestamp]
        );

        await logConsent(req.user.uid, 'SYMPTOM_REPORT_COLLECTION', true, req.ip);
        await logAudit(req.user.uid, 'SYMPTOM_REPORT_CREATED', result.rows[0].id.toString(), 'symptom_reports');

        // ------------------------------------------------------------------
        // IMMEDIATE ALERT FOR LOCALITE REPORTS
        // ------------------------------------------------------------------
        if (reporterRole === 'LOCALITE') {
            const description = `Citizen Report: ${name} reported ${symptoms.length} symptoms (${symptoms.join(', ')})`;
            await pool.query(
                'INSERT INTO alerts (type, description, risk, village, timestamp) VALUES ($1, $2, $3, $4, $5)',
                ['Citizen Report', description, 'Medium', village, timestamp]
            );
            console.log(`Generated immediate alert for ${village} from ${name}`);
        }

        // ------------------------------------------------------------------
        // NEW AGGREGATION LOGIC (Rule-based Cluster Detection)
        // ------------------------------------------------------------------
        if (village) {
            // Count similar symptoms in this village over the last 7 days from DB
            // We use unnest to treat each symptom in the array as a separate row to count
            const statsRes = await pool.query(
                `SELECT s, count(*) 
                FROM symptom_reports, unnest(symptoms) as s
                WHERE village = $1 
                AND timestamp > NOW() - INTERVAL '7 days'
                GROUP BY s`,
                [village]
            );

            for (let row of statsRes.rows) {
                const symptom = row.s;
                const count = parseInt(row.count, 10);
                let risk = null;
                let desc = "";

                if (count >= 10) {
                    risk = 'High';
                    desc = `Outbreak Alert: ${count} cases of ${symptom} reported in ${village} in the last 7 days.`;
                } else if (count >= 5) {
                    risk = 'Medium';
                    desc = `Cluster Alert: ${count} cases of ${symptom} reported in ${village}. Monitoring required.`;
                } else if (count >= 3) {
                    risk = 'Low';
                    desc = `Early Warning: ${count} cases of ${symptom} reported in ${village}.`;
                }

                if (risk) {
                    // Check if a similar alert already exists for today to avoid spam
                    const existing = await pool.query(
                        `SELECT * FROM alerts 
                         WHERE village = $1 AND description = $2 
                         AND timestamp > NOW() - INTERVAL '24 hours'`,
                        [village, desc]
                    );

                    if (existing.rows.length === 0) {
                        // 1. Standard Risk Alert for ASHA
                        await pool.query(
                            'INSERT INTO alerts (type, description, risk, village, timestamp) VALUES ($1, $2, $3, $4, $5)',
                            [`${risk} Risk: ${symptom} Cluster`, desc, risk, village, timestamp]
                        );
                        console.log(`Generated ${risk} alert for ${village}: ${symptom}`);

                        // 2. AI-Generated Precaution for Localites (Community Precaution)
                        // Trigger only for significant clusters to save API calls
                        if (count >= 3) {
                            try {
                                const prompt = `Identify relevant precautions for ${count} cases of "${symptom}" reported in ${village}, North East India context. 
                                Provide a concise, actionable safety message for villagers (max 25 words). 
                                Focus on water/vector-borne prevention if applicable.
                                Start with "Advisory: "`;

                                const advice = await askGroq(prompt);
                                const cleanAdvice = advice.replace(/['"]+/g, '').trim();

                                if (cleanAdvice) {
                                    await pool.query(
                                        'INSERT INTO alerts (type, description, risk, village, timestamp) VALUES ($1, $2, $3, $4, $5)',
                                        ['Community Precaution', cleanAdvice, 'Info', village, timestamp]
                                    );
                                    console.log(`Generated AI Precaution for ${village}: ${cleanAdvice}`);
                                }
                            } catch (aiErr) {
                                console.error("Failed to generate AI precaution:", aiErr);
                            }
                        }
                    }
                }
            }
        }

        res.json({ ok: true, id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save symptom report' });
    }
});

// ---------------------------------------------------------
// ALERTS
// ---------------------------------------------------------

app.get('/alerts', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});


app.post('/assistance-requests', authenticateToken, async (req, res) => {
    const { village, description, consentGiven, ...otherData } = req.body;

    if (!consentGiven) {
        return res.status(400).json({ error: 'Consent required for data collection' });
    }

    let finalDescription = description || "";
    let aiSolutions = [];

    try {
        // 1. Transcribe if audio is provided
        if (otherData.audioUrl) {
            // raw_data.audioUrl is a full URL, we need the local path
            const relativePath = otherData.audioUrl.replace(/.*\/uploads\//, '/uploads/');
            console.log("Transcribing audio:", relativePath);
            const transcription = await transcribeAudio(relativePath);
            if (transcription) {
                console.log("Transcription successful:", transcription);
                if (!finalDescription || finalDescription === "[Voice Message]") {
                    finalDescription = transcription;
                } else {
                    finalDescription = `${finalDescription} (Voice: ${transcription})`;
                }
            }
        }

        // 2. Generate AI Solutions
        if (finalDescription) {
            const prompt = `A villager in a rural area needs help: "${finalDescription}". 
            Provide 3-4 simple, actionable temporary solutions they can try while waiting for a health worker. 
            Focus on safety and basic health/community care.
            IMPORTANT: Keep each solution under 15 words.
            Format: A simple list.
            Disclaimer: End with "These are temporary suggestions. Wait for your ASHA worker."`;

            const rawAiRes = await askGroq(prompt);
            if (rawAiRes) {
                aiSolutions = rawAiRes.split('\n')
                    .map(s => s.replace(/^\d+\.\s*/, '').trim())
                    .filter(s => s.length > 5);
            }
        }

        const result = await pool.query(
            'INSERT INTO assistance_requests (village, description, raw_data) VALUES ($1, $2, $3) RETURNING id',
            [village, finalDescription, { ...otherData, ai_solutions: aiSolutions }]
        );

        await logConsent(req.user.uid, 'ASSISTANCE_REQUEST_COLLECTION', true, req.ip);
        await logAudit(req.user.uid, 'ASSISTANCE_REQUEST_CREATED', result.rows[0].id.toString(), 'assistance_requests');

        res.json({
            ok: true,
            solutions: aiSolutions
        });
    } catch (err) {
        console.error("Assistance Request Error:", err);
        res.status(500).json({ error: 'Failed' });
    }
});

app.get('/assistance-requests', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM assistance_requests ORDER BY timestamp DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch assistance requests' });
    }
});

app.patch('/assistance-requests/:id/resolve', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE assistance_requests SET status = $1 WHERE id = $2', ['resolved', id]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to resolve request' });
    }
});

app.post('/api/ai/analyze', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    // Call the internal helper
    const result = await askGroq(prompt);
    res.json({ result });
});

app.post('/api/sarvam/chat', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
    }

    try {
        const result = await askSarvam(messages);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/sarvam/stt', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
    }

    try {
        const transcript = await transcribeAudio(req.file.path);
        // Delete the temporary file
        fs.unlinkSync(req.file.path);
        res.json({ transcript });
    } catch (err) {
        console.error("Sarvam STT Error:", err.message);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/sarvam/history', authenticateToken, async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    try {
        const result = await pool.query(
            'SELECT role, content, timestamp FROM sarvam_chats WHERE user_id = $1 ORDER BY timestamp ASC',
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

app.post('/api/sarvam/save', async (req, res) => {
    const { user_id, role, content } = req.body;
    if (!user_id || !role || !content) {
        return res.status(400).json({ error: "user_id, role, and content are required" });
    }

    try {
        const result = await pool.query(
            'INSERT INTO sarvam_chats (user_id, role, content) VALUES ($1, $2, $3) RETURNING *',
            [user_id, role, content]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save chat message' });
    }
});

app.post('/api/sarvam/tts', async (req, res) => {
    const { text, languageCode, isCallAgent } = req.body;
    console.log("[TTS] Request received for text length:", text ? text.length : 0, "Lang:", languageCode, "isCallAgent:", !!isCallAgent);
    if (!text) return res.status(400).json({ error: "Text is required" });

    try {
        const audioBase64 = await textToSpeech(text, languageCode, isCallAgent);
        console.log("[TTS] Conversion successful, audio length:", audioBase64.length);
        res.json({ audioBase64 });
    } catch (err) {
        console.error("[TTS] Backend Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------------------------------------
// HELPLINE — URGENT CALLBACK REQUEST
// ---------------------------------------------------------
app.post('/api/helpline/urgent', authenticateToken, async (req, res) => {
    const { userId, userName, village, language, timestamp } = req.body;
    const ts = timestamp || new Date().toISOString();

    try {
        // 1. Create an urgent assistance request
        await pool.query(
            'INSERT INTO assistance_requests (village, description, raw_data) VALUES ($1, $2, $3)',
            [
                village || 'Unknown',
                `URGENT CALLBACK REQUEST from ${userName || 'Unknown'} via Helpline (Lang: ${language || 'en-IN'})`,
                { userId, userName, village, language, urgent: true, source: 'helpline' }
            ]
        );

        // 2. Create a high-priority alert for ASHA workers
        await pool.query(
            'INSERT INTO alerts (type, description, risk, village, timestamp) VALUES ($1, $2, $3, $4, $5)',
            [
                'Urgent Helpline',
                `🚨 URGENT: ${userName || 'A resident'} from ${village || 'your area'} needs immediate assistance. Please call back.`,
                'High',
                village || 'Unknown',
                ts
            ]
        );

        console.log(`[HELPLINE] Urgent callback request from ${userName} in ${village}`);
        res.json({ ok: true, message: 'ASHA worker has been notified' });
    } catch (err) {
        console.error('[HELPLINE] Error:', err.message);
        res.status(500).json({ error: 'Failed to create urgent request' });
    }
});

app.post('/ai-records', authenticateToken, async (req, res) => {
    const { type, content, metadata } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO ai_records (type, content, metadata) VALUES ($1, $2, $3) RETURNING id',
            [type, content, metadata]
        );
        res.json({ ok: true, id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save AI record' });
    }
});

app.get('/analytics', authenticateToken, async (req, res) => {
    try {
        // Aggregate data for clinic dashboard

        // 1. Total Symptom Reports
        const symptomsRes = await pool.query('SELECT COUNT(*) FROM symptom_reports');
        const symptomCount = parseInt(symptomsRes.rows[0].count);

        // 2. High Risk Water Tests (Turbidity > 10 OR pH outside 6.5-8.5)
        const waterRes = await pool.query('SELECT COUNT(*) FROM water_tests WHERE turbidity > 10 OR ph < 6.5 OR ph > 8.5');
        const waterRiskCount = parseInt(waterRes.rows[0].count);

        // 3. Pending Assistance Requests
        const assistRes = await pool.query("SELECT COUNT(*) FROM assistance_requests WHERE status = 'pending'");
        const assistanceCount = parseInt(assistRes.rows[0].count);

        // 4. Alerts
        const alertsRes = await pool.query('SELECT COUNT(*) FROM alerts');
        const alertsCount = parseInt(alertsRes.rows[0].count);

        res.json({
            symptomReports: symptomCount,
            highRiskWaterTests: waterRiskCount,
            pendingAssistance: assistanceCount,
            alerts: alertsCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

app.get('/analytics/detailed', authenticateToken, async (req, res) => {
    try {
        // Hotspots
        const hotspotsRes = await pool.query(
            'SELECT village, COUNT(*) as count FROM symptom_reports GROUP BY village ORDER BY count DESC LIMIT 8'
        );

        // Water Trend (last 14 days)
        const waterRes = await pool.query(
            `SELECT TO_CHAR(timestamp, 'YYYY-MM-DD') as date, AVG(turbidity) as "avgTurbidity", COUNT(*) as samples 
             FROM water_tests 
             WHERE timestamp > NOW() - INTERVAL '14 days' 
             GROUP BY 1 ORDER BY 1`
        );

        // Symptom Patterns
        const patternsRes = await pool.query(
            `SELECT s as symptom, COUNT(*) as count 
             FROM symptom_reports, unnest(symptoms) as s 
             GROUP BY 1 ORDER BY count DESC LIMIT 8`
        );

        res.json({
            hotspots: hotspotsRes.rows,
            waterTrend: waterRes.rows,
            symptomPatterns: patternsRes.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch detailed analytics' });
    }
});


app.post('/followups', authenticateToken, async (req, res) => {
    const { patient, task } = req.body;
    try {
        await pool.query(
            'INSERT INTO followups (patient_name, task) VALUES ($1, $2)',
            [patient, task]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to assign followup' });
    }
});



// ---------------------------------------------------------
// PRIVACY & HYGIENE (DPDP)
// ---------------------------------------------------------

/**
 * Anonymize old records (Right to be Forgotten / Retention)
 * In a real production app, this would run as a cron job.
 */
async function runAnonymization() {
    console.log('[PRIVACY]: Running anonymization for records older than 180 days...');
    try {
        // 1. Symptom Reports: Remove name and reduce geo-precision
        // We'll mock the geo-precision reduction by setting village to 'ANONYMIZED_ZONE' or similar
        const res = await pool.query(
            "UPDATE symptom_reports SET name = 'ANONYMIZED', village = 'HIDDEN' WHERE timestamp < NOW() - INTERVAL '180 days' AND name != 'ANONYMIZED'"
        );
        console.log(`[PRIVACY]: Anonymized ${res.rowCount} symptom reports.`);

        // 2. Audit Logs: Purge very old audit logs (e.g., > 1 year)
        const auditRes = await pool.query(
            "DELETE FROM audit_logs WHERE timestamp < NOW() - INTERVAL '365 days'"
        );
        console.log(`[PRIVACY]: Purged ${auditRes.rowCount} historical audit logs.`);
    } catch (err) {
        console.error('[PRIVACY ERROR]: Anonymization failed:', err.message);
    }
}

// Run anonymization once on startup for demo purposes
runAnonymization();

/**
 * Right to Erasure (DSR Request)
 */
app.post('/api/user/delete-data', authenticateToken, async (req, res) => {
    const userId = req.user.uid;
    try {
        // Log the request first
        await logAudit(userId, 'DATA_ERASURE_REQUESTED', userId.toString(), 'users');

        // 1. Delete chats
        await pool.query('DELETE FROM sarvam_chats WHERE user_id = $1', [userId]);

        // 2. Anonymize reports linked to this user (if any are directly linked)
        // Note: currently symptom_reports are by 'name', not user_id. 
        // In a real system, we'd link by user_id.
        const userNameRes = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
        if (userNameRes.rows.length > 0) {
            const userName = userNameRes.rows[0].name;
            await pool.query("UPDATE symptom_reports SET name = 'DELETED_USER' WHERE name = $1", [userName]);
        }

        // 3. Delete user account
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.json({ ok: true, message: 'Your data has been erased successfully.' });
    } catch (err) {
        console.error('[ERASURE ERROR]:', err.message);
        res.status(500).json({ error: 'Failed to complete erasure request.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (0.0.0.0)`);
});
