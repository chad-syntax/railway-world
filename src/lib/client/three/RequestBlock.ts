import { Service, HttpLog } from '../../types';
import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  MeshBasicMaterial,
  PlaneGeometry,
} from 'three';
import { Position, WorldObject } from './WorldObject';
import { World } from './World';
import { GREEN, ORANGE, RED, GRAY_3 } from '../../../lib/colors';

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
    // Normalize bytes to a reasonable cube size (0.02 units per 1000 bytes, with min and max sizes)
    const baseSize = 0.1;
    const bytesScale = Math.min(Math.max(totalBytes / 10000, baseSize), 3);
    this.cubeSize = baseSize + bytesScale * 0.25 + Math.random() * 0.05;

    // Invert speed calculation - shorter durations move faster
    this.speed = Math.min(Math.max(50 / (log.totalDuration || 1), 0.8), 10);

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

    this.startTime = null;
    this.animationComplete = false;
    this.waitStartTime = null;
  }

  private determineRequestType(): string {
    const path = this.log.path.toLowerCase();

    // Define pattern-to-type mappings
    const requestTypePatterns = [
      {
        type: 'IMG',
        patterns: [/\.(jpg|jpeg|png|gif|svg|webp|ico)($|\?)/, /image/],
      },
      { type: 'JS', patterns: [/\.(js|jsx|ts|tsx)($|\?)/] },
      { type: 'CSS', patterns: [/\.(css|scss|sass)($|\?)/] },
      { type: 'API', patterns: [/\/api\//, /\/graphql/] },
    ];

    // Find the first matching pattern
    for (const { type, patterns } of requestTypePatterns) {
      if (patterns.some((pattern) => pattern.test(path))) {
        return type;
      }
    }

    // Default case
    return 'DOC';
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
      baseColor = GREEN; // Green for 2xx (success)
    } else if (status >= 300 && status < 400) {
      baseColor = ORANGE; // Orange for 3xx (redirection)
    } else if (status >= 400 && status < 500) {
      baseColor = RED; // Red for 4xx (client errors) - Consolidated
    } else if (status >= 500) {
      baseColor = RED; // Red for 5xx (server errors) - Consolidated
    } else {
      baseColor = GRAY_3; // Gray for unknown status codes
    }

    // Create the main cube with solid color
    const material = new MeshStandardMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.5,
    });

    this.cube = new Mesh(geometry, material);
    this.group.add(this.cube);

    // Create text textures for request type and method
    const { texture: typeTexture } = this.createTextTexture(requestType, {
      fontSize: 94,
      canvasWidth: 256,
      canvasHeight: 256,
      strokeWidth: 6,
    });

    const { texture: methodTexture } = this.createTextTexture(this.log.method, {
      fontSize: 78,
      canvasWidth: 256,
      canvasHeight: 256,
      strokeWidth: 6,
    });

    const { texture: statusTexture } = this.createTextTexture(
      this.log.httpStatus.toString(),
      {
        fontSize: 112,
        canvasWidth: 256,
        canvasHeight: 256,
        strokeWidth: 6,
      }
    );

    // Create materials for the text planes
    const textMaterial = new MeshBasicMaterial({
      map: typeTexture,
      transparent: true,
    });

    const methodMaterial = new MeshBasicMaterial({
      map: methodTexture,
      transparent: true,
    });

    const statusMaterial = new MeshBasicMaterial({
      map: statusTexture,
      transparent: true,
    });

    // Create planes for the text
    const textSize = this.cubeSize * 0.8; // Slightly smaller than cube size
    const textGeometry = new PlaneGeometry(textSize, textSize);

    // Create and position the text meshes for method (front and back)
    const methodFrontMesh = new Mesh(textGeometry, methodMaterial);
    const methodBackMesh = new Mesh(textGeometry, methodMaterial);

    // Position method text on front and back faces
    methodFrontMesh.position.set(0, 0, this.cubeSize / 2 + 0.01);
    methodBackMesh.position.set(0, 0, -this.cubeSize / 2 - 0.01);
    methodBackMesh.rotation.y = Math.PI; // Rotate to face outward
    this.group.add(methodFrontMesh);
    this.group.add(methodBackMesh);

    // Create and position the text meshes for type (left and right)
    const typeLeftMesh = new Mesh(textGeometry, textMaterial);
    const typeRightMesh = new Mesh(textGeometry, textMaterial);

    // Position type text on left and right faces
    typeLeftMesh.position.set(-this.cubeSize / 2 - 0.01, 0, 0);
    typeLeftMesh.rotation.y = -Math.PI / 2; // Rotate to face left
    typeRightMesh.position.set(this.cubeSize / 2 + 0.01, 0, 0);
    typeRightMesh.rotation.y = Math.PI / 2; // Rotate to face right

    // Create status code mesh for the top of the cube
    const statusMesh = new Mesh(textGeometry, statusMaterial);
    statusMesh.position.set(0, this.cubeSize / 2 + 0.01, 0);
    statusMesh.rotation.x = -Math.PI / 2; // Rotate to face outward

    this.group.add(typeLeftMesh);
    this.group.add(typeRightMesh);
    this.group.add(statusMesh);
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
        const waitElapsed = (Date.now() - this.waitStartTime) / 100;
        if (waitElapsed > 1.0) {
          // Wait 1 second before removal
          // Remove from scene and world's objects map
          this.world.removeObject(this);
        }
      }
    }
  }
}
