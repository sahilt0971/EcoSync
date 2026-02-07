const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Service Endpoints (Defaults for local dev)
const ATMOSPHERE_URL = process.env.ATMOSPHERE_URL || 'http://localhost:3001';
const THERMAL_URL = process.env.THERMAL_URL || 'http://localhost:8000';

app.get('/health', (req, res) => {
    res.json({ status: 'Gateway Online', timestamp: new Date() });
});

// Proxy to Atmosphere Service
app.get('/api/atmosphere', async (req, res) => {
    try {
        const response = await axios.get(`${ATMOSPHERE_URL}/status`);
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ error: 'Atmosphere Service Unavailable', details: error.message });
    }
});

app.post('/api/atmosphere/intervene', async (req, res) => {
    try {
        const response = await axios.post(`${ATMOSPHERE_URL}/intervene`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ error: 'Atmosphere Service Unavailable', details: error.message });
    }
});

// Proxy to Thermal Service
app.get('/api/thermal', async (req, res) => {
    try {
        const response = await axios.get(`${THERMAL_URL}/status`);
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ error: 'Thermal Service Unavailable', details: error.message });
    }
});

app.post('/api/thermal/intervene', async (req, res) => {
    try {
        const response = await axios.post(`${THERMAL_URL}/intervene`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ error: 'Thermal Service Unavailable', details: error.message });
    }
});

// Proxy to Ecosystem Service
app.get('/api/ecosystem', async (req, res) => {
    try {
        const response = await axios.get(`${process.env.ECOSYSTEM_URL || 'http://localhost:3002'}/status`);
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ error: 'Ecosystem Service Unavailable', details: error.message });
    }
});

app.post('/api/ecosystem/intervene', async (req, res) => {
    try {
        const response = await axios.post(`${process.env.ECOSYSTEM_URL || 'http://localhost:3002'}/intervene`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(503).json({ error: 'Ecosystem Service Unavailable', details: error.message });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Gateway Service running on port ${PORT}`);
    });
}

module.exports = app;
