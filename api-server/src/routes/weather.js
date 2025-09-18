const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route: GET /api/weather
// Fetches current weather and 7-day historical data from Open-Meteo
router.get('/', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required query parameters.' });
    }

    const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum,temperature_2m_max,relative_humidity_2m_mean&timezone=auto&past_days=7`;

    try {
        const response = await axios.get(weatherApiUrl);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching from Open-Meteo:", error.message);
        res.status(500).json({ error: 'Failed to fetch external weather data.' });
    }
});

module.exports = router;