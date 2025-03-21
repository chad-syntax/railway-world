import { fetchRailwayData } from './lib/client/fetch-railway-data';
import { World } from './lib/client/three/World';
import { WebSocketClient } from './lib/client/websocket';
import { RailwayData } from './lib/types';

const $root = document.getElementById('root')!;
const $errorPanel = document.getElementById('error-panel')!;
const $loadingSpinner = document.getElementById('loading-spinner')!;

const run = (railwayData: RailwayData) => {
  const wsClient = new WebSocketClient();

  const world = new World({ htmlRoot: $root, wsClient, railwayData });

  // world.populate(railwayData);

  // Start animation loop
  let prevTime = performance.now();

  const animate = () => {
    const currentTime = performance.now();
    const delta = (currentTime - prevTime) / 1000; // Convert to seconds
    prevTime = currentTime;

    world.renderLoop(delta);
    requestAnimationFrame(animate);
  };

  animate();
};

async function main() {
  if (!$root) {
    throw new Error('HTML root element not found');
  }

  const { data, error } = await fetchRailwayData();

  $loadingSpinner.classList.add('hidden');

  if (error) {
    console.error(error);
    $errorPanel.classList.remove('hidden');
    return;
  }

  if (!data) {
    console.error('No data received');
    $errorPanel.classList.remove('hidden');
    return;
  }

  run(data);
}

// Start the application
main().catch(console.error);
