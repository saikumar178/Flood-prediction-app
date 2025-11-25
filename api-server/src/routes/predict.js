const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { district, month, rainfall, temperature, humidity, elevation } = req.body;

    const response = await axios.post("http://127.0.0.1:8000/predict", {
      district,
      month,
      rainfall,
      temperature,
      humidity,
      elevation
    });

    res.json({
      success: true,
      ...response.data
    });
  } catch (err) {
    console.error("Error calling Flask service:", err.message);
    res.status(500).json({ success: false, error: "Prediction service failed" });
  }
});

module.exports = router;
