[![Follow on X](https://img.shields.io/twitter/follow/chad_syntax?style=social&logo=twitter)](https://x.com/chad_syntax)

# Railway World

A 3D interactive visualization tool for Railway infrastructure. This application renders your Railway services as structures in a Minecraft-inspired world and visualizes network traffic between services in real-time.

This is a quick side project to re-familiarize myself with threejs and web graphics. I do not plan on maintaining this or adding much to it. In fact if I were to make this for real, I would probably try using godot.

## Features

- Interactive 3D world with first-person controls (WASD + mouse look, Space/Ctrl to fly)
- Visualization of Railway services as structures with distinct characteristics
- Real-time visualization of network traffic between services
- Centralized "Internet" globe representing external traffic
- GraphQL integration with Railway's API for fetching service data
- Client-server architecture for real-time updates

## Host your own Railway World... on Railway!

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/BcMvgp?referralCode=chad)

### Required Environment Variables

- `RAILWAY_WORLD_TOKEN` - Your Railway API token [token docs](https://docs.railway.com/guides/public-api#creating-a-token)
- `RAILWAY_WORLD_PROJECT_ID` - The ID of the Railway project you want to visualize (copy from project settings)

## Getting Started

### Prerequisites

- Node.js (v22.14.0 recommended)
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
MOCK_DATA="false"
```

The `MOCK_DATA` environment variable can be set to `"true"` to use mock data instead of making real API calls to Railway. This is useful for development and testing without hitting the Railway APIs.

4. Start the development server (both backend and frontend)

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

5. The 3D visualization will load automatically using your configured environment variables

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
3. **Railway GraphQL APIs**: Outside API dependency for fetching Railway App data

### Project Structure

- `src/client.ts`: Frontend client entry point
- `src/server.ts`: Backend server entry point
- `src/lib/`: Core library code
  - `types.ts`: TypeScript type definitions
  - `constants.ts`: Application constants
  - `utils.ts`: Shared utility functions
  - `colors.ts`: Color definitions for visualization
  - `mock-data.ts`: Mock data for development/testing
  - `client/`: Frontend-specific code
    - `three/`: Three.js visualization components
      - `World.ts`: Main Three.js scene management
      - `ServiceStructure.ts`: Service visualization as 3D structures
      - `InternetGlobe.ts`: Central globe representing external traffic
      - `RequestBlock.ts`: Visualization of network requests
      - `ConnectionLine.ts`: Network connection visualization
      - `VolumeStructure.ts`: Volume-based service visualization
      - `WorldObject.ts`: Base class for all 3D objects
      - `Billboard.ts`: Base class for billboard text overlays
      - `AuthorBillboard.ts`: Author attribution display
      - `ProjectBillboard.ts`: Project information display
      - `Player.ts`: First-person player controls and camera
    - `websocket.ts`: WebSocket client for real-time updates
    - `fetch-railway-data.ts`: Railway API data fetching
  - `server/`: Backend-specific code
    - `graphql/`: Railway GraphQL API integration
    - `handlers/`: API route handlers
    - `LiveDataService.ts`: Service for managing live data updates

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
