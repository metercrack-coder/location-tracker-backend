const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let locations = [];

// Root
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Health
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: Date.now() });
});

// Get locations
app.get('/api/locations', (req, res) => {
    res.json(locations);
});

// Save locations
app.post('/api/locations', (req, res) => {
    const newLocs = Array.isArray(req.body) ? req.body : [req.body];
    locations.push(...newLocs);
    res.json({ success: true, total: locations.length });
});

app.listen(PORT, () => {
    console.log('Server running on port', PORT);
});
