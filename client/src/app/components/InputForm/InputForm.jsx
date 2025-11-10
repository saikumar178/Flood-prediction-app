"use client";
import { useState, useEffect } from "react";
import { districtMap } from "@/utils/districtMap";
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
  const [showTable, setShowTable] = useState(false);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  // ✅ Auto-detect district + weather + elevation
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
            // ✅ Reverse geocode district
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const geo = await geoRes.json();

            const rawDistrict =
              geo.address.state_district ||
              geo.address.county ||
              geo.address.state ||
              "Unknown District";

            const standardized = districtMap[rawDistrict] || rawDistrict;
            setDistrict(standardized);

            // ✅ Get weather for today + next 7 days
            const weatherRes = await fetch(
              `http://localhost:3001/api/weather?lat=${latitude}&lon=${longitude}`
            );
            const weatherData = await weatherRes.json();

            setTemperature(weatherData.current.temperature_2m);
            setHumidity(weatherData.current.relative_humidity_2m);
            setRainfall(weatherData.current.precipitation);

            // ✅ Real 7-day forecast from backend
            setForecast(weatherData.future);

            // ✅ Auto month
            const currentMonth = new Date().toLocaleString("default", { month: "long" });
            setMonth(currentMonth);

            // ✅ Auto ELEVATION (FULL FIX)
            const elevRes = await fetch(
              `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`
            );
            const elevData = await elevRes.json();

            let autoElevation = 0;
            if (elevData?.data?.[0]?.elevation) {
              autoElevation = elevData.data[0].elevation;
            } else if (elevData?.elevation) {
              autoElevation = elevData.elevation;
            }

            setElevation(autoElevation);

            setStatus(`✅ Auto-filled: ${standardized}, ${currentMonth}`);
          } catch (err) {
            console.error(err);
            setStatus("⚠️ Could not auto-detect weather/district.");
          }
        },
        () => setStatus("⚠️ Location access denied.")
      );
    };

    detectLocation();
  }, []);

  // ✅ Submit & prediction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTodayPrediction(null);
    setShowTable(false);

    const monthNumber = months.indexOf(month) + 1;

    try {
      // ✅ TODAY PREDICTION
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

      // ✅ 7-Day Predictions
      const updated = [];
      for (const day of forecast) {
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
      setShowTable(true);
    } catch (err) {
      alert("Prediction service unavailable.");
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>🌧️ Smart Flood Predictor</h2>
      <p className={styles.status}>{status}</p>

      <form onSubmit={handleSubmit}>
        {/* District */}
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

        {/* Month */}
        <div className={styles.group}>
          <label className={styles.label}>Month</label>
          <select
            className={styles.input}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          >
            <option value="">Select</option>
            {months.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Weather Inputs */}
        <div className={styles.group}>
          <label className={styles.label}>Rainfall (mm)</label>
          <input className={styles.input} type="number" value={rainfall}
            onChange={(e) => setRainfall(e.target.value)} required />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Temperature (°C)</label>
          <input className={styles.input} type="number" value={temperature}
            onChange={(e) => setTemperature(e.target.value)} required />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Humidity (%)</label>
          <input className={styles.input} type="number" value={humidity}
            onChange={(e) => setHumidity(e.target.value)} required />
        </div>

        {/* Elevation */}
        <div className={styles.group}>
          <label className={styles.label}>Elevation (m)</label>
          <input className={styles.input} type="number" value={elevation}
            onChange={(e) => setElevation(e.target.value)} required />
        </div>

        <button className={styles.btn} disabled={isLoading}>
          {isLoading ? "⏳ Predicting..." : "🔍 Predict Flood Risk"}
        </button>
      </form>

      {/* TODAY PREDICTION */}
      {todayPrediction && (
        <div
          className={`${styles.resultBox} ${
            todayPrediction.prediction === "Flood Likely" ? styles.danger : styles.safe
          }`}
        >
          {todayPrediction.prediction} (Prob: {todayPrediction.probability})
        </div>
      )}

      {/* TABLE ONLY AFTER CLICK */}
      {showTable && forecast.length > 0 && (
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
                  <td>{d.temp}</td>
                  <td>{d.humidity}</td>
                  <td>{d.rain}</td>
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
