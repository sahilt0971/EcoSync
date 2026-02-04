from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
import math
import random

app = FastAPI()

# Simulation State
class SimulationState(BaseModel):
    temperature: float # Kelvin
    surface_albedo: float # 0 to 1
    solar_insolation: float # W/m^2

state = SimulationState(
    temperature=210.0, # ~ -63C (Mars average)
    surface_albedo=0.25, # Mars reddish dust
    solar_insolation=590.0 # Mars average
)

@app.get("/status")
def get_status():
    # Fluctuate slightly to simulate real sensors
    fluctuation = random.uniform(-0.5, 0.5)
    return {
        "temperature": round(state.temperature + fluctuation, 2),
        "temperature_c": round(state.temperature - 273.15 + fluctuation, 2),
        "albedo": state.surface_albedo,
        "solar_insolation": state.solar_insolation
    }

class Intervention(BaseModel):
    action: str

@app.post("/intervene")
def intervene(data: Intervention):
    global state
    
    if data.action == "DEPLOY_MIRRORS":
        # Orbital mirrors increase solar insolation
        state.solar_insolation += 15.0
        state.temperature += 2.5
    elif data.action == "RELEASE_GHG":
        # GHGs trap heat (simplified)
        state.temperature += 1.2
    elif data.action == "IMPORT_ICE":
        # Ice initially cools, but adds thermal mass (simplified)
        state.temperature -= 0.5
        state.surface_albedo -= 0.01 # Darker wet surface
    
    return {"message": "Intervention applied", "new_state": state}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
