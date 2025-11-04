"use client";
import { useState, useEffect } from "react";
import styles from "./InputForm.module.css";

export default function InputForm() {
  const [rainfall, setRainfall] = useState("");
  const [riverLevel, setRiverLevel] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");

  const [status, setStatus] = useState("⏳ Fetching location...");
  const [isLoading, setIsLoading] = useState(false);
  const [todayPrediction, setTodayPrediction] = useState(null);
  const [todayProbability, setTodayProbability] = useState(null);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("⚠️ Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `http://localhost:3001/api/weather?lat=${latitude}&lon=${longitude}`
          );
          const weather = await res.json();

          setTemperature(weather.current.temperature_2m);
          setHumidity(weather.current.relative_humidity_2m);
          setRainfall(weather.current.precipitation);

          // ✅ correctly read backend `future`
          setForecast(weather.future.slice(0, 7));

          setStatus("✅ Weather auto-filled — enter river level");
        } catch {
          setStatus("⚠️ Weather fetch failed. Enter manually.");
        }
      },
      () => setStatus("⚠️ Location denied — enter manually")
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTodayPrediction(null);

    // ✅ Today's prediction
    const res = await fetch("http://localhost:3001/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rainfall: Number(rainfall),
        river_level: Number(riverLevel),
        temperature: Number(temperature),
        humidity: Number(humidity),
      }),
    });

    const today = await res.json();
    setTodayPrediction(today.prediction);
    setTodayProbability(today.probability);

    // ✅ Predict for next 7 days
    const updated = [];
    for (const day of forecast) {
      const r = await fetch("http://localhost:3001/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rainfall: Number(day.rain),
          river_level: Number(riverLevel),
          temperature: Number(day.temp),
          humidity: Number(day.humidity),
        }),
      });

      const pd = await r.json();
      updated.push({ ...day, prediction: pd.prediction, probability: pd.probability });
    }

    setForecast(updated);
    setIsLoading(false);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>🌧️ AI Flood Predictor</h2>
      <p className={styles.status}>{status}</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.group}>
          <label className={styles.label}>Temperature (°C)</label>
          <input className={styles.input} type="number" value={temperature} onChange={e => setTemperature(e.target.value)} required />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Humidity (%)</label>
          <input className={styles.input} type="number" value={humidity} onChange={e => setHumidity(e.target.value)} required />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Rainfall (mm)</label>
          <input className={styles.input} type="number" value={rainfall} onChange={e => setRainfall(e.target.value)} required />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>River Level (m)</label>
          <input className={styles.input} type="number" value={riverLevel} onChange={e => setRiverLevel(e.target.value)} required />
          <p className={styles.note}>If no river, enter 0</p>
        </div>

        <button className={styles.btn} disabled={isLoading}>
          {isLoading ? "⏳ Predicting..." : "🔍 Predict Flood Risk"}
        </button>
      </form>

      {todayPrediction && (
        <div className={todayPrediction.includes("Flood") ? styles.danger : styles.safe}>
          {todayPrediction} ({todayProbability})
        </div>
      )}

      {forecast.length > 0 && (
        <>
          <h3 className={styles.subheading}>📅 7-Day Flood Prediction</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Temp (°C)</th>
                <th className={styles.th}>Humidity (%)</th>
                <th className={styles.th}>Rain (mm)</th>
                <th className={styles.th}>Prediction</th>
                <th className={styles.th}>Probability</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((d, i) => (
                <tr key={i} className={styles.row}>
                  <td className={styles.td}>{d.date}</td>
                  <td className={styles.td}>{d.temp}</td>
                  <td className={styles.td}>{d.humidity}</td>
                  <td className={styles.td}>{d.rain}</td>
                  <td className={`${styles.td} ${d.prediction?.includes("Flood") ? styles.dangertxt : styles.safetxt}`}>
                    {d.prediction}
                  </td>
                  <td className={styles.td}>{d.probability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
