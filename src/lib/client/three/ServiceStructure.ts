import * as THREE from 'three';
import { World } from './World';
import { Position, WorldObject } from './WorldObject';
import { breakTextIntoLines, processSourceText } from '../../utils';
import {
  Service,
  Deployment,
  WebSocketLatestDeploymentsEvent,
  DeploymentStatus,
  WebSocketDeployLogsEvent,
  DeployLog,
  HttpLog,
  WebSocketHttpLogsEvent,
} from '../../types';
import {
  SERVICE_NODEJS,
  SERVICE_POSTGRES,
  SERVICE_REDIS,
  SERVICE_POSTIZ,
  GRAY_3,
  LIME_GREEN_HEX_STR,
  BLUE_HEX_STR,
  RED_HEX_STR,
  GRAY_1_HEX_STR,
  WHITE_HEX_STR,
  BLACK_HEX_STR,
  OFF_WHITE,
  BLACK,
  RED,
} from '../../../lib/colors';

const SERVICE_STRUCTURE_TYPE_COLORS: Record<string, number> = {
  nodejs: SERVICE_NODEJS,
  postgres: SERVICE_POSTGRES,
  postgresql: SERVICE_POSTGRES,
  redis: SERVICE_REDIS,
  postiz: SERVICE_POSTIZ,
  default: GRAY_3,
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

const LOG_SEVERITY_EMOJI: Record<string, string> = {
  info: '🟦', // Blue for info
  warn: '🟨', // Yellow for warn
  error: '🟥', // Red for error
  default: '⬜️', // Default white
};

type ServiceStructureConstructorOptions = {
  name: string;
  world: World;
  service: Service;
  position: Position;
  deployment: Deployment;
};

export class ServiceStructure extends WorldObject {
  // Basic Properties
  public deployment: Deployment;
  public service: Service;
  public width: number = 3;
  public height: number = 3;
  public depth: number = 3;

  // Core Mesh
  private serviceStructure: THREE.Mesh;
  private serviceStructureColor: number;

  // Icon Meshes
  private iconMesh: THREE.Mesh | null = null;
  private sourceIconMesh: THREE.Mesh | null = null;

  // Text Meshes
  private sourceTextMesh: THREE.Mesh | null = null;
  private statusMesh: THREE.Mesh | null = null;

  // Outline Mesh
  private outlineMesh: THREE.Mesh | null = null; // Mesh for proximity outline

  // Oscillating Opacity Animation
  private isOscillatingOpacity: boolean = false;
  private oscillatingOpacityDirection: boolean = true;
  private oscillatingOpacityState: number = 0.25;
  private readonly OSCILLATING_OPACITY_SPEED = 0.5;
  private readonly OSCILLATING_OPACITY_MIN = 0.25;
  private readonly OSCILLATING_OPACITY_MAX = 0.9;

  // Sleeping Animation
  private isSleepAnimating: boolean = false;
  private sleepingZs: THREE.Mesh[] = [];
  private nextZSpawnTime: number = 0;
  private readonly Z_SPAWN_INTERVAL = 1.5; // Spawn a new Z every 2 seconds
  private readonly Z_FLOAT_SPEED = 0.5; // Units per second
  private readonly Z_GROW_SPEED = 0.5; // Scale increase per second
  private readonly Z_MAX_SCALE = 3; // Maximum scale before Z disappears
  private readonly Z_START_SCALE = 0; // Initial scale of Z
  private readonly Z_COLOR = BLUE_HEX_STR; // Use the BLUE status color

  // Fire Animation
  private isFireAnimating: boolean = false;
  private fireMeshes: THREE.Mesh[] = [];
  private fireTexture: THREE.Texture | null = null;
  private currentFireFrame: number = 0;
  private fireAnimationTime: number = 0;
  private readonly FIRE_TEXTURE_SIZE = 1;
  private readonly FIRE_FRAME_INTERVAL = 0.15; // 150ms between frames
  private readonly TOTAL_FIRE_FRAMES = 32; // Total frames in spritesheet
  private readonly FIRE_SPRITE_COLS = 8; // 8 columns
  private readonly FIRE_SPRITE_ROWS = 4; // 4 rows

  // Deploy Logs Panel
  private deployLogsPanel: THREE.Mesh | null = null;
  private deployLogsTexture: THREE.CanvasTexture | null = null;
  private deployLogsCanvas: HTMLCanvasElement | null = null;
  private deployLogsCtx: CanvasRenderingContext2D | null = null;
  private deployLogs: DeployLog[] = [];

  // Http Logs Panel
  private httpLogsPanel: THREE.Mesh | null = null;
  private httpLogsTexture: THREE.CanvasTexture | null = null;
  private httpLogsCanvas: HTMLCanvasElement | null = null;
  private httpLogsCtx: CanvasRenderingContext2D | null = null;
  private httpLogs: HttpLog[] = [];

  constructor(options: ServiceStructureConstructorOptions) {
    super(options);

    const { service, deployment } = options;

    this.service = service;
    this.deployment = deployment;

    // Get color based on service type
    this.serviceStructureColor =
      SERVICE_STRUCTURE_TYPE_COLORS[
        this.service.name.toLowerCase() as ServiceStructureTypeColors
      ] || SERVICE_STRUCTURE_TYPE_COLORS.default;

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
    this.serviceStructure.renderOrder = 0; // Base render order

    this.createLabel(this.name, {
      x: 0,
      y: this.height + 1,
      z: 0,
    });

    // Add serviceStructure and name to group
    this.group.add(this.serviceStructure);

    // Create the outline mesh
    const outlineGeometry = geometry.clone();
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: OFF_WHITE,
      side: THREE.BackSide, // Render only the back faces
      transparent: false,
    });
    this.outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
    this.outlineMesh.position.copy(this.serviceStructure.position); // Match position
    this.outlineMesh.scale.multiplyScalar(1.01); // Slightly larger
    this.outlineMesh.visible = false; // Initially hidden
    this.outlineMesh.renderOrder = -1; // Render before the main structure
    this.group.add(this.outlineMesh);

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

    this.createDeployLogsPanel();

    if (this.service.domains.length > 0) {
      this.createHttpLogsPanel();

      this.world.wsClient.onMessage('httpLogs', this.handleHttpLogs);
    }

    // Position the entire group
    this.group.position.set(this.position.x, this.position.y, this.position.z);

    this.world.wsClient.onMessage(
      'latestDeployments',
      this.handleLatestDeploymentsUpdate
    );

    this.world.wsClient.onMessage('deployLogs', this.handleDeployLogs);
  }

  private createHttpLogsPanel(): void {
    // Panel size slightly smaller than the face
    const panelWidth = this.width * 0.95;
    const panelHeight = this.height * 0.9;
    const geometry = new THREE.PlaneGeometry(panelWidth, panelHeight);

    const { texture } = this.createTextTexture('HTTP Logs', {
      fontSize: 64,
      canvasWidth: 2048,
      canvasHeight: 128,
      strokeWidth: 6,
    });

    const panelTitleMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const panelTitleGeometry = new THREE.PlaneGeometry(
      panelWidth,
      this.height * 0.05
    );

    const panelTitleMesh = new THREE.Mesh(
      panelTitleGeometry,
      panelTitleMaterial
    );

    panelTitleMesh.rotation.y = -Math.PI / 2;
    panelTitleMesh.position.set(
      -(this.width / 2) - 0.01,
      this.height - this.height * 0.05,
      0
    );
    panelTitleMesh.renderOrder = 1;
    this.group.add(panelTitleMesh);

    // Setup canvas for drawing logs
    this.httpLogsCanvas = document.createElement('canvas');
    // Resolution can be adjusted based on visual needs
    this.httpLogsCanvas.width = 2048;
    this.httpLogsCanvas.height = 2048;
    this.httpLogsCtx = this.httpLogsCanvas.getContext('2d');

    // Create texture from canvas
    this.httpLogsTexture = new THREE.CanvasTexture(this.httpLogsCanvas);
    this.httpLogsTexture.needsUpdate = true; // Ensure initial texture is used
    this.httpLogsTexture.minFilter = THREE.LinearFilter;
    this.httpLogsTexture.magFilter = THREE.LinearFilter;

    // Black, opaque material using the canvas texture
    const material = new THREE.MeshBasicMaterial({
      map: this.httpLogsTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.httpLogsPanel = new THREE.Mesh(geometry, material);
    // Position slightly to the left of the service cube's left face
    this.httpLogsPanel.position.set(
      -(this.width / 2) - 0.01,
      this.height / 2 - this.height * 0.025,
      0
    );

    this.httpLogsPanel.renderOrder = 1;
    this.httpLogsPanel.rotation.y = -Math.PI / 2;

    this.group.add(this.httpLogsPanel);

    this.updateHttpLogsTexture();
  }

  private createDeployLogsPanel(): void {
    // Panel size slightly smaller than the face
    const panelWidth = this.width * 0.95;
    const panelHeight = this.height * 0.9;
    const geometry = new THREE.PlaneGeometry(panelWidth, panelHeight);

    const { texture } = this.createTextTexture('Deploy Logs', {
      fontSize: 64,
      canvasWidth: 2048,
      canvasHeight: 128,
      strokeWidth: 6,
    });

    const panelTitleMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const panelTitleGeometry = new THREE.PlaneGeometry(
      panelWidth,
      this.height * 0.05
    );

    const panelTitleMesh = new THREE.Mesh(
      panelTitleGeometry,
      panelTitleMaterial
    );

    panelTitleMesh.rotation.y = Math.PI;

    panelTitleMesh.position.set(
      0,
      this.height - this.height * 0.05,
      -(this.depth / 2) - 0.01
    );
    panelTitleMesh.renderOrder = 1;
    this.group.add(panelTitleMesh);

    // Setup canvas for drawing logs
    this.deployLogsCanvas = document.createElement('canvas');
    // Resolution can be adjusted based on visual needs
    this.deployLogsCanvas.width = 2048;
    this.deployLogsCanvas.height = 2048;
    this.deployLogsCtx = this.deployLogsCanvas.getContext('2d');

    // Create texture from canvas
    this.deployLogsTexture = new THREE.CanvasTexture(this.deployLogsCanvas);
    this.deployLogsTexture.needsUpdate = true; // Ensure initial texture is used
    this.deployLogsTexture.minFilter = THREE.LinearFilter;
    this.deployLogsTexture.magFilter = THREE.LinearFilter;

    // Black, opaque material using the canvas texture
    const material = new THREE.MeshBasicMaterial({
      map: this.deployLogsTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.deployLogsPanel = new THREE.Mesh(geometry, material);
    // Position slightly behind the service cube's back face
    this.deployLogsPanel.position.set(
      0,
      this.height / 2 - this.height * 0.025,
      -(this.depth / 2) - 0.01
    );
    this.deployLogsPanel.renderOrder = 1;

    this.deployLogsPanel.rotation.y = Math.PI;
    this.group.add(this.deployLogsPanel);

    this.updateDeployLogsTexture(); // Draw initial state
  }

  private handleDeployLogs = (event: WebSocketDeployLogsEvent) => {
    const { logs, deploymentId } = event;

    if (deploymentId === this.deployment.id && logs.length > 0) {
      this.deployLogs.push(...logs);

      // Keep only the latest 100 logs in memory
      if (this.deployLogs.length > 120) {
        this.deployLogs = this.deployLogs.slice(-120);
      }

      // Update the texture on the panel
      this.updateDeployLogsTexture();
    }
  };

  private handleHttpLogs = (event: WebSocketHttpLogsEvent) => {
    const { logs, deploymentId } = event;

    if (deploymentId === this.deployment.id && logs.length > 0) {
      this.httpLogs.push(...logs);

      // Keep only the latest 100 logs in memory
      if (this.httpLogs.length > 120) {
        this.httpLogs = this.httpLogs.slice(-120);
      }

      this.updateHttpLogsTexture();
    }
  };

  private updateHttpLogsTexture(): void {
    if (!this.httpLogsCtx || !this.httpLogsCanvas || !this.httpLogsTexture)
      return;

    const ctx = this.httpLogsCtx;
    const canvas = this.httpLogsCanvas;

    // Clear canvas with a black background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set text style
    const fontSize = 20; // Updated font size

    ctx.fillStyle = WHITE_HEX_STR; // White text

    // Draw logs from bottom up on canvas (appears top-down on panel)
    const lineHeight = fontSize * 1.3; // Spacing between lines
    let y = canvas.height - lineHeight * 0.5; // Start near the bottom

    // Draw a placeholder if no logs yet
    if (this.httpLogs.length === 0) {
      ctx.fillStyle = GRAY_1_HEX_STR; // Dim color for placeholder
      ctx.font = `128px Monospace`; // Monospace for alignment

      ctx.textAlign = 'center';
      ctx.fillText('Waiting for logs...', canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = WHITE_HEX_STR; // Reset color
    } else {
      ctx.font = `${fontSize}px Monospace`; // Monospace for alignment
      ctx.textAlign = 'left';

      for (let i = this.httpLogs.length - 1; i >= 0; i--) {
        const log = this.httpLogs[i];

        // Format timestamp (e.g., "Mar 31 17:46:40")
        const timestamp = new Date(log.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });

        const emoji =
          log.httpStatus >= 500 ? '🟥' : log.httpStatus >= 400 ? '🟨' : '🟩';

        const logLine = `${emoji} | ${timestamp} | ${log.httpStatus} | ${log.method} | ${log.path}`;

        // Draw text
        ctx.fillText(logLine, 10, y); // Add padding from left edge

        y -= lineHeight; // Move up for the next line

        // Stop if we run out of canvas space vertically
        if (y < fontSize) break;
      }
    }

    // Tell Three.js to update the texture
    this.httpLogsTexture.needsUpdate = true;
  }

  private updateDeployLogsTexture(): void {
    if (
      !this.deployLogsCtx ||
      !this.deployLogsCanvas ||
      !this.deployLogsTexture
    )
      return;

    const ctx = this.deployLogsCtx;
    const canvas = this.deployLogsCanvas;

    // Clear canvas with a black background
    // ctx.fillStyle = RED_HEX_STR; // Black background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set text style
    const fontSize = 20; // Updated font size

    ctx.fillStyle = WHITE_HEX_STR; // White text

    // Get the latest logs to display (up to MAX_LOG_LINES_DISPLAYED)
    const logsToDisplay = this.deployLogs;

    // Draw logs from bottom up on canvas (appears top-down on panel)
    const lineHeight = fontSize * 1.3; // Spacing between lines
    let y = canvas.height - lineHeight * 0.5; // Start near the bottom

    // Draw a placeholder if no logs yet
    if (logsToDisplay.length === 0) {
      ctx.fillStyle = GRAY_1_HEX_STR; // Dim color for placeholder
      ctx.font = `128px Monospace`; // Monospace for alignment

      ctx.textAlign = 'center';
      ctx.fillText('Waiting for logs...', canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = WHITE_HEX_STR; // Reset color
    } else {
      ctx.font = `${fontSize}px Monospace`; // Monospace for alignment
      ctx.textAlign = 'left';

      for (let i = logsToDisplay.length - 1; i >= 0; i--) {
        const log = logsToDisplay[i];
        const severity = log.severity.toLowerCase();
        const emoji =
          LOG_SEVERITY_EMOJI[severity] || LOG_SEVERITY_EMOJI.default;

        // Format timestamp (e.g., "Mar 31 17:46:40")
        const timestamp = new Date(log.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });

        const logLine = `${emoji} | ${timestamp} | ${log.message}`;

        // Draw text
        ctx.fillText(logLine, 10, y); // Add padding from left edge

        y -= lineHeight; // Move up for the next line

        // Stop if we run out of canvas space vertically
        if (y < fontSize) break;
      }
    }

    // Tell Three.js to update the texture
    this.deployLogsTexture.needsUpdate = true;
  }

  private addSvcLabel(): void {
    const label =
      SERVICE_TYPE_LABELS[this.service.name.toLowerCase()] ||
      SERVICE_TYPE_LABELS.default;

    const { texture } = this.createTextTexture(label, {
      fontSize: 128,
      canvasWidth: 512,
      canvasHeight: 512,
      strokeWidth: 6,
    });

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(this.width, this.height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, this.height + 0.01, 0);
    mesh.renderOrder = 1; // Draw after base cube
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

    const structureMaterial = this.serviceStructure
      .material as THREE.MeshStandardMaterial;

    // Determine text color based on status
    let textColor;
    switch (deploymentStatus) {
      case 'SUCCESS':
        textColor = LIME_GREEN_HEX_STR; // Green
        break;
      case 'SLEEPING':
        textColor = BLUE_HEX_STR; // Blue (was sleeping/yellow)
        break;
      case 'FAILED':
      case 'CRASHED':
        textColor = RED_HEX_STR; // Red
        break;
      default:
        textColor = GRAY_1_HEX_STR; // Gray (was default/blue)
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

    const { texture } = this.createTextTexture(
      `${DEPLOYMENT_STATUS_EMOJI[deploymentStatus]} ${deploymentStatus}`,
      {
        fontSize: 96,
        canvasWidth: 1024,
        canvasHeight: 256,
        strokeWidth: 12,
        strokeColor: BLACK_HEX_STR,
      }
    );

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
    this.statusMesh.position.set(0, this.height - 0.25, this.depth / 2 + 0.001);
    this.statusMesh.renderOrder = 1; // Draw after base cube

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
        this.iconMesh.position.set(0, this.height / 2, this.depth / 2 + 0.01);
        this.iconMesh.renderOrder = 1; // Draw after base cube

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
    this.iconMesh.position.set(0, this.height / 2, this.depth / 2 + 0.01);
    this.iconMesh.renderOrder = 1; // Draw after base cube

    // Add to group
    this.group.add(this.iconMesh);
  }

  private createZMesh(): THREE.Mesh {
    const { texture } = this.createTextTexture('Z', {
      fontSize: 80,
      canvasWidth: 128,
      canvasHeight: 128,
      color: this.Z_COLOR,
      strokeColor: WHITE_HEX_STR,
      strokeWidth: 4,
    });

    // Create material with the texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // Create a plane for the Z
    const zSize = 0.5;
    const geometry = new THREE.PlaneGeometry(zSize, zSize);
    const mesh = new THREE.Mesh(geometry, material);

    mesh.userData.ignoreInteraction = true;

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
    const maxCharsPerLine = 20;
    const lines = breakTextIntoLines(text, maxCharsPerLine);

    const { texture } = this.createTextTexture(lines, {
      fontSize: 48,
      canvasWidth: 1024,
      canvasHeight: 256,
      strokeWidth: 0,
    });

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
    this.sourceTextMesh.rotation.y = Math.PI / 2;
    this.sourceTextMesh.renderOrder = 1; // Draw after base cube

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
        this.sourceIconMesh.position.set(
          this.width / 2 + 0.01,
          this.height / 2,
          0
        );
        this.sourceIconMesh.rotation.y = -Math.PI / 2;
        this.sourceIconMesh.renderOrder = 1; // Draw after base cube

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

  public showOutline(): void {
    if (this.outlineMesh) {
      this.outlineMesh.visible = true;
    }
  }

  public hideOutline(): void {
    if (this.outlineMesh) {
      this.outlineMesh.visible = false;
    }
  }

  getInteractionText(): string {
    return `View ${this.service.name} in Railway`;
  }

  onInteract(): void {
    this.world.player.controls.unlock();

    const logPanel = this.service.domains.length > 0 ? 'http' : 'deploy';

    const serviceUrl = `https://railway.com/project/${this.world.railwayData.projectId}/service/${this.service.id}?environmentId=${this.world.railwayData.environmentId}&id=${this.service.latestDeployment.id}#${logPanel}`;

    window.open(serviceUrl, '_blank');
  }
}
