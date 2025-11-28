// Simple Node.js backend server for location tracking
// Install dependencies: npm install express body-parser

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Store locations in a JSON file
const DATA_FILE = path.join(__dirname, 'locations.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Helper function to read locations
function readLocations() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading locations:', error);
        return [];
    }
}

// Helper function to write locations
function writeLocations(locations) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(locations, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing locations:', error);
        return false;
    }
}

// API Routes

// GET all locations
app.get('/api/locations', (req, res) => {
    console.log('GET /api/locations - Fetching all locations');
    const locations = readLocations();
    res.json(locations);
});

// POST new locations (can accept single or array)
app.post('/api/locations', (req, res) => {
    console.log('POST /api/locations - Received:', req.body);
    
    const newLocations = Array.isArray(req.body) ? req.body : [req.body];
    const locations = readLocations();
    
    // Add new locations
    newLocations.forEach(loc => {
        if (loc.latitude && loc.longitude && loc.timestamp) {
            locations.push({
                latitude: loc.latitude,
                longitude: loc.longitude,
                timestamp: loc.timestamp
            });
        }
    });
    
    // Save to file
    if (writeLocations(locations)) {
        console.log(`Saved ${newLocations.length} new location(s). Total: ${locations.length}`);
        res.status(200).json({ 
            success: true, 
            message: 'Locations saved',
            count: newLocations.length,
            total: locations.length
        });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save locations' 
        });
    }
});

// DELETE all locations (optional - for testing)
app.delete('/api/locations', (req, res) => {
    console.log('DELETE /api/locations - Clearing all locations');
    if (writeLocations([])) {
        res.json({ success: true, message: 'All locations cleared' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to clear locations' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: Date.now() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log('Location Tracking Server Started');
    console.log('=================================');
    console.log(`Server running on port ${PORT}`);
    console.log(`Access from your network: http://YOUR_IP_ADDRESS:${PORT}`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  GET    /api/locations  - Get all locations');
    console.log('  POST   /api/locations  - Save new locations');
    console.log('  DELETE /api/locations  - Clear all locations');
    console.log('  GET    /health         - Health check');
    console.log('=================================');
    console.log('');
    console.log('To find your IP address:');
    console.log('  Windows: ipconfig');
    console.log('  Mac/Linux: ifconfig or ip addr');
    console.log('=================================');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});
