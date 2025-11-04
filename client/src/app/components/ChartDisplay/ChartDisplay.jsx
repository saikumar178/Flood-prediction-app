"use client";

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './ChartDisplay.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ChartDisplay() {
  const [chartData, setChartData] = useState({ datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Getting your location...");

  useEffect(() => {
    const getLocationAndFetch = () => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported.");
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setLocationStatus(`Location detected ✅ (${lat.toFixed(2)}, ${lon.toFixed(2)})`);

          try {
            const response = await fetch(`http://localhost:3001/api/weather?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error("API error");

            const data = await response.json();

            const labels = data.future.map(d => d.date);

            setChartData({
              labels,
              datasets: [
                {
                  label: "Rain (mm)",
                  data: data.future.map(d => d.rain),
                  borderColor: "rgb(53, 162, 235)",
                  backgroundColor: "rgba(53, 162, 235, 0.5)",
                  yAxisID: "y"
                },
                {
                  label: "Max Temperature (°C)",
                  data: data.future.map(d => d.temp),
                  borderColor: "rgb(255, 99, 132)",
                  backgroundColor: "rgba(255, 99, 132, 0.5)",
                  yAxisID: "y1"
                },
                {
                  label: "Humidity (%)",
                  data: data.future.map(d => d.humidity),
                  borderColor: "rgb(75, 192, 192)",
                  backgroundColor: "rgba(75, 192, 192, 0.5)",
                  yAxisID: "y2"
                }
              ]
            });

          } catch {
            setError("Failed to load data — check backend / CORS");
          }

          setIsLoading(false);
        },
        () => {
          setError("Location permission denied ❌");
          setIsLoading(false);
        }
      );
    };

    getLocationAndFetch();
  }, []);

  const options = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    stacked: false,
    scales: {
      y: { type: "linear", display: true, position: "left", title: { display: true, text: "Rain (mm)" }},
      y1: { type: "linear", display: true, position: "right", title: { display: true, text: "Temp (°C)" }, grid: { drawOnChartArea: false }},
      y2: { type: "linear", display: false }
    }
  };

  return (
    <div className={styles.chartContainer}>
      <h2>🌦️ 7-Day Weather Forecast (Your Location)</h2>
      <p className={styles.locationMsg}>{locationStatus}</p>
      {isLoading && <p className={styles.loading}>Loading weather data...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!isLoading && !error && <Line options={options} data={chartData} />}
    </div>
  );
}
