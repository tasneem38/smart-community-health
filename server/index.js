const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool } = require('./db');
const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
        res.json({ user: result.rows[0], token: 'mock-jwt-token-' + result.rows[0].id });
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

        res.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role, village: user.village },
            token: 'mock-jwt-token-' + user.id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ---------------------------------------------------------
// WATER TESTS
// ---------------------------------------------------------

app.post('/water-tests', async (req, res) => {
    const { village, ph, turbidity, additional_data } = req.body;
    const timestamp = new Date().toISOString(); // or req.body.timestamp

    try {
        const result = await pool.query(
            'INSERT INTO water_tests (village, ph, turbidity, timestamp, raw_data) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [village, ph, turbidity, timestamp, additional_data || {}]
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

        res.json({ ok: true, id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save water test' });
    }
});

app.get('/water-status', async (req, res) => {
    const { village } = req.query;
    try {
        const result = await pool.query(
            'SELECT * FROM water_tests WHERE village = $1 ORDER BY timestamp DESC LIMIT 1',
            [village]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
});

// ---------------------------------------------------------
// SYMPTOM REPORTS
// ---------------------------------------------------------

app.post('/symptom-reports', async (req, res) => {
    const { village, name, symptoms, timestamp: clientTs, reporterRole } = req.body; // symptoms is array
    const timestamp = clientTs || new Date().toISOString();

    try {
        const result = await pool.query(
            'INSERT INTO symptom_reports (village, name, symptoms, timestamp) VALUES ($1, $2, $3, $4) RETURNING id',
            [village, name, symptoms, timestamp]
        );

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

app.get('/alerts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 50');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});


app.post('/assistance-requests', async (req, res) => {
    const { village, description } = req.body;
    try {
        await pool.query(
            'INSERT INTO assistance_requests (village, description) VALUES ($1, $2)',
            [village, description]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

app.post('/api/ai/analyze', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    // Call the internal helper
    const result = await askGroq(prompt);
    res.json({ result });
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
