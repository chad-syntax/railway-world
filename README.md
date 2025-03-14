# Railway World

A 3D visualization tool for Railway infrastructure. This application renders your Railway services as buildings in a Minecraft-like world and visualizes requests between services in real-time.

## Features

- First-person navigation (WASD + mouse look, Space/Ctrl to fly)
- 3D visualization of your Railway services as buildings
- Real-time visualization of requests between services
- GraphQL integration with Railway's API

## Getting Started

### Prerequisites

- Node.js (v16+)
- A Railway account with API access

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

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Controls

- **W/A/S/D**: Move forward/left/backward/right
- **Mouse**: Look around
- **Space**: Fly up
- **Ctrl**: Fly down
- **Click**: Enable pointer lock (press ESC to exit)

## Development

### Project Structure

- `src/main.ts`: Main application entry point
- `src/world.ts`: Three.js scene setup
- `src/controls.ts`: First-person controls
- `src/api.ts`: Railway API integration
- `src/buildings.ts`: Service visualization

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Connecting to Railway

To connect to your Railway infrastructure, you'll need to provide an API token in a `.env` file:

```
VITE_RAILWAY_API_TOKEN=your_api_token_here
```

## License

MIT