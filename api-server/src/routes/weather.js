const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat & lon required" });
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=temperature_2m_max,relative_humidity_2m_mean,precipitation_sum&timezone=auto&forecast_days=7`;

  try {
    const r = await axios.get(url);
    const d = r.data;

    // ✅ Create future forecast array
    const future = d.daily.time.map((date, i) => ({
      date,
      temp: d.daily.temperature_2m_max[i],
      humidity: d.daily.relative_humidity_2m_mean[i],
      rain: Math.max(0, Number(d.daily.precipitation_sum[i])), // never negative
    }));

    res.json({
      current: d.current,
      future,
    });

  } catch (err) {
    console.error("Weather fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

module.exports = router;
