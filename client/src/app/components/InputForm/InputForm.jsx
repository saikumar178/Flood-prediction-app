"use client";

import { useState, useEffect } from 'react';
import styles from './InputForm.module.css';

export default function InputForm() {
  // State for all form fields
  const [rainfall, setRainfall] = useState('');
  const [riverLevel, setRiverLevel] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');

  // State for UI feedback
  const [statusMessage, setStatusMessage] = useState('Awaiting location permission...');
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  useEffect(() => {
    // This effect runs once when the component mounts to get the user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Success Callback: This runs if the user approves the location request
        async (position) => {
          const { latitude, longitude } = position.coords;
          setStatusMessage('Fetching current weather...');
          
          try {
            // Call your Express backend route with the coordinates
            const response = await fetch(`http://localhost:3001/api/weather?lat=${latitude}&lon=${longitude}`);
            if (!response.ok) {
              throw new Error('Network response from server was not ok');
            }
            
            const weatherData = await response.json();
            
            // Auto-fill the form with the fetched data
            setTemperature(weatherData.current.temperature_2m);
            setHumidity(weatherData.current.relative_humidity_2m);
            setRainfall(weatherData.current.precipitation);
            setStatusMessage('Weather data filled automatically. Please enter river level.');

          } catch (error) {
            setStatusMessage('Could not fetch weather. Please enter all data manually.');
            console.error("Fetch Error:", error);
          }
        },
        // Error Callback: This runs if the user denies permission
        () => {
          setStatusMessage('Location access denied. Please enter data manually.');
        }
      );
    } else {
      // This runs if the browser doesn't support geolocation
      setStatusMessage('Geolocation is not supported by your browser.');
    }
  }, []); // The empty array [] ensures this effect runs only once

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPredictionResult(null);

    // This is a MOCK API call to simulate getting a prediction
    console.log("Submitting:", { rainfall, riverLevel, temperature, humidity });
    setTimeout(() => {
      const mockPrediction = Math.random() > 0.5 ? "Flood Likely" : "No Flood Expected";
      setPredictionResult(mockPrediction);
      setIsLoading(false);
    }, 2000); // Simulate a 2-second delay
  };

  return (
    <div className={styles.card}>
      <h2>Enter Current Conditions</h2>
      <p className={styles.status}>{statusMessage}</p>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="temperature" className={styles.label}>Temperature (°C):</label>
          <input type="number" id="temperature" className={styles.input} value={temperature} onChange={(e) => setTemperature(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="humidity" className={styles.label}>Humidity (%):</label>
          <input type="number" id="humidity" className={styles.input} value={humidity} onChange={(e) => setHumidity(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="rainfall" className={styles.label}>Rainfall (mm):</label>
          <input type="number" id="rainfall" className={styles.input} value={rainfall} onChange={(e) => setRainfall(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="riverLevel" className={styles.label}>River Level (m):</label>
          <input type="number" id="riverLevel" className={styles.input} value={riverLevel} onChange={(e) => setRiverLevel(e.target.value)} placeholder="Manual entry required" required />
        </div>
        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Predicting...' : 'Predict Flood Risk'}
        </button>
      </form>

      {isLoading && <p className={styles.loading}>Analyzing data...</p>}
      {predictionResult && (
        <div className={`${styles.resultContainer} ${predictionResult === 'Flood Likely' ? styles.resultDanger : styles.resultSafe}`}>
          {predictionResult}
        </div>
      )}
    </div>
  );
}