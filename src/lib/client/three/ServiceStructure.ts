import * as THREE from 'three';
import { World } from './World';
import { Position, WorldObject } from './WorldObject';
import { breakTextIntoLines, processSourceText } from '../../utils';
import {
  Service,
  Deployment,
  WebSocketLatestDeploymentsEvent,
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

    // Position the entire group
    this.group.position.set(this.position.x, 0, this.position.z);

    this.world.wsClient.onMessage(
      'latestDeployments',
      this.handleLatestDeploymentsUpdate
    );
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

  private setGroupOpacity(opacity: number): void {
    this.group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.material instanceof THREE.Material) {
          // object.material.transparent = opacity < 1;
          object.material.opacity = opacity;
          object.material.needsUpdate = true;
        } else if (Array.isArray(object.material)) {
          object.material.forEach((material) => {
            // material.transparent = opacity < 1;
            material.opacity = opacity;
            material.needsUpdate = true;
          });
        }
      }
    });
  }

  private addDeploymentInfo(deployment: Deployment): void {
    const deploymentInfo = deployment.status;

    // Create a canvas for the status text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    // Set canvas dimensions
    const canvasWidth = 256;
    const canvasHeight = 64;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear the canvas
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Set text properties
    const fontSize = 24;
    const fontFamily = 'monospace';
    context.font = `bold ${fontSize}px ${fontFamily}`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Determine text color based on status
    let textColor;
    switch (deploymentInfo) {
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

    // Add black outline
    context.strokeStyle = VOLUME_BLACK_HEX;
    context.lineWidth = 3;
    context.strokeText(deploymentInfo, canvasWidth / 2, canvasHeight / 2);

    // Draw the text with the appropriate color
    context.fillStyle = textColor;
    context.fillText(deploymentInfo, canvasWidth / 2, canvasHeight / 2);

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

    // Set opacity based on status
    if (deploymentInfo === 'FAILED' || deploymentInfo === 'CRASHED') {
      this.setGroupOpacity(0.5);
    } else {
      this.setGroupOpacity(1);
    }
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

        // Apply current opacity state to new icon
        if (
          this.deployment.status === 'FAILED' ||
          this.deployment.status === 'CRASHED'
        ) {
          this.setGroupOpacity(0.5);
        }
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

  onUpdate(delta: number): void {}
}
