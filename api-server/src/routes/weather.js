const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { lat, lon } = req.query;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation&daily=precipitation_sum,temperature_2m_max,relative_humidity_2m_mean&timezone=auto&forecast_days=7`;

  const r = await axios.get(url);
  const d = r.data;

  const future = d.daily.time.map((date, i) => ({
    date,
    temp: d.daily.temperature_2m_max[i],
    humidity: d.daily.relative_humidity_2m_mean[i],
    rain: d.daily.precipitation_sum[i],
  }));

  res.json({
    current: d.current,
    future,
  });
});

module.exports = router;
