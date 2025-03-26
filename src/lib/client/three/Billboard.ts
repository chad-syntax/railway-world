import * as THREE from 'three';
import { World } from './World';
import { WorldObject, Position } from './WorldObject';

type BillboardConstructorOptions = {
  name: string;
  world: World;
  position: Position;
  height: number;
  width: number;
};

export abstract class Billboard extends WorldObject {
  public readonly BILLBOARD_WIDTH: number;
  public readonly BILLBOARD_HEIGHT: number;

  protected structurePanel: THREE.Mesh = new THREE.Mesh();

  constructor(options: BillboardConstructorOptions) {
    super(options);

    const { height, width } = options;
    this.BILLBOARD_HEIGHT = height;
    this.BILLBOARD_WIDTH = width;

    this.createBillboardStructure();

    // Position the billboard group at the specified height
    this.group.position.set(this.position.x, this.position.y, this.position.z);
  }

  private createBillboardStructure(): void {
    // Create the main billboard panel
    const panelGeometry = new THREE.BoxGeometry(
      this.BILLBOARD_WIDTH,
      this.BILLBOARD_HEIGHT,
      0.5
    );

    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b2d42,
      metalness: 0.3,
      roughness: 0.7,
    });

    this.structurePanel = new THREE.Mesh(panelGeometry, panelMaterial);
    this.structurePanel.castShadow = true;
    this.structurePanel.receiveShadow = true;

    // Add panel to the billboard mesh
    this.group.add(this.structurePanel);

    // Rotate the entire billboard to face forward
    this.group.rotation.y = Math.PI;
  }

  abstract createBillboardContent(): void;

  onUpdate(delta: number): void {
    // No need for updates - the billboard stays fixed
  }
}
