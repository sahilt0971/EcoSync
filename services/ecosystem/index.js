const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

let state = {
    plant_density: 0.0, // Percentage
    bacteria_level: 0.0,
    water_level: 0.0
};

app.get('/status', (req, res) => {
    res.json(state);
});

app.post('/intervene', (req, res) => {
    const { action } = req.body;

    if (action === 'SEED_BACTERIA') {
        state.bacteria_level += 5.0;
    } else if (action === 'PLANT_LICHEN') {
        if (state.bacteria_level > 10) {
            state.plant_density += 2.0;
        }
    } else if (action === 'IMPORT_ICE') {
        state.water_level += 5.0;
    }

    state.plant_density = Math.min(100, state.plant_density);
    state.bacteria_level = Math.min(100, state.bacteria_level);
    state.water_level = Math.min(100, state.water_level);

    res.json({ message: 'Ecosystem updated', newState: state });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Ecosystem Service running on port ${PORT}`);
    });
}

module.exports = app;
