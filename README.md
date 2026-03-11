# EcoSync 🌍

EcoSync is a full-stack, distributed microservices application designed as an interactive planetary terraforming dashboard. The project serves as a practical implementation and showcase of modern DevOps, CI/CD, and Cloud-Native methodologies, utilizing an automated pipeline culminating in GitOps-based deployment via ArgoCD.

## What is EcoSync?

At its core, EcoSync is a simulation dashboard where users manage the terraforming of a barren planet into a habitable world. The application visualizes essential planetary metrics in real-time, allowing users to execute "interventions" to balance three primary environmental systems:

1.  **Atmosphere:** Tracks Oxygen (O2), Carbon Dioxide (CO2), Nitrogen (N2), and atmospheric pressure. Users can intervene by deploying algae (to consume CO2 and produce O2) or releasing greenhouse gases (GHGs) to thicken the atmosphere.
2.  **Thermal:** Monitors the planet's solar insolation (incoming radiation), albedo (reflectivity), and average surface temperature. A lower albedo (darker surface) absorbs more heat. Users can use orbital mirrors to increase incoming solar radiation.
3.  **Ecosystem:** Tracks plant density, bacteria levels, and liquid water levels. Users can seed bacteria, plant lichen, or import ice (water) to build the biosphere.

## How it Works

The application operates on an event-driven microservices architecture:

1.  **The User Interface (React.js):** The frontend continuously polls the API Gateway every second to fetch the current state of the planet from the backend services. As the metrics change, the visual representation of the planet dynamically updates its color—shifting from a rusty red to a lush blue and green, complete with an atmospheric glow based on the oxygen levels.
2.  **Interventions:** When a user clicks a button (e.g., "Deploy Algae"), the frontend sends a POST request to the API Gateway.
3.  **The API Gateway (Node.js):** Routes the intervention request to the corresponding domain service.
4.  **Domain Services:**
    *   **Ecosystem & Atmosphere (Node.js/Express):** Process biological and atmospheric changes.
    *   **Thermal Processing (Python):** Handles complex temperature and radiation calculations.
    These services update the planet's state, which is reflected in the next frontend data fetch.

## Architecture & Technology Stack

*   **Frontend Interface:** Real-time terraforming control dashboard developed in React.js (Vite).
*   **Backend Services:** A polyglot microservices architecture comprising the API Gateway, Ecosystem Service, and Atmosphere Service (Node.js/Express) alongside a specialized Thermal Processing Service (Python).
*   **Infrastructure & Orchestration:** Fully containerized via Docker multi-stage builds, orchestrated with Kubernetes, and managed through GitOps principles.

## CI/CD Pipeline & GitOps Workflow

The project implements a comprehensive Jenkins CI/CD pipeline to ensure code quality, security, and consistent deployments:

1.  **Automated Testing:** Integration of Jest (Node.js) and Pytest (Python) paired with test coverage reporting.
2.  **Code Quality & Security Assurance:**
    *   Static analysis using SonarQube integrated with stringent Quality Gates.
    *   Container image vulnerability scanning utilizing Trivy to identify High/Critical severity issues.
3.  **Artifact Management:** Automated build and push operations to DockerHub with dynamic image tagging.
4.  **Continuous Deployment (ArgoCD):**
    *   The Jenkins pipeline automatically updates image tags within the declarative Kubernetes manifests (`k8s/deployments.yaml`) hosted in the GitHub repository.
    *   ArgoCD continuously monitors the repository for configuration drift, automatically synchronizing and deploying updated microservice images to the Kubernetes environment.
5.  **Traffic Routing:** Leveraging a Kubernetes NGINX Ingress Controller for seamless traffic management between the React client and the gateway.

## Local Execution

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Docker & Docker Compose
- A local Kubernetes cluster (e.g., Minikube, Kind) configured with an Ingress controller
- ArgoCD deployed within the cluster

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahilt0971/EcoSync.git
   cd EcoSync
   ```

2. **Local Development (Monorepo setup)**
   Use the provided npm scripts in the root directory to initiate the Node.js services:
   ```bash
   npm install
   npm run dev:gateway
   npm run dev:atmosphere
   npm run dev:web
   ```
   *(Note: The Python Thermal service requires an independent virtual environment setup within `services/thermal`)*

3. **Kubernetes Deployment (via ArgoCD)**
   Apply the initial manifest structures to your cluster and configure ArgoCD to monitor this repository's `k8s/` directory for automated synchronization.
