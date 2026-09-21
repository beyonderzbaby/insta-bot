const express = require('express');
const cors = require('cors');
const app = express();

// सभी Origin (GitHub Pages) से अनुरोध की अनुमति दें
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Instagram API Route
app.get('/api/instagram/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
        // आपका Apify API कॉल यहाँ रहेगा
        res.json({ success: true, message: `Data fetched for ${username}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

