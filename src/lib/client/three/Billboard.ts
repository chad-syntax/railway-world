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

    // Add the group to the scene
    this.world.scene.add(this.group);
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

  // private async createBillboardContent(panel: THREE.Mesh): Promise<void> {
  //   // Create a canvas for the billboard content
  //   const canvas = document.createElement('canvas');
  //   const ctx = canvas.getContext('2d')!;
  //   canvas.width = 2048;
  //   canvas.height = 1024;

  //   // Fill background (matching the panel color but slightly lighter)
  //   ctx.fillStyle = '#2b2d42';
  //   ctx.fillRect(0, 0, canvas.width, canvas.height);

  //   // Load Railway icon
  //   const iconSize = canvas.height * 0.2;
  //   try {
  //     const img = new Image();
  //     await new Promise((resolve, reject) => {
  //       img.onload = resolve;
  //       img.onerror = reject;
  //       img.src =
  //         '/api/icon?url=https://devicons.railway.com/i/railway-light.svg';
  //     });

  //     // Draw icon
  //     ctx.drawImage(
  //       img,
  //       canvas.width * 0.1, // x position
  //       canvas.height * 0.1, // y position
  //       iconSize,
  //       iconSize
  //     );
  //   } catch (error) {
  //     console.error('Failed to load Railway icon:', error);
  //   }

  //   // Configure text settings
  //   ctx.textAlign = 'left';
  //   ctx.fillStyle = '#ffffff';

  //   // Draw project name
  //   ctx.font = '112px monospace';
  //   ctx.fillText(this.projectName, canvas.width * 0.23, canvas.height * 0.23);

  //   // Draw credit text
  //   ctx.font = '80px monospace';
  //   ctx.fillText(
  //     'Developed by Chad $yntax',
  //     canvas.width * 0.1,
  //     canvas.height * 0.5
  //   );

  //   // Draw social links
  //   ctx.font = '60px monospace';
  //   ctx.fillStyle = '#1DA1F2'; // Twitter blue
  //   ctx.fillText('X - @SyntaxChad', canvas.width * 0.1, canvas.height * 0.7);

  //   ctx.fillStyle = '#ffffff';
  //   ctx.fillText(
  //     'github.com/chad-syntax/railway-world',
  //     canvas.width * 0.1,
  //     canvas.height * 0.85
  //   );

  //   // Create texture from canvas
  //   const texture = new THREE.CanvasTexture(canvas);
  //   texture.needsUpdate = true;
  //   texture.minFilter = THREE.LinearFilter;
  //   texture.magFilter = THREE.LinearFilter;

  //   // Create material with the texture
  //   const contentMaterial = new THREE.MeshBasicMaterial({
  //     map: texture,
  //     transparent: true,
  //   });

  //   // Create a plane slightly in front of the panel
  //   const contentGeometry = new THREE.PlaneGeometry(
  //     this.BILLBOARD_WIDTH - 1,
  //     this.BILLBOARD_HEIGHT - 1
  //   );
  //   const contentMesh = new THREE.Mesh(contentGeometry, contentMaterial);
  //   contentMesh.position.z = -0.26; // Slightly in front of the panel
  //   contentMesh.rotation.y = Math.PI; // Face the same way as the panel

  //   // Add to the billboard mesh
  //   this.group.add(contentMesh);
  // }

  onUpdate(delta: number): void {
    // No need for updates - the billboard stays fixed
  }
}
