const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Instagram Profile API
app.get('/api/instagram/:username', async (req, res) => {
  const { username } = req.params;
  const apiKey = process.env.APIFY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Apify API key is missing' });
  }

  try {
    const response = await axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apiKey}`,
      { usernames: [username] }
    );

    if (response.data && response.data.length > 0) {
      res.json(response.data[0]);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    console.error('Apify API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch Instagram profile data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
