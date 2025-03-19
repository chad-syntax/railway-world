import { Service, HttpLog } from '../../types';
import {
  BoxGeometry,
  Mesh,
  CanvasTexture,
  MeshStandardMaterial,
  DoubleSide,
  LinearFilter,
} from 'three';
import { Position, WorldObject } from './WorldObject';
import { World } from './World';

type RequestBlockOptions = {
  service: Service;
  log: HttpLog;
  world: World;
  position: Position;
  endPosition: Position;
};

export class RequestBlock extends WorldObject {
  public service: Service;
  private log: HttpLog;
  private endPosition: Position;
  private startTime: number | null;
  private animationComplete: boolean;
  private startPosition: Position;
  private waitStartTime: number | null;
  private cube!: Mesh;
  private speed: number = 1;
  private currentPos!: Position;
  private totalDistance!: number;
  private direction!: Position;
  private cubeSize: number;

  constructor(options: RequestBlockOptions) {
    const { service, log, endPosition } = options;
    super({
      ...options,
      name: `request-block-${service.name}-${log.requestId}`,
    });

    this.service = service;
    this.log = log;
    this.endPosition = endPosition;

    // Calculate initial values
    this.startPosition = {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
    };

    this.currentPos = {
      x: this.startPosition.x,
      y: this.startPosition.y,
      z: this.startPosition.z,
    };

    // Calculate the total distance to travel
    this.totalDistance = Math.sqrt(
      Math.pow(this.endPosition.x - this.startPosition.x, 2) +
        Math.pow(this.endPosition.y - this.startPosition.y, 2) +
        Math.pow(this.endPosition.z - this.startPosition.z, 2)
    );

    // Calculate direction vector
    this.direction = {
      x: (this.endPosition.x - this.startPosition.x) / this.totalDistance,
      y: (this.endPosition.y - this.startPosition.y) / this.totalDistance,
      z: (this.endPosition.z - this.startPosition.z) / this.totalDistance,
    };

    // Calculate cube size based on tx and rx bytes
    const totalBytes = (this.log.txBytes || 0) + (this.log.rxBytes || 0);
    // Normalize bytes to a reasonable cube size (0.02 units per 100 bytes, with min and max sizes)
    const baseSize = 0.02;
    const bytesScale = Math.min(Math.max(totalBytes / 1000, baseSize), 5);
    this.cubeSize = baseSize + bytesScale * 0.25 + Math.random() * 0.05;

    // Invert speed calculation - shorter durations move faster
    this.speed = Math.min(Math.max(100 / (log.totalDuration || 1), 1), 5);

    this.createBlock();

    // Only render the HTTP method as the label with position based on cube size
    this.createLabel(
      log.path,
      {
        x: 0,
        y: this.cubeSize / 2 + 0.2, // Position label above the cube with a small margin
        z: 0,
      },
      {
        fontSize: 16,
        canvasHeight: 32,
        canvasWidth: 512,
      }
    );

    this.group.position.set(this.position.x, this.position.y, this.position.z);

    // Add the group to the scene
    this.world.scene.add(this.group);

    this.startTime = null;
    this.animationComplete = false;
    this.waitStartTime = null;
  }

  private determineRequestType(): string {
    const path = this.log.path.toLowerCase();

    if (
      path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)($|\?)/) ||
      path.includes('image')
    ) {
      return 'IMG';
    } else if (path.match(/\.(js|jsx|ts|tsx)($|\?)/)) {
      return 'JS';
    } else if (path.match(/\.(css|scss|sass)($|\?)/)) {
      return 'CSS';
    } else if (path.includes('/api/') || path.includes('/graphql')) {
      return 'API';
    } else {
      return 'DOC';
    }
  }

  private createTextTexture(
    text: string,
    size: number = 128,
    color: number
  ): CanvasTexture {
    // Create a canvas to render the text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;

    // Convert hex color to rgba string
    const r = (color >> 16) & 255;
    const g = (color >> 8) & 255;
    const b = color & 255;
    const fillColor = `rgba(${r}, ${g}, ${b}, 1.0)`;

    // Clear the canvas
    context.fillStyle = fillColor;
    context.fillRect(0, 0, size, size);

    // Set text properties
    const fontSize = Math.floor(size / 3);
    context.font = `bold ${fontSize}px monospace`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Add shadow for better visibility
    context.shadowColor = 'rgba(0, 0, 0, 0.7)';
    context.shadowBlur = 4;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    // Draw text
    context.fillStyle = '#ffffff';
    context.fillText(text, size / 2, size / 2);

    // Create a texture from the canvas
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;

    return texture;
  }

  private createBlock() {
    const geometry = new BoxGeometry(
      this.cubeSize,
      this.cubeSize,
      this.cubeSize
    );

    // Get request type
    const requestType = this.determineRequestType();

    // Choose color based on HTTP status code
    const status = this.log.httpStatus;
    let baseColor;

    if (status >= 200 && status < 300) {
      baseColor = 0x42f54b; // Green for 2xx (success)
    } else if (status >= 300 && status < 400) {
      baseColor = 0xf5a742; // Orange for 3xx (redirection)
    } else if (status >= 400 && status < 500) {
      baseColor = 0xff6b6b; // Light red for 4xx (client errors)
    } else if (status >= 500) {
      baseColor = 0xcc0000; // Dark red for 5xx (server errors)
    } else {
      baseColor = 0xcccccc; // Gray for unknown status codes
    }

    // Create text texture
    const typeTexture = this.createTextTexture(requestType, 128, baseColor);
    const methodTexture = this.createTextTexture(
      this.log.method,
      128,
      baseColor
    );

    // Create materials for each face
    const materials = [
      new MeshStandardMaterial({
        map: typeTexture,
        transparent: true,
        side: DoubleSide,
      }), // right
      new MeshStandardMaterial({
        map: typeTexture,
        transparent: true,
        side: DoubleSide,
      }), // left
      new MeshStandardMaterial({ color: baseColor }), // top
      new MeshStandardMaterial({ color: baseColor }), // bottom
      new MeshStandardMaterial({
        map: methodTexture,
        transparent: true,
        side: DoubleSide,
      }), // front
      new MeshStandardMaterial({
        map: methodTexture,
        transparent: true,
        side: DoubleSide,
      }), // back
    ];

    this.cube = new Mesh(geometry, materials);
    this.group.add(this.cube);
  }

  onUpdate(delta: number) {
    if (!this.animationComplete) {
      // Set start time first time through
      if (!this.startTime) {
        this.startTime = Date.now();
      }

      // Calculate how far to move this frame based on speed and delta time
      const moveDistance = this.speed * delta;

      // Update current position
      this.currentPos.x += this.direction.x * moveDistance;
      this.currentPos.y += this.direction.y * moveDistance;
      this.currentPos.z += this.direction.z * moveDistance;

      // Calculate how far we've traveled
      const distanceTraveled = Math.sqrt(
        Math.pow(this.currentPos.x - this.startPosition.x, 2) +
          Math.pow(this.currentPos.y - this.startPosition.y, 2) +
          Math.pow(this.currentPos.z - this.startPosition.z, 2)
      );

      // Check if we've reached the destination
      if (distanceTraveled >= this.totalDistance) {
        // We've reached the end, snap to exact end position
        this.group.position.set(
          this.endPosition.x,
          this.endPosition.y,
          this.endPosition.z
        );
        this.animationComplete = true;
        this.waitStartTime = Date.now();
      } else {
        // Still moving, update the position
        this.group.position.set(
          this.currentPos.x,
          this.currentPos.y,
          this.currentPos.z
        );
      }
    } else {
      // After animation is complete, wait then remove
      if (this.waitStartTime) {
        const waitElapsed = (Date.now() - this.waitStartTime) / 1000;
        if (waitElapsed > 1.0) {
          // Wait 1 second before removal
          // Remove from scene and world's objects map
          this.world.scene.remove(this.group);
          this.world.objects.delete(this.id);
        }
      }
    }
  }
}
