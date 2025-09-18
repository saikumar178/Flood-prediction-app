const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weather');

const app = express();
const PORT = 3001;

// --- Middleware ---
// Enable CORS for all routes
app.use(cors());
// Enable Express to parse JSON in request bodies
app.use(express.json());

// --- Routes ---
app.use('/api/weather', weatherRoutes);

// TODO: Create and use a /api/predict route that calls the Python service

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Express server is running on http://localhost:${PORT}`);
});