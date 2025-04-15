import * as THREE from 'three';
import { WorldObject } from './WorldObject';
import { ServiceStructure } from './ServiceStructure';
import { InternetGlobe } from './InternetGlobe';
import { ConnectionLine, ConnectionPoint } from './ConnectionLine';
import {
  RailwayData,
  Service,
  WebSocketLatestDeploymentsEvent,
  WebSocketHttpLogsEvent,
  WebSocketDeployLogsEvent,
} from '../../types';
import { VolumeStructure } from './VolumeStructure';
import { ProjectBillboard } from './ProjectBillboard';
import { AuthorBillboard } from './AuthorBillboard';
import { HttpLog } from '../../types';
import { WebSocketClient } from '../websocket';
import { RequestBlock } from './RequestBlock';
import {
  SKY_BLUE,
  GRAY_2,
  WHITE,
  GREEN,
  BLUE,
  YELLOW,
} from '../../../lib/colors';
import { Player } from './Player';
import {
  determineServicePositions,
  ServicePosition,
} from '../determine-service-positions';

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
  public player: Player;

  private scene: THREE.Scene;
  private htmlRoot: HTMLElement;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private ground: THREE.Mesh;
  // private gridHelper: THREE.GridHelper;
  private requestBlockSpawnOffset = 0;

  constructor(options: WorldConstructorOptions) {
    const { htmlRoot, wsClient, railwayData } = options;

    this.htmlRoot = htmlRoot;
    this.wsClient = wsClient;
    this.railwayData = railwayData;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SKY_BLUE);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    this.htmlRoot.appendChild(this.renderer.domElement);

    // Add basic lighting
    this.ambientLight = new THREE.AmbientLight(GRAY_2, 1.2);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(WHITE, 1.2);
    this.directionalLight.position.set(1, 10, 1);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 50;
    this.scene.add(this.directionalLight);

    const groundTexture = new THREE.TextureLoader().load('/grass.jpg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(100, 100); // Repeat 100 times in both directions

    // Create a ground plane
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({
        map: groundTexture,
        color: GREEN, // Grass green color
        side: THREE.DoubleSide,
      })
    );

    this.ground.rotation.x = Math.PI / 2;
    this.ground.position.y = -0.01;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Add a grid helper for visual reference
    // this.gridHelper = new THREE.GridHelper(100, 100);
    // this.scene.add(this.gridHelper);

    this.player = new Player({ world: this });

    this.addObject(this.player);

    // Handle window resize
    window.addEventListener('resize', this.onResize);

    this.wsClient.onMessage('httpLogs', this.handleLogs);
    this.wsClient.onMessage('latestDeployments', this.handleLatestDeployments);

    this.populate();
  }

  private handleLogs = (event: WebSocketHttpLogsEvent) => {
    const targetService = this.railwayData.services.find(
      (service) => service.latestDeployment.id === event.deploymentId
    );

    if (!targetService) {
      console.error('Service not found for logs', event.deploymentId);
      return;
    }

    this.populateRequest(targetService, event.logs);
  };

  private handleDeployLogs = (event: WebSocketDeployLogsEvent) => {
    console.log('deployLogs', event);
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

    this.populateBillboards();

    const servicePositions = determineServicePositions(
      this.railwayData.services
    );

    this.populateServiceStructures(servicePositions);

    this.populateConnections(this.railwayData.services);

    this.populated = true;
  }

  private populateBillboards() {
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
  }

  private populateServiceStructures(servicePositions: ServicePosition[]) {
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
          y: 0.01,
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
          color: YELLOW, // Yellow for service-to-volume connections
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
  }

  private populateConnections(services: Service[]) {
    services.forEach((service) => {
      if (service.connections && service.connections.length > 0) {
        for (const targetServiceId of service.connections) {
          const startPointObject = this.serviceStructures.get(service.id);
          const endPointObject = this.serviceStructures.get(targetServiceId);

          // Create a connection if the target serviceStructure exists
          if (startPointObject && endPointObject) {
            this.createConnectionBetween(startPointObject, endPointObject, {
              color: BLUE, // Blue for service-to-service connections
            });
          }
        }
      }
    });
  }

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
      color: options.color || BLUE,
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
      color: options.color || GREEN, // Default green for serviceStructure connections
    });
  }

  // Add getter for scene
  public getScene(): THREE.Scene {
    return this.scene;
  }

  public unlockControls() {
    this.player.controls.unlock();
  }
}
