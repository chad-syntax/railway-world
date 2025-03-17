import * as THREE from 'three';
import { World } from './World';
import { WorldObject, Position } from './WorldObject';

export type ConnectionPoint = {
  worldObject: WorldObject;
  localPosition: THREE.Vector3;
};

type ConnectionLineConstructorOptions = {
  name: string;
  world: World;
  position: Position;
  startPoint: ConnectionPoint;
  endPoint: ConnectionPoint;
  lineRadius?: number;
  color?: number;
};

export class ConnectionLine extends WorldObject {
  private connectionMesh: THREE.Mesh | null = null;
  private tubeMaterial!: THREE.MeshStandardMaterial;
  public startPoint: ConnectionPoint;
  public endPoint: ConnectionPoint;
  private lineRadius: number;
  private color: number;

  // Cached positions for comparison
  private lastStartPosition = new THREE.Vector3();
  private lastEndPosition = new THREE.Vector3();
  private positionsDirty = true; // Initial update is needed

  constructor(options: ConnectionLineConstructorOptions) {
    super(options); // Call WorldObject constructor with standard options

    const {
      startPoint,
      endPoint,
      lineRadius = 0.02,
      color = 0x3498db,
    } = options;

    this.startPoint = startPoint;
    this.endPoint = endPoint;
    this.lineRadius = lineRadius;
    this.color = color;

    // Create the connection line once
    this.initConnectionLine();

    // Add the group to the scene
    this.world.scene.add(this.group);
  }

  private initConnectionLine(): void {
    // Create material just once
    this.tubeMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.9,
      emissive: this.color,
      emissiveIntensity: 0.3, // Slight glow
      roughness: 0.4,
      metalness: 0.6,
    });

    // Initial creation of the mesh with updated path
    this.updateConnectionGeometry();
  }

  private updateConnectionGeometry(): void {
    // Get the world positions of both connection points
    const startWorldPos = this.getWorldPosition(this.startPoint);
    const endWorldPos = this.getWorldPosition(this.endPoint);

    // Convert to local coordinate system of our group
    const startLocal = this.group.worldToLocal(startWorldPos.clone());
    const endLocal = this.group.worldToLocal(endWorldPos.clone());

    // Create a line path between the points
    const path = new THREE.LineCurve3(startLocal, endLocal);

    // Create new tube geometry
    const tubeGeometry = new THREE.TubeGeometry(
      path,
      1, // tubularSegments - fewer needed for straight line
      this.lineRadius, // radius - controls the thickness
      8, // radiusSegments - controls the roundness of the tube
      false // closed
    );

    if (this.connectionMesh) {
      // Update existing mesh with new geometry
      this.connectionMesh.geometry.dispose(); // Clean up old geometry
      this.connectionMesh.geometry = tubeGeometry;
    } else {
      // Create mesh if it doesn't exist yet
      this.connectionMesh = new THREE.Mesh(tubeGeometry, this.tubeMaterial);
      this.connectionMesh.castShadow = true;
      this.group.add(this.connectionMesh);
    }

    // Store the positions for next comparison
    this.lastStartPosition.copy(startWorldPos);
    this.lastEndPosition.copy(endWorldPos);
    this.positionsDirty = false;
  }

  // Helper to get world position from a connection point
  private getWorldPosition(connectionPoint: ConnectionPoint): THREE.Vector3 {
    // Get the object's world matrix
    const worldMatrix = new THREE.Matrix4();
    connectionPoint.worldObject.group.matrixWorld.decompose(
      new THREE.Vector3(),
      new THREE.Quaternion(),
      new THREE.Vector3()
    );
    connectionPoint.worldObject.group.updateMatrixWorld(true);
    worldMatrix.copy(connectionPoint.worldObject.group.matrixWorld);

    // Transform the local position to world position
    const worldPosition = connectionPoint.localPosition.clone();
    worldPosition.applyMatrix4(worldMatrix);

    return worldPosition;
  }

  // Check if the positions have changed since last update
  private checkPositionsChanged(): boolean {
    const currentStartPos = this.getWorldPosition(this.startPoint);
    const currentEndPos = this.getWorldPosition(this.endPoint);

    return (
      !this.lastStartPosition.equals(currentStartPos) ||
      !this.lastEndPosition.equals(currentEndPos)
    );
  }

  // Implement the required onUpdate method from WorldObject
  onUpdate(delta: number): void {
    // Only update the geometry if positions have changed
    if (this.positionsDirty || this.checkPositionsChanged()) {
      this.updateConnectionGeometry();
    }
  }

  // Clean up method to remove the mesh and dispose resources
  dispose(): void {
    if (this.connectionMesh) {
      if (this.connectionMesh.geometry) {
        this.connectionMesh.geometry.dispose();
      }
      this.group.remove(this.connectionMesh);
      this.connectionMesh = null;
    }

    this.tubeMaterial.dispose();

    this.world.scene.remove(this.group);
  }

  // Get the world position of the start point
  public getStartPosition(targetVector?: THREE.Vector3): THREE.Vector3 {
    const worldPosition = this.getWorldPosition(this.startPoint);
    if (targetVector) {
      targetVector.copy(worldPosition);
      return targetVector;
    }
    return worldPosition;
  }

  // Get the world position of the end point
  public getEndPosition(targetVector?: THREE.Vector3): THREE.Vector3 {
    const worldPosition = this.getWorldPosition(this.endPoint);
    if (targetVector) {
      targetVector.copy(worldPosition);
      return targetVector;
    }
    return worldPosition;
  }
}
