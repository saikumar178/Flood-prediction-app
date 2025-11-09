"use client";
import { useState, useEffect } from "react";
import { districtMap } from "@/utils/districtMap"; // ✅ added mapping import
import styles from "./InputForm.module.css";

export default function InputForm() {
  const [district, setDistrict] = useState("");
  const [month, setMonth] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [elevation, setElevation] = useState("");
  const [status, setStatus] = useState("⏳ Detecting location...");
  const [isLoading, setIsLoading] = useState(false);
  const [todayPrediction, setTodayPrediction] = useState(null);
  const [forecast, setForecast] = useState([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // ✅ Auto-detect location, district & weather
  useEffect(() => {
    const detectLocation = async () => {
      if (!navigator.geolocation) {
        setStatus("⚠️ Geolocation not supported.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          try {
            // 🏙️ Reverse geocode to get district
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const geoData = await geoRes.json();

            const rawDistrict =
              geoData.address.state_district ||
              geoData.address.county ||
              geoData.address.state ||
              "Unknown District";

            // ✅ Standardize district name using map
            const standardizedDistrict = districtMap[rawDistrict] || rawDistrict;
            setDistrict(standardizedDistrict);

            // 🌦️ Fetch weather data
            const weatherRes = await fetch(
              `http://localhost:3001/api/weather?lat=${latitude}&lon=${longitude}`
            );
            const weather = await weatherRes.json();

            setTemperature(weather.current.temperature_2m);
            setHumidity(weather.current.relative_humidity_2m);
            setRainfall(weather.current.precipitation);

            // 🗓️ Set current month automatically
            const currentMonth = new Date().toLocaleString("default", {
              month: "long",
            });
            setMonth(currentMonth);

            setStatus(`✅ Auto-filled: ${standardizedDistrict}, ${currentMonth}`);
          } catch (err) {
            console.error("Auto-detect failed:", err);
            setStatus("⚠️ Failed to detect district/weather.");
          }
        },
        () => setStatus("⚠️ Location access denied.")
      );
    };

    detectLocation();
  }, []);

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTodayPrediction(null);
    setForecast([]);

    const monthNumber = months.indexOf(month) + 1;

    try {
      const res = await fetch("http://localhost:3001/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district,
          month: monthNumber,
          rainfall: Number(rainfall),
          temperature: Number(temperature),
          humidity: Number(humidity),
          elevation: Number(elevation),
        }),
      });

      const today = await res.json();
      setTodayPrediction(today);

      // ✅ Simulated 7-day forecast with real future dates
      const simulatedForecast = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1); // tomorrow + onwards
        const formattedDate = date.toISOString().split("T")[0]; // e.g., 2025-11-10
      
        return {
          date: formattedDate,
          temp: temperature - 1 + Math.random() * 2,
          humidity: humidity - 3 + Math.random() * 5,
          rain: rainfall - 5 + Math.random() * 10,
        };
      });


      const updated = [];
      for (const day of simulatedForecast) {
        const r = await fetch("http://localhost:3001/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            district,
            month: monthNumber,
            rainfall: day.rain,
            temperature: day.temp,
            humidity: day.humidity,
            elevation: Number(elevation),
          }),
        });

        const pd = await r.json();
        updated.push({ ...day, prediction: pd.prediction, probability: pd.probability });
      }

      setForecast(updated);
    } catch (err) {
      console.error("Prediction failed:", err);
      alert("Prediction service not reachable. Check Flask & Express servers.");
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>🌧️ Smart Flood Predictor</h2>
      <p className={styles.status}>{status}</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.group}>
          <label className={styles.label}>District</label>
          <input
            className={styles.input}
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Month</label>
          <select
            className={styles.input}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          >
            <option value="">Select month</option>
            {months.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Rainfall (mm)</label>
          <input
            className={styles.input}
            type="number"
            value={rainfall}
            onChange={(e) => setRainfall(e.target.value)}
            required
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Temperature (°C)</label>
          <input
            className={styles.input}
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            required
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Humidity (%)</label>
          <input
            className={styles.input}
            type="number"
            value={humidity}
            onChange={(e) => setHumidity(e.target.value)}
            required
          />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Elevation (m)</label>
          <input
            className={styles.input}
            type="number"
            value={elevation}
            onChange={(e) => setElevation(e.target.value)}
            required
          />
        </div>

        <button className={styles.btn} disabled={isLoading}>
          {isLoading ? "⏳ Predicting..." : "🔍 Predict Flood Risk"}
        </button>
      </form>

      {todayPrediction && (
        <div
          className={`${styles.resultBox} ${
            todayPrediction.prediction === "Flood Likely" ? styles.danger : styles.safe
          }`}
        >
          {todayPrediction.prediction} (Prob: {todayPrediction.probability})
        </div>
      )}

      {forecast.length > 0 && (
        <>
          <h3 className={styles.subheading}>📅 Next 7-Day Prediction</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Temp (°C)</th>
                <th>Humidity (%)</th>
                <th>Rain (mm)</th>
                <th>Prediction</th>
                <th>Prob</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((d, i) => (
                <tr key={i}>
                  <td>{d.date}</td>
                  <td>{d.temp.toFixed(1)}</td>
                  <td>{d.humidity.toFixed(1)}</td>
                  <td>{d.rain.toFixed(1)}</td>
                  <td
                    className={
                      d.prediction === "Flood Likely"
                        ? styles.dangerText
                        : styles.safeText
                    }
                  >
                    {d.prediction}
                  </td>
                  <td>{d.probability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
