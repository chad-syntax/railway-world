import * as THREE from 'three';
import { WorldObject } from './WorldObject';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
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
} from '../../../lib/colors';

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

  private scene: THREE.Scene;
  private htmlRoot: HTMLElement;
  private populated: boolean = false;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private ground: THREE.Mesh;
  private gridHelper: THREE.GridHelper;
  private controls: PointerLockControls;
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    shift: false,
  };

  private SPEED = 30.0;
  private JUMP_SPEED = 15.0;

  constructor(options: WorldConstructorOptions) {
    const { htmlRoot, wsClient, railwayData } = options;

    this.htmlRoot = htmlRoot;
    this.wsClient = wsClient;
    this.railwayData = railwayData;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(WORLD_SKY_BLUE);
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    this.htmlRoot.appendChild(this.renderer.domElement);

    // Add basic lighting
    this.ambientLight = new THREE.AmbientLight(WORLD_LIGHT_GRAY, 1.2);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(UI_WHITE, 1.2);
    this.directionalLight.position.set(1, 1, 1);
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
    this.ground.position.y = 0;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Add a grid helper for visual reference
    this.gridHelper = new THREE.GridHelper(100, 100);
    this.scene.add(this.gridHelper);

    this.controls = new PointerLockControls(
      this.camera,
      this.renderer.domElement
    );

    // Set initial position
    this.camera.position.set(0, 2, 10);

    // Set up click listener to enable pointer lock
    document.addEventListener('click', () => {
      if (this.populated) {
        this.controls.lock();
      }
    });

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // Extend controls to add update method
    this.controls.update = this.updateControls;

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

    this.controls.update(delta);
    this.renderer.render(this.scene, this.camera);
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
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
        const requestBlock = new RequestBlock({
          service,
          log,
          world: this,
          position: {
            x: startPos.x,
            y: startPos.y,
            z: startPos.z,
          },
          endPosition: {
            x: endPos.x,
            y: endPos.y,
            z: endPos.z,
          },
        });

        this.addObject(requestBlock);
      }, index * 500); // Add 500ms delay between requests
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

    const services = this.railwayData.services;

    // Calculate layout parameters
    const spacing = 7.5; // Space between serviceStructures
    const startX = -((services.length - 1) * spacing) / 2; // Center the serviceStructures

    // Combined loop to create serviceStructures, volumes, globes and handle connections
    services.forEach((service: Service, index: number) => {
      const xPosition = startX + index * spacing;
      const serviceName = service.name;

      // Create serviceStructure with service information
      const serviceStructure = new ServiceStructure({
        name: serviceName,
        world: this,
        service,
        position: {
          x: xPosition,
          y: 0,
          z: 0,
        },
        deployment: service.latestDeployment,
      });

      // Add the serviceStructure to the world
      this.addObject(serviceStructure);

      // If the service has a volume, create a VolumeStructure
      if (service.volume) {
        const volumeX = xPosition + serviceStructure.width / 2 + 1.5; // Position to the right of the service

        // Create the VolumeStructure
        const volumeStructure = new VolumeStructure({
          name: `Volume-${service.volume.name}`,
          world: this,
          volume: service.volume,
          position: {
            x: volumeX,
            y: 0.5, // Half the height (1) to place it properly above ground
            z: 1,
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
        const globeX = xPosition;
        const globeZ = -10; // Place it behind the serviceStructure

        // Create the InternetGlobe
        const globe = new InternetGlobe({
          name: `Globe-${service.domains[0]}`,
          world: this,
          position: {
            x: globeX,
            y: 0,
            z: globeZ,
          },
          domains: service.domains,
          serviceStructureId: serviceStructure.id,
          serviceId: service.id,
        });

        // Add the globe to the world
        this.addObject(globe);

        // Create a connection between the globe and serviceStructure
        this.createConnectionBetween(globe, serviceStructure, {});
      }

      if (service.connections && service.connections.length > 0) {
        for (const targetServiceId of service.connections) {
          const targetServiceStructure =
            this.serviceStructures.get(targetServiceId);

          // Create a connection if the target serviceStructure exists
          if (targetServiceStructure) {
            this.createConnectionBetween(
              serviceStructure,
              targetServiceStructure,
              {
                color: WORLD_GRASS_GREEN, // Green for service-to-service connections
              }
            );
          }
        }
      }
    });

    this.populated = true;
  }

  private updateControls = (delta: number) => {
    if (!this.controls.isLocked) return;

    // Calculate movement direction
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;

    this.direction.z =
      Number(this.moveState.forward) - Number(this.moveState.backward);
    this.direction.x =
      Number(this.moveState.right) - Number(this.moveState.left);
    this.direction.y = Number(this.moveState.up) - Number(this.moveState.down);
    this.direction.normalize();

    if (this.moveState.shift) {
      this.SPEED = 5.0;
    } else {
      this.SPEED = 30.0;
    }

    if (this.moveState.shift) {
      this.JUMP_SPEED = 5.0;
    } else {
      this.JUMP_SPEED = 15.0;
    }

    // Apply movement in the direction the camera is facing
    if (this.moveState.forward || this.moveState.backward) {
      this.velocity.z = this.direction.z * this.SPEED * delta;
    }
    if (this.moveState.left || this.moveState.right) {
      this.velocity.x = this.direction.x * this.SPEED * delta;
    }
    if (this.moveState.up || this.moveState.down) {
      this.velocity.y = this.direction.y * this.JUMP_SPEED * delta;
    }

    // Move the camera
    this.controls.moveRight(this.velocity.x);
    this.controls.moveForward(this.velocity.z);
    this.camera.position.y += this.velocity.y;
  };

  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
        this.moveState.forward = true;
        break;
      case 'KeyS':
        this.moveState.backward = true;
        break;
      case 'KeyA':
        this.moveState.left = true;
        break;
      case 'KeyD':
        this.moveState.right = true;
        break;
      case 'Space':
        this.moveState.up = true;
        break;
      case 'ControlLeft':
      case 'ControlRight':
        this.moveState.down = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.moveState.shift = true;
        break;
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
        this.moveState.forward = false;
        break;
      case 'KeyS':
        this.moveState.backward = false;
        break;
      case 'KeyA':
        this.moveState.left = false;
        break;
      case 'KeyD':
        this.moveState.right = false;
        break;
      case 'Space':
        this.moveState.up = false;
        break;
      case 'ControlLeft':
      case 'ControlRight':
        this.moveState.down = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.moveState.shift = false;
        break;
    }
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
    // Calculate center points based on object type and position
    const getObjectCenterY = (obj: WorldObject) => {
      if (obj instanceof InternetGlobe) {
        // Globe is positioned at y=0 but its center should be at 0
        return 0;
      } else if (obj instanceof VolumeStructure) {
        // Volume is positioned at y=0.5, and its center should be at 0
        return 0;
      } else {
        // Service structure is positioned at y=0, center should be at height/2
        return (obj as any).height / 2;
      }
    };

    const startY = getObjectCenterY(startObject);
    const endY = getObjectCenterY(endObject);

    // Define connection points at the center of each object
    const startPoint: ConnectionPoint = {
      worldObject: startObject,
      localPosition: new THREE.Vector3(0, startY, 0),
    };

    const endPoint: ConnectionPoint = {
      worldObject: endObject,
      localPosition: new THREE.Vector3(0, endY, 0),
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
      lineRadius: options.lineRadius || 0.02,
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
}
