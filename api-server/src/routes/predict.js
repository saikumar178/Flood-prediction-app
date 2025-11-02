const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { rainfall, river_level, temperature, humidity } = req.body;

    const response = await axios.post("http://127.0.0.1:5000/predict", {
      rainfall,
      river_level,
      temperature,
      humidity
    });

     res.json({
      success: true,
      prediction: response.data.prediction,  // ✅ match Flask key
      probability: response.data.probability // ✅ optional field
    });
  } catch (err) {
    console.error("Error calling Python service:", err.message);
    res.status(500).json({ success: false, error: "Prediction service failed" });
  }
});

module.exports = router;
