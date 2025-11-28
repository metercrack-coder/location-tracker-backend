const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS for all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Store locations in memory (since file system may not persist on Render free tier)
let locations = [];

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Location Tracking Server',
        status: 'running',
        endpoints: {
            health: '/health',
            locations: '/api/locations'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Server is running', 
        timestamp: Date.now(),
        totalLocations: locations.length
    });
});

// GET all locations
app.get('/api/locations', (req, res) => {
    console.log('GET /api/locations - Returning', locations.length, 'locations');
    res.json(locations);
});

// POST new locations (can accept single or array)
app.post('/api/locations', (req, res) => {
    console.log('POST /api/locations - Received:', req.body);
    
    try {
        const newLocations = Array.isArray(req.body) ? req.body : [req.body];
        
        newLocations.forEach(loc => {
            if (loc.latitude && loc.longitude && loc.timestamp) {
                locations.push({
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    timestamp: loc.timestamp
                });
            }
        });
        
        console.log('Saved', newLocations.length, 'location(s). Total:', locations.length);
        res.status(200).json({ 
            success: true, 
            message: 'Locations saved',
            count: newLocations.length,
            total: locations.length
        });
    } catch (error) {
        console.error('Error saving locations:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save locations',
            error: error.message
        });
    }
});

// DELETE all locations (optional - for testing)
app.delete('/api/locations', (req, res) => {
    console.log('DELETE /api/locations - Clearing all locations');
    locations = [];
    res.json({ success: true, message: 'All locations cleared' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
        availableEndpoints: ['/', '/health', '/api/locations']
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log('Location Tracking Server Started');
    console.log('=================================');
    console.log(`Server running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET    /              - Server info');
    console.log('  GET    /health        - Health check');
    console.log('  GET    /api/locations - Get all locations');
    console.log('  POST   /api/locations - Save new locations');
    console.log('  DELETE /api/locations - Clear all locations');
    console.log('=================================');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});
