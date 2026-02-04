const express = require('express');
const cors = require('cors');
const redis = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Simulation State
let state = {
    oxygen: 15.0, // Percentage (Earth is ~21%)
    co2: 95.0,    // Percentage (Mars is ~95%)
    nitrogen: 2.7,// Percentage (Mars is ~2.7%)
    pressure: 0.6 // kPa (Mars is ~0.6, Earth is 101.3)
};

// Redis Client for Pub/Sub (Optional for now, but good for future)
// const client = redis.createClient({ url: process.env.REDIS_URL });

// Simulation Loop
setInterval(() => {
    // Natural degradation or stabilization logic could go here
    // For now, it just holds state unless intervened
}, 1000);

app.get('/status', (req, res) => {
    res.json(state);
});

app.post('/intervene', (req, res) => {
    const { action } = req.body;

    // Futuristic Logic: different actions affect gases differently
    if (action === 'DEPLOY_ALGAE') {
        state.oxygen += 0.5;
        state.co2 -= 0.4;
    } else if (action === 'IMPORT_ICE') {
        state.pressure += 0.5;
        state.nitrogen += 0.1;
    } else if (action === 'RELEASE_GHG') {
        state.co2 += 1.0;
        state.pressure += 0.2;
    }

    // Clamp values
    state.oxygen = Math.min(100, Math.max(0, state.oxygen));
    state.co2 = Math.min(100, Math.max(0, state.co2));

    res.json({ message: 'Intervention successful', newState: state });
});

app.listen(PORT, () => {
    console.log(`Atmosphere Service running on port ${PORT}`);
});
