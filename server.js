require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/instagram/:username', async (req, res) => {
  const { username } = req.params;
  const apiKey = process.env.APIFY_API_KEY;

  try {
    const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apiKey}`;
    const apifyResponse = await axios.post(apifyUrl, { usernames: [username] });
    const results = apifyResponse.data;

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: "Profile nahi mili!" });
    }

    const userData = results[0];
    const responseData = {
      username: userData.username || username,
      full_name: userData.fullName || username.toUpperCase(),
      profile_pic: userData.profilePicUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      stats: {
        posts: userData.postsCount || 0,
        followers: userData.followersCount ? formatNumber(userData.followersCount) : "0",
        following: userData.followsCount || 0
      },
      insights: { total_plays: "250.5K", avg_likes: "15.2K" },
      reels: (userData.latestPosts || []).slice(0, 6).map((post, index) => ({
        id: index + 1,
        plays: post.videoPlayCount ? formatNumber(post.videoPlayCount) : `${(Math.random() * 50 + 10).toFixed(1)}k`,
        thumbnail: post.displayUrl || `https://picsum.photos/300/500?random=${index + 1}`
      }))
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: "Profile fetch karne me error aaya." });
  }
});

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
