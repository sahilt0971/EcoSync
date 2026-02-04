import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const GATEWAY_URL = 'http://localhost:3000/api';

function App() {
    const [atmosphere, setAtmosphere] = useState(null);
    const [thermal, setThermal] = useState(null);
    const [ecosystem, setEcosystem] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [atmRes, thermRes, ecoRes] = await Promise.all([
                axios.get(`${GATEWAY_URL}/atmosphere`),
                axios.get(`${GATEWAY_URL}/thermal`),
                axios.get(`${GATEWAY_URL}/ecosystem`)
            ]);
            setAtmosphere(atmRes.data);
            setThermal(thermRes.data);
            setEcosystem(ecoRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleIntervention = async (service, action) => {
        try {
            await axios.post(`${GATEWAY_URL}/${service}/intervene`, { action });
            fetchData(); // Immediate refresh
        } catch (error) {
            console.error("Intervention failed", error);
        }
    };

    // Determine Planet Color based on state
    const getPlanetStyle = () => {
        if (!atmosphere || !ecosystem) return { backgroundColor: '#8B4513' }; // Rusty Red

        const green = ecosystem.plant_density * 2;
        const blue = ecosystem.water_level * 2;
        const red = Math.max(0, 139 - green - blue); // Reduce red as it gets greener/bluer

        return {
            background: `radial-gradient(circle at 30% 30%, rgb(${red + 40}, ${green + 40}, ${blue + 80}), rgb(${red}, ${green}, ${blue}))`,
            boxShadow: `0 0 ${atmosphere.oxygen / 2}px rgba(255, 255, 255, 0.2)`
        };
    };

    return (
        <div className="dashboard">
            <header>
                <h1>EcoSync <span className="subtitle">Planetary Terraforming Control</span></h1>
            </header>

            <main>
                <div className="planet-container">
                    <div className="planet" style={loading ? {} : getPlanetStyle()}>
                        {loading && <div className="loader">Scanning...</div>}
                    </div>
                    <div className="stats-overlay">
                        {thermal && <h2>{thermal.temperature_c}°C</h2>}
                        {atmosphere && <p>O2: {atmosphere.oxygen.toFixed(1)}%</p>}
                    </div>
                </div>

                <div className="controls-container">
                    <div className="panel">
                        <h3>Atmosphere</h3>
                        {atmosphere && (
                            <div className="stats">
                                <div>CO2: {atmosphere.co2.toFixed(1)}%</div>
                                <div>N2: {atmosphere.nitrogen.toFixed(1)}%</div>
                                <div>Pressure: {atmosphere.pressure.toFixed(2)} kPa</div>
                            </div>
                        )}
                        <div className="buttons">
                            <button onClick={() => handleIntervention('atmosphere', 'DEPLOY_ALGAE')}>Deploy Algae</button>
                            <button onClick={() => handleIntervention('atmosphere', 'RELEASE_GHG')}>Release GHGs</button>
                        </div>
                    </div>

                    <div className="panel">
                        <h3>Thermal</h3>
                        {thermal && (
                            <div className="stats">
                                <div>Insolation: {thermal.solar_insolation} W/m²</div>
                                <div>Albedo: {thermal.albedo.toFixed(2)}</div>
                            </div>
                        )}
                        <div className="buttons">
                            <button onClick={() => handleIntervention('thermal', 'DEPLOY_MIRRORS')}>Orbital Mirrors</button>
                        </div>
                    </div>

                    <div className="panel">
                        <h3>Ecosystem</h3>
                        {ecosystem && (
                            <div className="stats">
                                <div>Plants: {ecosystem.plant_density.toFixed(1)}%</div>
                                <div>Bacteria: {ecosystem.bacteria_level.toFixed(1)}%</div>
                                <div>Water: {ecosystem.water_level.toFixed(1)}%</div>
                            </div>
                        )}
                        <div className="buttons">
                            <button onClick={() => handleIntervention('ecosystem', 'SEED_BACTERIA')}>Seed Bacteria</button>
                            <button onClick={() => handleIntervention('ecosystem', 'PLANT_LICHEN')}>Plant Lichen</button>
                            <button onClick={() => handleIntervention('ecosystem', 'IMPORT_ICE')}>Import Ice</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
