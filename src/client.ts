import { fetchRailwayData } from './lib/client/fetch-railway-data';
import { World } from './lib/client/three/World';

const $root = document.getElementById('root')!;
const $errorPanel = document.getElementById('error-panel')!;
const $loadingSpinner = document.getElementById('loading-spinner')!;

const run = async (railwayData: any) => {
  const world = new World({ htmlRoot: $root });

  world.populate(railwayData);

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

  await run(data);
}

// Start the application
main().catch(console.error);
