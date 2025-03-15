# Railway World

A 3D interactive visualization tool for Railway infrastructure. This application renders your Railway services as structures in a Minecraft-inspired world and visualizes network traffic between services in real-time.

## Features

- Interactive 3D world with first-person controls (WASD + mouse look, Space/Ctrl to fly)
- Visualization of Railway services as structures with distinct characteristics
- Real-time visualization of network traffic between services
- Centralized "Internet" globe representing external traffic
- GraphQL integration with Railway's API for fetching service data
- Client-server architecture for real-time updates

## Getting Started

### Prerequisites

- Node.js (v22+ recommended)
- A Railway account with API access
- Your Railway API token
- The project ID of the Railway project you want to visualize

### Installation

1. Clone this repository

```bash
git clone https://github.com/yourusername/railway-world.git
cd railway-world
```

2. Install dependencies

```bash
npm install
```

3. Copy the .env.example and set env vars

```bash
cp .env.example .env
```

```bash
RAILWAY_WORLD_TOKEN="your-railway-token"
RAILWAY_WORLD_PROJECT_ID="your-railway-project-id"
```

4. Start the development server (both backend and frontend)

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

5. Enter your Railway API token and project ID in the configuration panel

## Controls

- **W/A/S/D**: Move forward/left/backward/right
- **Mouse**: Look around
- **Space**: Fly up
- **Ctrl**: Fly down
- **Click**: Enable pointer lock (press ESC to exit)

## Architecture

The application consists of:

1. **Frontend Client**: Three.js-based 3D visualization
2. **Backend Server**: Fastify server that communicates with Railway's GraphQL API

### Project Structure

- `src/main.ts`: Frontend client entry point
- `src/server.ts`: Backend server entry point
- `src/lib/three/`: 3D visualization components
  - `World.ts`: Main Three.js scene management
  - `ServiceStructure.ts`: Service visualization as 3D structures
  - `InternetGlobe.ts`: Central globe representing external traffic
- `src/lib/graphql/`: Railway API integration
- `src/service-structures.ts`: Service visualization logic

## Development

### Running in Development Mode

```bash
# Start both frontend and backend in development mode
npm run dev

# Start only the frontend
npm run dev:client

# Start only the backend
npm run dev:server
```

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory. To run the production server:

```bash
npm start
```

## License

MIT
