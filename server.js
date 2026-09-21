const express = require('express');
const axios = require('axios');
const app = express();

// 1. Enable CORS Headers for GitHub Pages & Telegram WebView
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Root test endpoint
app.get('/', (req, res) => {
    res.send('Instagram Analytics Backend is Live!');
});

// 2. Instagram Fetch Endpoint via Apify
app.get('/api/instagram/:username', async (req, res) => {
    const username = req.params.username;
    const apiKey = process.env.APIFY_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "APIFY_API_KEY missing on Render environment variables!" });
    }

    try {
        console.log(`Fetching profile for: ${username}`);
        const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apiKey}`;
        
        const response = await axios.post(apifyUrl, {
            usernames: [username]
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 55000
        });

        if (response.data && response.data.length > 0) {
            return res.json(response.data[0]);
        } else {
            return res.status(404).json({ error: "Profile not found or no data returned." });
        }
    } catch (error) {
        console.error("Apify Error:", error.message);
        return res.status(500).json({ 
            error: "Failed to fetch profile data from Apify", 
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
