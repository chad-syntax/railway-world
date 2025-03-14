import * as THREE from 'three';
import { WorldObject } from './WorldObject';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Building } from './Building';
import { InternetGlobe } from './InternetGlobe';

type WorldConstructorOptions = {
  htmlRoot: HTMLElement;
};

export class World {
  private htmlRoot: HTMLElement;
  private populated: boolean = false;
  public scene: THREE.Scene;
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

  public objects: Map<string, WorldObject> = new Map();

  constructor(options: WorldConstructorOptions) {
    const { htmlRoot } = options;

    this.htmlRoot = htmlRoot;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
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
    this.ambientLight = new THREE.AmbientLight(0x909090, 1.2);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
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
        color: 0x4caf50, // Grass green color
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
  }

  public addObject(object: WorldObject) {
    this.objects.set(object.id, object);
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

  public populate(railwayData: any) {
    console.log(JSON.stringify(railwayData, null, 2));

    // Extract services from the railway data
    const services = railwayData.project.services.edges.map(
      (edge: any) => edge.node
    );

    // Calculate layout parameters
    const spacing = 7.5; // Space between buildings
    const startX = -(services.length * spacing) / 2; // Center the buildings

    // Create a building for each service
    services.forEach((service: any, index: number) => {
      const xPosition = startX + index * spacing;
      const serviceName = service.name;

      let serviceType = 'default';

      if (service.name.toLowerCase().includes('postgres')) {
        serviceType = 'postgres';
      } else if (service.name.toLowerCase().includes('redis')) {
        serviceType = 'redis';
      } else if (service.name.toLowerCase().includes('node')) {
        serviceType = 'nodejs';
      } else if (service.name.toLowerCase().includes('postiz')) {
        serviceType = 'postiz';
      }

      // Get source information if available
      let sourceInfo = undefined;
      if (service.serviceInstances?.edges?.length > 0) {
        const instance = service.serviceInstances.edges[0].node;
        if (instance.source) {
          sourceInfo = {
            image: instance.source.image,
            repo: instance.source.repo,
          };
        }
      }

      // Create building with service information
      const building = new Building({
        name: serviceName,
        world: this,
        service: {
          id: `service-${index}`,
          type: serviceType,
          icon: service.icon,
          source: sourceInfo,
        },
        x: xPosition,
        y: 0,
        z: 0,
      });

      // Add the building to the world
      this.addObject(building);

      // Check for custom domains or service domains
      if (service.serviceInstances?.edges?.length > 0) {
        // Collect all domains for this service
        const allDomains: string[] = [];

        for (const instanceEdge of service.serviceInstances.edges) {
          const instance = instanceEdge.node;
          if (instance.domains) {
            // Add custom domains
            if (instance.domains.customDomains?.length > 0) {
              allDomains.push(
                ...instance.domains.customDomains.map((d: any) => d.domain)
              );
            }

            // Add service domains
            if (instance.domains.serviceDomains?.length > 0) {
              allDomains.push(
                ...instance.domains.serviceDomains.map((d: any) => d.domain)
              );
            }
          }
        }

        // If we have domains, create a single globe for all of them
        if (allDomains.length > 0) {
          const globeX = xPosition;
          const globeZ = -5; // Place it 5 units behind the building

          // Create the InternetGlobe
          const globe = new InternetGlobe({
            name: `Globe-${allDomains[0]}`,
            world: this,
            x: globeX,
            y: 0,
            z: globeZ,
            domains: allDomains,
            buildingId: building.id,
          });

          // Add the globe to the world
          this.addObject(globe);
        }
      }
    });

    this.populated = true;
  }

  private updateControls = (delta: number) => {
    if (!this.controls.isLocked) return;

    // We now receive delta from the animation loop

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
}
