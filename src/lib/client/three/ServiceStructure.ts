import * as THREE from 'three';
import { World } from './World';
import { Position, WorldObject } from './WorldObject';
import { breakTextIntoLines, processSourceText } from '../../utils';
import {
  Service,
  Deployment,
  WebSocketLatestDeploymentsEvent,
  DeploymentStatus,
} from '../../types';
import {
  SERVICE_NODEJS,
  SERVICE_POSTGRES,
  SERVICE_REDIS,
  SERVICE_POSTIZ,
  SERVICE_DEFAULT,
  STATUS_SUCCESS_ALT_HEX,
  STATUS_SLEEPING_HEX,
  STATUS_FAILED_HEX,
  STATUS_DEFAULT_HEX,
  VOLUME_BLACK_HEX,
  UI_WHITE_HEX,
  LIGHT_STEEL_BLUE_HEX,
} from '../../../lib/colors';

const SERVICE_STRUCTURE_TYPE_COLORS: Record<string, number> = {
  nodejs: SERVICE_NODEJS,
  postgres: SERVICE_POSTGRES,
  postgresql: SERVICE_POSTGRES,
  redis: SERVICE_REDIS,
  postiz: SERVICE_POSTIZ,
  default: SERVICE_DEFAULT,
} as const;

type ServiceStructureTypeColors = keyof typeof SERVICE_STRUCTURE_TYPE_COLORS;

const SERVICE_TYPE_LABELS: Record<string, string> = {
  postgres: 'SQL DB',
  postgresql: 'SQL DB',
  redis: 'MEM DB',
  default: 'SVC',
} as const;

const DEPLOYMENT_STATUS_EMOJI: Record<DeploymentStatus, string> = {
  BUILDING: '🏗️',
  CRASHED: '💥',
  DEPLOYING: '🚀',
  FAILED: '❌',
  INITIALIZING: '🔄',
  NEEDS_APPROVAL: '⛔',
  QUEUED: '⏳',
  REMOVED: '🗑️',
  REMOVING: '⚠️🗑️',
  SKIPPED: '⏭️',
  SLEEPING: '😴',
  SUCCESS: '✅',
  WAITING: '⌛',
} as const;

type ServiceStructureConstructorOptions = {
  name: string;
  world: World;
  service: Service;
  position: Position;
  deployment: Deployment;
};

export class ServiceStructure extends WorldObject {
  public deployment: Deployment;
  public service: Service;
  public width: number = 3;
  public height: number = 3;
  public depth: number = 3;

  private serviceStructure: THREE.Mesh;
  private serviceStructureColor: number;
  private nameColor: string;
  private iconMesh: THREE.Mesh | null = null;
  private sourceIconMesh: THREE.Mesh | null = null;
  private sourceTextMesh: THREE.Mesh | null = null;
  private statusMesh: THREE.Mesh | null = null;
  private isOscillatingOpacity: boolean = false;
  private oscillatingOpacityDirection: boolean = true;
  private oscillatingOpacityState: number = 0.25;
  private isSleepAnimating: boolean = false;
  private sleepingZs: THREE.Mesh[] = [];
  private nextZSpawnTime: number = 0;
  private readonly OSCILLATING_OPACITY_SPEED = 0.5;
  private readonly OSCILLATING_OPACITY_MIN = 0.25;
  private readonly OSCILLATING_OPACITY_MAX = 0.9;
  private readonly Z_SPAWN_INTERVAL = 1.5; // Spawn a new Z every 2 seconds
  private readonly Z_FLOAT_SPEED = 0.5; // Units per second
  private readonly Z_GROW_SPEED = 0.5; // Scale increase per second
  private readonly Z_MAX_SCALE = 3; // Maximum scale before Z disappears
  private readonly Z_START_SCALE = 0; // Initial scale of Z
  private readonly Z_COLOR = STATUS_SLEEPING_HEX; // Use the sleeping status color
  private isFireAnimating: boolean = false;
  private fireMeshes: THREE.Mesh[] = [];
  private fireTexture: THREE.Texture | null = null;
  private currentFireFrame: number = 0;
  private readonly FIRE_TEXTURE_SIZE = 1;
  private readonly FIRE_FRAME_INTERVAL = 0.15; // 100ms between frames
  private readonly TOTAL_FIRE_FRAMES = 32; // Total frames in spritesheet
  private readonly FIRE_SPRITE_COLS = 8; // 8 columns
  private readonly FIRE_SPRITE_ROWS = 4; // 4 rows
  private fireAnimationTime: number = 0;

  constructor(options: ServiceStructureConstructorOptions) {
    super(options);

    const { service, deployment } = options;

    this.service = service;
    this.deployment = deployment;

    this.group.userData.service = service;

    // Get color based on service type
    this.serviceStructureColor =
      SERVICE_STRUCTURE_TYPE_COLORS[
        this.service.name.toLowerCase() as ServiceStructureTypeColors
      ] || SERVICE_STRUCTURE_TYPE_COLORS.default;

    this.nameColor = UI_WHITE_HEX;

    // Create serviceStructure geometry
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshStandardMaterial({
      color: this.serviceStructureColor,
      roughness: 0.4, // Reduced roughness for more vibrant appearance
      metalness: 0.25, // Slightly increased metalness
      emissive: new THREE.Color(this.serviceStructureColor).multiplyScalar(0.1), // Slight glow matching serviceStructure color
    });

    this.serviceStructure = new THREE.Mesh(geometry, material);
    this.serviceStructure.position.set(0, this.height / 2, 0);
    this.serviceStructure.castShadow = true;
    this.serviceStructure.receiveShadow = true;

    this.createLabel(this.name, {
      x: 0,
      y: this.height + 1,
      z: 0,
    });

    // Add serviceStructure and name to group
    this.group.add(this.serviceStructure);

    // Create and add the icon to the front face if an icon URL is provided
    if (this.service.icon) {
      this.addServiceIcon(this.service.icon);
    }

    // Add source information to the right side of the serviceStructure
    if (this.service.source) {
      this.addSourceInfo(this.service.source);
    }

    // add deployment info at the top of the front face of the serviceStructure
    this.addDeploymentInfo(this.deployment);

    this.addSvcLabel();

    // Position the entire group
    this.group.position.set(this.position.x, 0, this.position.z);

    this.world.wsClient.onMessage(
      'latestDeployments',
      this.handleLatestDeploymentsUpdate
    );
  }

  private addSvcLabel(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d')!;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const label =
      SERVICE_TYPE_LABELS[this.service.name.toLowerCase()] ||
      SERVICE_TYPE_LABELS.default;

    context.fillStyle = LIGHT_STEEL_BLUE_HEX;
    context.font = 'bold 128px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.strokeStyle = VOLUME_BLACK_HEX;
    context.lineWidth = 6;
    context.strokeText(label, canvas.width / 2, canvas.height / 2);

    context.fillText(label, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(this.width, this.height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, this.height + 0.01, 0);
    this.group.add(mesh);
  }

  private handleLatestDeploymentsUpdate = (
    event: WebSocketLatestDeploymentsEvent
  ) => {
    event.nodes.forEach((node) => {
      if (node.serviceId === this.service.id) {
        this.updateDeployment(node.latestDeployment);
      }
    });
  };

  private addDeploymentInfo(deployment: Deployment): void {
    const deploymentStatus = deployment.status;

    // Create a canvas for the status text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    // Set canvas dimensions
    const canvasWidth = 512;
    const canvasHeight = 128;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear the canvas
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set text properties
    const fontSize = 48;
    const fontFamily = 'monospace';
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const structureMaterial = this.serviceStructure
      .material as THREE.MeshStandardMaterial;

    // Determine text color based on status
    let textColor;
    switch (deploymentStatus) {
      case 'SUCCESS':
        textColor = STATUS_SUCCESS_ALT_HEX; // Green
        break;
      case 'SLEEPING':
        textColor = STATUS_SLEEPING_HEX; // Yellow
        break;
      case 'FAILED':
      case 'CRASHED':
        textColor = STATUS_FAILED_HEX; // Red
        break;
      default:
        textColor = STATUS_DEFAULT_HEX; // Blue
    }

    // TODO clean this up
    if (deploymentStatus === 'FAILED' || deploymentStatus === 'CRASHED') {
      this.isFireAnimating = true;
      this.isOscillatingOpacity = false;
      this.isSleepAnimating = false;
      structureMaterial.opacity = 1;
      this.createFireMeshes();
    } else if (deploymentStatus === 'SLEEPING') {
      this.isSleepAnimating = true;
      this.isOscillatingOpacity = false;
      this.isFireAnimating = false;
      structureMaterial.opacity = 1;
    } else if (
      deploymentStatus === 'BUILDING' ||
      deploymentStatus === 'INITIALIZING' ||
      deploymentStatus === 'DEPLOYING' ||
      deploymentStatus === 'WAITING'
    ) {
      this.isOscillatingOpacity = true;
      structureMaterial.transparent = true;
      this.isSleepAnimating = false;
      this.isFireAnimating = false;
    } else {
      this.isOscillatingOpacity = false;
      this.isSleepAnimating = false;
      this.isFireAnimating = false;
      this.removeFireMeshes();
      structureMaterial.opacity = 1;
      structureMaterial.transparent = false;
    }

    // Add black outline
    context.strokeStyle = VOLUME_BLACK_HEX;
    context.lineWidth = 3;
    context.strokeText(
      `${DEPLOYMENT_STATUS_EMOJI[deploymentStatus]} ${deploymentStatus}`,
      canvasWidth / 2,
      canvasHeight / 2
    );

    // Draw the text with the appropriate color
    context.fillStyle = textColor;
    context.fillText(
      `${DEPLOYMENT_STATUS_EMOJI[deploymentStatus]} ${deploymentStatus}`,
      canvasWidth / 2,
      canvasHeight / 2
    );

    // Create texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    // Create material with the texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Create a plane for the text
    const statusWidth = this.width * 0.8;
    const statusHeight = this.height * 0.2;
    const statusGeometry = new THREE.PlaneGeometry(statusWidth, statusHeight);

    // Create mesh with the material
    this.statusMesh = new THREE.Mesh(statusGeometry, material);

    // Position at the top of the front face
    this.statusMesh.position.set(0, this.height - 0.25, this.depth / 2 + 0.001);

    // Add to the group
    this.group.add(this.statusMesh);
  }

  public updateDeployment(deployment: Deployment) {
    this.deployment = deployment;

    if (this.statusMesh) {
      this.group.remove(this.statusMesh);
    }

    this.addDeploymentInfo(deployment);
  }

  private addServiceIcon(iconUrl: string): void {
    // Use our proxy endpoint to avoid CORS issues
    const proxiedIconUrl = `/api/icon?url=${encodeURIComponent(iconUrl)}`;

    // Load the icon as a texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    textureLoader.load(
      proxiedIconUrl,
      (texture) => {
        // Create a plane for the icon on the front face of the building
        const iconSize = Math.min(this.width, this.height) * 0.5;
        const iconGeometry = new THREE.PlaneGeometry(iconSize, iconSize);
        const iconMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
        });

        // Create the mesh and store a reference to it
        this.iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);

        // Position the icon on the front face (z+)
        this.iconMesh.position.set(0, this.height / 2, this.depth / 2 + 0.01);

        // Add to group
        this.group.add(this.iconMesh);
      },
      undefined,
      (error) => {
        console.error('Error loading icon texture:', error);
        // If icon loading fails, create a fallback colored square
        this.createFallbackIcon();
      }
    );
  }

  private createFallbackIcon(): void {
    const iconSize = Math.min(this.width, this.height) * 0.5;
    const iconGeometry = new THREE.PlaneGeometry(iconSize, iconSize);
    const iconMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });

    // Create the fallback mesh and store a reference to it
    this.iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);

    // Position the icon on the front face (z+)
    this.iconMesh.position.set(0, this.height / 2, this.depth / 2 + 0.01);

    // Add to group
    this.group.add(this.iconMesh);
  }

  private createZMesh(): THREE.Mesh {
    // Create a canvas for the Z texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    // Set canvas dimensions
    const canvasWidth = 128;
    const canvasHeight = 128;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear the canvas
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set text properties
    const fontSize = 80;
    const fontFamily = 'monospace';
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Add black outline
    context.strokeStyle = UI_WHITE_HEX;
    context.lineWidth = 2;
    context.strokeText('Z', canvasWidth / 2, canvasHeight / 2);

    // Draw the Z with the sleeping color
    context.fillStyle = this.Z_COLOR;
    context.fillText('Z', canvasWidth / 2, canvasHeight / 2);

    // Create texture from canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    // Create material with the texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false, // Ensure proper transparency rendering
    });

    // Create a plane for the Z
    const zSize = 0.5;
    const geometry = new THREE.PlaneGeometry(zSize, zSize);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(this.width / 2 - 0.5, this.height, this.depth / 2 - 0.5);
    mesh.scale.set(this.Z_START_SCALE, this.Z_START_SCALE, this.Z_START_SCALE);

    return mesh;
  }

  private addSourceInfo(source: Service['source']): void {
    if (!source) return;

    // Determine the source type and appropriate icon
    let iconUrl: string;
    let sourceText: string;

    if (source.repo) {
      iconUrl = 'https://devicons.railway.com/i/github-dark.svg';
      sourceText = processSourceText(source.repo);
    } else if (source.image) {
      iconUrl = 'https://devicons.railway.com/i/docker.svg';
      sourceText = processSourceText(source.image);
    } else {
      return; // No source info to display
    }

    // Create source text as a texture on a plane instead of a sprite
    this.createSourceTextTexture(sourceText);

    // Add source icon
    this.addSourceIcon(iconUrl);
  }

  private createSourceTextTexture(text: string): void {
    // Create a canvas for the text texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    // Set canvas dimensions - make it narrow and appropriate for side text
    const canvasWidth = 512;
    let canvasHeight = 128;

    // Break the text into lines using our utility function
    const maxCharsPerLine = 20;
    const lines = breakTextIntoLines(text, maxCharsPerLine);

    // Adjust canvas height for multiple lines
    if (lines.length > 1) {
      canvasHeight = 128 * lines.length;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear the canvas with a transparent background
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set text properties
    const fontSize = 24;
    const fontFamily = 'monospace';
    context.font = `${fontSize}px ${fontFamily}`;

    // Add a subtle drop shadow
    context.shadowColor = 'rgba(0, 0, 0, 0.6)';
    context.shadowBlur = 3;
    context.shadowOffsetX = 1;
    context.shadowOffsetY = 1;

    // Pre-flip the canvas horizontally to counteract the rotation effect
    context.save();
    context.scale(-1, 1);
    context.translate(-canvasWidth, 0);

    // Draw each line of text
    context.fillStyle = this.nameColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const lineHeight = fontSize * 1.2; // Space between lines
    const startY = (canvasHeight - (lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      const yPos = startY + index * lineHeight;
      context.fillText(line, canvasWidth / 2, yPos);
    });

    // Restore the canvas context
    context.restore();

    // Create a texture from the canvas
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    // Create a material with the texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Create a plane for the text
    const textWidth = this.width * 0.95; // Slightly smaller than building width
    const textHeight = this.height * 0.15 * Math.max(1, lines.length * 0.8); // Adjust height for multiple lines
    const textGeometry = new THREE.PlaneGeometry(textWidth, textHeight);

    // Create the mesh with the material
    this.sourceTextMesh = new THREE.Mesh(textGeometry, material);

    // Position the text on the right side of the building, at the top
    // Adjust position based on number of lines
    const textY =
      this.height - 0.3 - (lines.length > 1 ? (lines.length - 1) * 0.1 : 0);
    this.sourceTextMesh.position.set(this.width / 2 + 0.01, textY, 0);

    // Rotate to face right
    this.sourceTextMesh.rotation.y = -Math.PI / 2;

    // Add to the group
    this.group.add(this.sourceTextMesh);
  }

  private addSourceIcon(iconUrl: string): void {
    // Use our proxy endpoint to avoid CORS issues
    const proxiedIconUrl = `/api/icon?url=${encodeURIComponent(iconUrl)}`;

    // Load the icon as a texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    textureLoader.load(
      proxiedIconUrl,
      (texture) => {
        // Create a plane for the icon on the right side of the building
        const iconSize = Math.min(this.width, this.height) * 0.4;
        const iconGeometry = new THREE.PlaneGeometry(iconSize, iconSize);
        const iconMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide,
        });

        // Create the mesh and store a reference to it
        this.sourceIconMesh = new THREE.Mesh(iconGeometry, iconMaterial);

        // Position the icon on the right side (x+)
        this.sourceIconMesh.position.set(
          this.width / 2 + 0.01,
          this.height / 2,
          0
        );
        // Rotate to face right
        this.sourceIconMesh.rotation.y = -Math.PI / 2;

        // Add to group
        this.group.add(this.sourceIconMesh);
      },
      undefined,
      (error) => {
        console.error('Error loading source icon texture:', error);
      }
    );
  }

  private updateOscillatingOpacity(delta: number): void {
    const structureMaterial = this.serviceStructure
      .material as THREE.MeshStandardMaterial;

    this.oscillatingOpacityState =
      this.oscillatingOpacityState +
      delta *
        this.OSCILLATING_OPACITY_SPEED *
        (this.oscillatingOpacityDirection ? 1 : -1);

    if (this.oscillatingOpacityState > this.OSCILLATING_OPACITY_MAX) {
      this.oscillatingOpacityDirection = false;
    } else if (this.oscillatingOpacityState < this.OSCILLATING_OPACITY_MIN) {
      this.oscillatingOpacityDirection = true;
    }

    structureMaterial.opacity = this.oscillatingOpacityState;
  }

  private updateSleepAnimation(delta: number): void {
    // Check if it's time to spawn a new Z
    if (Date.now() > this.nextZSpawnTime) {
      // Create and add a new Z mesh
      const zMesh = this.createZMesh();
      this.sleepingZs.push(zMesh);
      this.group.add(zMesh);

      // Set next spawn time
      this.nextZSpawnTime = Date.now() + this.Z_SPAWN_INTERVAL * 1000;
    }

    // Update each Z particle
    for (let i = this.sleepingZs.length - 1; i >= 0; i--) {
      const z = this.sleepingZs[i];

      // Move upward
      z.position.y += this.Z_FLOAT_SPEED * delta;

      // Grow in size
      const newScale = z.scale.x + this.Z_GROW_SPEED * delta;
      z.scale.set(newScale, newScale, newScale);

      // Fade out as it grows
      const material = z.material as THREE.MeshBasicMaterial;
      material.opacity =
        1 -
        (newScale - this.Z_START_SCALE) /
          (this.Z_MAX_SCALE - this.Z_START_SCALE);

      // Remove if it's grown too large
      if (newScale >= this.Z_MAX_SCALE) {
        this.group.remove(z);
        this.sleepingZs.splice(i, 1);
      }
    }
  }

  private createFireMeshes(): void {
    // Remove any existing fire meshes
    this.removeFireMeshes();

    // Load the fire spritesheet texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/minecraft_fire_spritesheet.png',
      (texture) => {
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        this.fireTexture = texture;

        // Create fire planes for each side of the cube
        const positions = [
          // Front face fires
          { x: -this.FIRE_TEXTURE_SIZE / 1.5, z: this.depth / 2 },
          { x: this.FIRE_TEXTURE_SIZE / 1.5, z: this.depth / 2 },
          // Back face fires
          { x: -this.FIRE_TEXTURE_SIZE / 1.5, z: -this.depth / 2 },
          { x: this.FIRE_TEXTURE_SIZE / 1.5, z: -this.depth / 2 },
          // Right side fires
          { x: this.width / 2, z: -this.FIRE_TEXTURE_SIZE / 1.5 },
          { x: this.width / 2, z: this.FIRE_TEXTURE_SIZE / 1.5 },
          // Left side fires
          { x: -this.width / 2, z: -this.FIRE_TEXTURE_SIZE / 1.5 },
          { x: -this.width / 2, z: this.FIRE_TEXTURE_SIZE / 1.5 },
        ];

        positions.forEach(({ x, z }) => {
          const fireGeometry = new THREE.PlaneGeometry(
            this.FIRE_TEXTURE_SIZE,
            this.FIRE_TEXTURE_SIZE
          );

          // Update UV coordinates for the first frame
          const frameWidth = 1 / this.FIRE_SPRITE_COLS;
          const frameHeight = 1 / this.FIRE_SPRITE_ROWS;
          const uvs = fireGeometry.attributes.uv;
          const frameX = 0;
          const frameY = 0; // Start from top row
          for (let i = 0; i < uvs.count; i++) {
            const u = uvs.getX(i);
            const v = uvs.getY(i);
            uvs.setXY(
              i,
              frameX * frameWidth + u * frameWidth,
              frameY * frameHeight + v * frameHeight
            );
          }

          const fireMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            alphaTest: 0.1,
          });

          const fireMesh = new THREE.Mesh(fireGeometry, fireMaterial);

          // Position the fire slightly above the cube
          fireMesh.position.set(x, this.height + this.FIRE_TEXTURE_SIZE / 2, z);

          // Rotate the fire to face outward from the center
          if (Math.abs(x) === this.width / 2) {
            // Side fires
            fireMesh.rotation.y = Math.PI / 2;
          }

          this.fireMeshes.push(fireMesh);
          this.group.add(fireMesh);
        });
      },
      undefined,
      (error) => {
        console.error('Error loading fire spritesheet:', error);
      }
    );
  }

  private updateFireAnimation(delta: number): void {
    if (!this.isFireAnimating || !this.fireTexture) return;

    this.fireAnimationTime += delta;
    if (this.fireAnimationTime >= this.FIRE_FRAME_INTERVAL) {
      this.fireAnimationTime = 0;
      this.currentFireFrame =
        (this.currentFireFrame + 1) % this.TOTAL_FIRE_FRAMES;

      // Calculate the frame position in the spritesheet grid
      const frameX = this.currentFireFrame % this.FIRE_SPRITE_COLS;
      const frameY = Math.floor(this.currentFireFrame / this.FIRE_SPRITE_COLS);
      const frameWidth = 1 / this.FIRE_SPRITE_COLS;
      const frameHeight = 1 / this.FIRE_SPRITE_ROWS;

      // Update UV coordinates for all fire meshes
      this.fireMeshes.forEach((mesh) => {
        const uvs = mesh.geometry.attributes.uv;
        for (let i = 0; i < uvs.count; i++) {
          const u = i % 2 === 0 ? 0 : 1; // 0 for left edge, 1 for right edge
          const v = i < 2 ? 1 : 0; // 1 for top edge, 0 for bottom edge
          uvs.setXY(
            i,
            frameX * frameWidth + u * frameWidth,
            frameY * frameHeight + v * frameHeight
          );
        }
        uvs.needsUpdate = true;
      });
    }
  }

  private removeFireMeshes(): void {
    this.fireMeshes.forEach((mesh) => {
      this.group.remove(mesh);
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.map?.dispose();
      material.dispose();
      mesh.geometry.dispose();
    });
    this.fireMeshes = [];
    this.fireTexture?.dispose();
    this.fireTexture = null;
    this.currentFireFrame = 0;
    this.fireAnimationTime = 0;
  }

  onUpdate(delta: number): void {
    if (this.isOscillatingOpacity) {
      this.updateOscillatingOpacity(delta);
    }
    if (this.isSleepAnimating) {
      this.updateSleepAnimation(delta);
    }
    if (this.isFireAnimating) {
      this.updateFireAnimation(delta);
    }
  }
}
