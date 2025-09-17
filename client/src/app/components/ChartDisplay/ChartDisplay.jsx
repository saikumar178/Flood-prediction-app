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

// Register the necessary components for Chart.js
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

  useEffect(() => {
    // This function runs once when the component is first rendered
    const fetchHistoricalData = async () => {
      try {
        // Using fixed coordinates for Mangaluru for the historical chart
        const lat = 12.9141;
        const lon = 74.8560;
        
        // Fetch data from your Express backend API
        const response = await fetch(`http://localhost:3001/api/weather?lat=${lat}&lon=${lon}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Format the API data into the structure Chart.js expects
        const labels = data.daily.time;
        setChartData({
          labels,
          datasets: [
            {
              label: 'Precipitation Sum (mm)',
              data: data.daily.precipitation_sum,
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              yAxisID: 'y',
            },
            {
              label: 'Max Temperature (°C)',
              data: data.daily.temperature_2m_max,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              yAxisID: 'y1',
            },
            {
              label: 'Mean Humidity (%)',
              data: data.daily.relative_humidity_2m_mean,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              yAxisID: 'y2',
            },
          ]
        });

      } catch (e) {
        console.error("Failed to fetch chart data", e);
        setError("Failed to load chart data. Please ensure the backend server is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, []); // The empty array ensures this effect runs only once

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Precipitation (mm)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Temperature (°C)'
        },
        grid: {
          drawOnChartArea: false, // only want the grid lines for one axis to show
        },
      },
      y2: {
        type: 'linear',
        display: false, // Hiding the third axis to keep the chart clean
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <h2>Historical Weather Trends (Last 7 Days)</h2>
      {isLoading && <p>Loading chart data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && <Line options={options} data={chartData} />}
    </div>
  );
}