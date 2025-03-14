import { getConfig, setConfig } from './lib/config';
import { fetchRailwayData } from './lib/fetch-railway-data';
import { World } from './lib/three/World';

const $root = document.getElementById('root')!;
const $configPanel = document.getElementById('config-panel')!;
const $configPanelForm = document.getElementById(
  'config-panel-form'
)! as HTMLFormElement;
const $configPanelRailwayToken = document.getElementById(
  'railway-token'
) as HTMLInputElement;
const $configPanelRailwayProjectId = document.getElementById(
  'railway-project-id'
) as HTMLInputElement;

const run = async (railwayData: any) => {
  const world = new World({ htmlRoot: $root });

  const loadingSpinner = document.getElementById('loading-spinner')!;

  loadingSpinner.classList.add('hidden');

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

  const config = getConfig();

  $configPanelForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const railwayToken = $configPanelRailwayToken.value;
    const railwayProjectId = $configPanelRailwayProjectId.value;

    setConfig({
      railwayToken,
      railwayProjectId,
    });

    try {
      $configPanel.classList.add('hidden');
      const { data, errors } = await fetchRailwayData(
        railwayToken,
        railwayProjectId
      );

      if (errors) {
        throw new Error(errors[0].message);
      }

      await run(data);
    } catch (error) {
      console.error(error);
      alert('Invalid railway token or project id');
    }
  });

  if (!config.railwayToken || !config.railwayProjectId) {
    $configPanel.classList.remove('hidden');
    $configPanelRailwayToken.value = config.railwayToken || '';
    $configPanelRailwayProjectId.value = config.railwayProjectId || '';
  } else {
    const { data, errors } = await fetchRailwayData(
      config.railwayToken,
      config.railwayProjectId
    );

    if (errors) {
      // throw new Error(errors[0].message);
      alert(`Error fetching railway data: ${errors[0].message}`);
      $configPanel.classList.remove('hidden');
      $configPanelRailwayToken.value = config.railwayToken;
      $configPanelRailwayProjectId.value = config.railwayProjectId;
    }

    await run(data);
  }
}

// Start the application
main().catch(console.error);
