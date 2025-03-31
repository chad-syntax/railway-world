import * as THREE from 'three';
import { WorldObject } from './WorldObject';
import { ServiceStructure } from './ServiceStructure';
import { InternetGlobe } from './InternetGlobe';
import { ConnectionLine, ConnectionPoint } from './ConnectionLine';
import {
  RailwayData,
  Service,
  WebSocketLatestDeploymentsEvent,
  WebSocketLogsEvent,
} from '../../types';
import { VolumeStructure } from './VolumeStructure';
import { ProjectBillboard } from './ProjectBillboard';
import { AuthorBillboard } from './AuthorBillboard';
import { HttpLog } from '../../types';
import { WebSocketClient } from '../websocket';
import { RequestBlock } from './RequestBlock';
import {
  WORLD_SKY_BLUE,
  WORLD_LIGHT_GRAY,
  UI_WHITE,
  WORLD_GRASS_GREEN,
  WORLD_ORANGE,
  CONNECTION_BLUE,
  VOLUME_YELLOW,
} from '../../../lib/colors';
import { Player } from './Player';

type WorldConstructorOptions = {
  htmlRoot: HTMLElement;
  wsClient: WebSocketClient;
  railwayData: RailwayData;
};

export class World {
  public objects: Map<string, WorldObject> = new Map();
  public wsClient: WebSocketClient;
  public railwayData: RailwayData;
  public serviceStructures: Map<string, ServiceStructure> = new Map();
  public volumes: Map<string, VolumeStructure> = new Map();
  public globes: Map<string, InternetGlobe> = new Map();
  public requestBlocks: Map<string, RequestBlock> = new Map();
  public populated: boolean = false;
  public renderer: THREE.WebGLRenderer;

  private player: Player;
  private scene: THREE.Scene;
  private htmlRoot: HTMLElement;

  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private ground: THREE.Mesh;
  private gridHelper: THREE.GridHelper;
  private requestBlockSpawnOffset = 0;

  constructor(options: WorldConstructorOptions) {
    const { htmlRoot, wsClient, railwayData } = options;

    this.htmlRoot = htmlRoot;
    this.wsClient = wsClient;
    this.railwayData = railwayData;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(WORLD_SKY_BLUE);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    this.htmlRoot.appendChild(this.renderer.domElement);

    // Add basic lighting
    this.ambientLight = new THREE.AmbientLight(WORLD_LIGHT_GRAY, 1.2);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(UI_WHITE, 1.2);
    this.directionalLight.position.set(1, 10, 1);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.scene.add(this.directionalLight);

    // Create a ground plane
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({
        color: WORLD_GRASS_GREEN, // Grass green color
        side: THREE.DoubleSide,
      })
    );

    this.ground.rotation.x = Math.PI / 2;
    this.ground.position.y = -0.01;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Add a grid helper for visual reference
    this.gridHelper = new THREE.GridHelper(100, 100);
    this.scene.add(this.gridHelper);

    this.player = new Player({ world: this });

    this.addObject(this.player);

    // Handle window resize
    window.addEventListener('resize', this.onResize);

    this.wsClient.onMessage('logs', this.handleLogs);
    this.wsClient.onMessage('latestDeployments', this.handleLatestDeployments);

    this.populate();
  }

  private handleLogs = (event: WebSocketLogsEvent) => {
    const targetService = this.railwayData.services.find(
      (service) => service.latestDeployment.id === event.deploymentId
    );

    if (!targetService) {
      console.error('Service not found for logs', event.deploymentId);
      return;
    }

    this.populateRequest(targetService, event.logs);
  };

  private handleLatestDeployments = (
    event: WebSocketLatestDeploymentsEvent
  ) => {
    event.nodes.forEach((node) => {
      const service = this.railwayData.services.find(
        (service) => service.id === node.serviceId
      );
      if (service) {
        service.latestDeployment = node.latestDeployment;
      }
    });
  };

  public addObject(object: WorldObject) {
    this.scene.add(object.group);
    this.objects.set(object.id, object);
    // determine the type of the object and add it to the appropriate map
    if (object instanceof ServiceStructure) {
      this.serviceStructures.set(object.service.id, object);
    }
    if (object instanceof VolumeStructure) {
      this.volumes.set(object.volume.id, object);
    }
    if (object instanceof InternetGlobe) {
      this.globes.set(object.serviceId, object);
      object.domains.forEach((domain) => {
        this.globes.set(domain, object);
      });
    }
    if (object instanceof RequestBlock) {
      this.requestBlocks.set(object.service.id, object);
    }
  }

  public removeObject(object: WorldObject) {
    this.scene.remove(object.group);
    this.objects.delete(object.id);
    // determine the type of the object and remove it from the appropriate map
    if (object instanceof ServiceStructure) {
      this.serviceStructures.delete(object.service.id);
    }
    if (object instanceof VolumeStructure) {
      this.volumes.delete(object.volume.id);
    }
    if (object instanceof InternetGlobe) {
      this.globes.delete(object.serviceId);
      object.domains.forEach((domain) => {
        this.globes.delete(domain);
      });
    }
    if (object instanceof RequestBlock) {
      this.requestBlocks.delete(object.service.id);
    }
  }

  public renderLoop(delta: number) {
    this.objects.forEach((object) => {
      object.onUpdate(delta);
    });

    this.renderer.render(this.scene, this.player.camera);
  }

  private onResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  public populateRequest(service: Service, logs: HttpLog[]) {
    const serviceStructure = this.serviceStructures.get(service.id);

    if (!serviceStructure) {
      console.error('Service structure not found for service', service.name);
      return;
    }

    const connectionLine = Array.from(this.objects.values()).find(
      (object) =>
        object instanceof ConnectionLine &&
        object.endPoint.worldObject.id === serviceStructure.id &&
        object.startPoint.worldObject instanceof InternetGlobe
    );

    if (!connectionLine) {
      console.error(
        'Connection line not found for service structure',
        serviceStructure.id
      );
      return;
    }

    // Extract path coordinates from connection line
    const startPos = new THREE.Vector3();
    const endPos = new THREE.Vector3();

    // Cast to ConnectionLine type to access the methods
    const connLine = connectionLine as ConnectionLine;

    // Get the positions
    connLine.getStartPosition(startPos);
    connLine.getEndPosition(endPos);

    logs.forEach((log, index) => {
      setTimeout(() => {
        // Calculate angle in radians (increment by 45 degrees / π/4 radians each time)
        const angle = (this.requestBlockSpawnOffset * Math.PI) / 4;

        // Calculate position on circle with radius 1
        const offsetX = Math.cos(angle) * 0.75;
        const offsetZ = Math.sin(angle) * 0.75;

        const requestBlock = new RequestBlock({
          service,
          log,
          world: this,
          position: {
            x: startPos.x + offsetX,
            y: startPos.y + 1,
            z: startPos.z + offsetZ,
          },
          endPosition: {
            x: endPos.x + offsetX,
            y: endPos.y,
            z: endPos.z + offsetZ,
          },
        });

        this.addObject(requestBlock);

        // Increment offset for next request (reset after 8 to start over)
        this.requestBlockSpawnOffset = (this.requestBlockSpawnOffset + 1) % 8;
      }, index * 500);
    });
  }

  public populate() {
    console.log(JSON.stringify(this.railwayData, null, 2));

    // Create the billboard
    const billboard = new ProjectBillboard({
      name: 'MainBillboard',
      world: this,
      position: {
        x: 0,
        y: 20, // 20 units up in the sky
        z: -50, // At the edge of the ground area (which is 100x100)
      },
      projectName: this.railwayData.projectName,
      updatedAt: this.railwayData.updatedAt,
      team: this.railwayData.team,
    });

    this.addObject(billboard);

    const authorBillboard = new AuthorBillboard({
      name: 'AuthorBillboard',
      world: this,
      position: {
        x: billboard.BILLBOARD_WIDTH / 2 + 6,
        y: 20, // 20 units up in the sky
        z: -50, // At the edge of the ground area (which is 100x100)
      },
    });

    this.addObject(authorBillboard);

    const servicePositions = this.determineServicePositions();

    // Combined loop to create serviceStructures, volumes, globes and handle connections
    servicePositions.forEach((servicePosition) => {
      const { service, x, z } = servicePosition;

      const serviceName = service.name;

      // Create serviceStructure with service information
      const serviceStructure = new ServiceStructure({
        name: serviceName,
        world: this,
        service,
        position: {
          x,
          y: 0,
          z,
        },
        deployment: service.latestDeployment,
      });

      // Add the serviceStructure to the world
      this.addObject(serviceStructure);

      // If the service has a volume, create a VolumeStructure
      if (service.volume) {
        const volumeX = x + serviceStructure.width / 2 - 0.5; // Position above back right corner of serviceStructure
        const volumeY = serviceStructure.height + 3;
        const volumeZ = z - 1;

        // Create the VolumeStructure
        const volumeStructure = new VolumeStructure({
          name: `Volume-${service.volume.name}`,
          world: this,
          volume: service.volume,
          position: {
            x: volumeX,
            y: volumeY,
            z: volumeZ,
          },
        });

        // Add the volume to the world
        this.addObject(volumeStructure);
        // Create a connection between the service and volume
        this.createConnectionBetween(serviceStructure, volumeStructure, {
          color: WORLD_ORANGE, // Orange for service-to-volume connections
        });
      }

      // If we have domains, create a globe for them
      if (service.domains && service.domains.length > 0) {
        const globeX = x;
        const globeZ = z;
        const globeY = 20;

        // Create the InternetGlobe
        const globe = new InternetGlobe({
          name: `Globe-${service.domains[0]}`,
          world: this,
          position: {
            x: globeX,
            y: globeY,
            z: globeZ,
          },
          domains: service.domains,
          serviceStructureId: serviceStructure.id,
          serviceId: service.id,
        });

        // Add the globe to the world
        this.addObject(globe);

        // Create a connection between the globe and serviceStructure
        this.createConnectionBetween(globe, serviceStructure);
      }
    });

    this.railwayData.services.forEach((service) => {
      if (service.connections && service.connections.length > 0) {
        for (const targetServiceId of service.connections) {
          const startPointObject = this.serviceStructures.get(service.id);
          const endPointObject = this.serviceStructures.get(targetServiceId);

          // Create a connection if the target serviceStructure exists
          if (startPointObject && endPointObject) {
            this.createConnectionBetween(startPointObject, endPointObject, {
              color: VOLUME_YELLOW, // Green for service-to-service connections
            });
          }
        }
      }
    });

    this.populated = true;
  }

  private determineServicePositions = () => {
    const MIN_DISTANCE = 6; // 3 units structure + 3 units spacing
    const occupiedPositions = new Set<string>();
    const servicePositions: Array<{ service: Service; x: number; z: number }> =
      [];

    // Helper to check if a position is available
    const isPositionAvailable = (x: number, z: number): boolean => {
      const key = `${Math.round(x)},${Math.round(z)}`;
      return !occupiedPositions.has(key);
    };

    // Helper to mark a position as occupied
    const markPosition = (x: number, z: number) => {
      const key = `${Math.round(x)},${Math.round(z)}`;
      occupiedPositions.add(key);
    };

    // Calculate number of connections for each service
    const connectionCounts = new Map<string, number>();
    this.railwayData.services.forEach((service) => {
      connectionCounts.set(service.id, (service.connections || []).length);
    });

    // Sort services by connection count (hubs first)
    const sortedServices = [...this.railwayData.services].sort((a, b) => {
      return (
        (connectionCounts.get(b.id) || 0) - (connectionCounts.get(a.id) || 0)
      );
    });

    // Place first hub at origin
    if (sortedServices.length > 0) {
      servicePositions.push({
        service: sortedServices[0],
        x: 0,
        z: 0,
      });
      markPosition(0, 0);
    }

    // Helper to get available position around a center point
    const findAvailablePosition = (
      centerX: number,
      centerZ: number,
      radius: number
    ): { x: number; z: number } | null => {
      // Define positions in grid pattern - cardinal directions first, then diagonals
      const positions = [
        { x: centerX + radius, z: centerZ }, // right
        { x: centerX, z: centerZ + radius }, // down
        { x: centerX - radius, z: centerZ }, // left
        { x: centerX, z: centerZ - radius }, // up
        { x: centerX + radius, z: centerZ + radius }, // right-down
        { x: centerX - radius, z: centerZ + radius }, // left-down
        { x: centerX - radius, z: centerZ - radius }, // left-up
        { x: centerX + radius, z: centerZ - radius }, // right-up
      ];

      for (const pos of positions) {
        if (isPositionAvailable(pos.x, pos.z)) {
          return pos;
        }
      }
      return null;
    };

    // Place remaining services
    for (let i = 1; i < sortedServices.length; i++) {
      const service = sortedServices[i];
      const connections = service.connections || [];

      // Find connected services that are already placed
      const connectedPositions = connections
        .map((id) => servicePositions.find((pos) => pos.service.id === id))
        .filter((pos) => pos !== undefined);

      if (connectedPositions.length > 0) {
        // Calculate average position of connected services
        const avgX =
          connectedPositions.reduce((sum, pos) => sum + pos!.x, 0) /
          connectedPositions.length;
        const avgZ =
          connectedPositions.reduce((sum, pos) => sum + pos!.z, 0) /
          connectedPositions.length;

        // Try to find position around this average point
        let radius = MIN_DISTANCE;
        let position = null;

        while (!position && radius < 50) {
          position = findAvailablePosition(avgX, avgZ, radius);
          radius += MIN_DISTANCE;
        }

        if (position) {
          servicePositions.push({
            service,
            x: position.x,
            z: position.z,
          });
          markPosition(position.x, position.z);
        }
      } else {
        // No connections, place in next available position from origin
        let radius = MIN_DISTANCE;
        let position = null;

        while (!position && radius < 50) {
          position = findAvailablePosition(0, 0, radius);
          radius += MIN_DISTANCE;
        }

        if (position) {
          servicePositions.push({
            service,
            x: position.x,
            z: position.z,
          });
          markPosition(position.x, position.z);
        }
      }
    }

    return servicePositions;
  };

  // New method to create connections between world objects
  private createConnectionBetween(
    startObject: WorldObject,
    endObject: WorldObject,
    options: {
      lineRadius?: number;
      color?: number;
    } = {}
  ): ConnectionLine {
    const lineRadius = options.lineRadius || 0.02;

    // Define connection points at the center of each object
    const startPoint: ConnectionPoint = {
      worldObject: startObject,
      localPosition: new THREE.Vector3(0, lineRadius, 0),
    };

    const endPoint: ConnectionPoint = {
      worldObject: endObject,
      localPosition: new THREE.Vector3(0, lineRadius, 0),
    };

    // Create a unique name for the connection
    const connectionName = `connection-${startObject.id}-to-${endObject.id}`;

    // Create the connection line as a WorldObject
    const connection = new ConnectionLine({
      name: connectionName,
      world: this,
      position: { x: 0, y: 0, z: 0 }, // Position doesn't matter - it's determined by connected objects
      startPoint,
      endPoint,
      lineRadius,
      color: options.color || CONNECTION_BLUE,
    });

    // Add the connection to the world's objects
    this.addObject(connection);

    return connection;
  }

  // Public method to connect two serviceStructures
  public connectServiceStructures(
    serviceStructureA: ServiceStructure,
    serviceStructureB: ServiceStructure,
    options: {
      lineRadius?: number;
      color?: number;
    } = {}
  ): ConnectionLine {
    return this.createConnectionBetween(serviceStructureA, serviceStructureB, {
      lineRadius: options.lineRadius || 0.02,
      color: options.color || WORLD_GRASS_GREEN, // Default green for serviceStructure connections
    });
  }

  // Add getter for max anisotropy
  public get maxAnisotropy(): number {
    return this.renderer.capabilities.getMaxAnisotropy();
  }

  // Add getter for scene
  public getScene(): THREE.Scene {
    return this.scene;
  }
}
