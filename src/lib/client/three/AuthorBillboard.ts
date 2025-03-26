import { Billboard } from './Billboard';
import { World } from './World';
import { Position } from './WorldObject';
import * as THREE from 'three';
import { UI_WHITE_HEX } from '../../../lib/colors';

type AuthorBillboardConstructorOptions = {
  name: string;
  world: World;
  position: Position;
};

export class AuthorBillboard extends Billboard {
  constructor(options: AuthorBillboardConstructorOptions) {
    super({
      ...options,
      height: 15,
      width: 10,
    });

    this.createBillboardContent();
  }

  createBillboardContent(): void {
    // Create a canvas for the billboard content
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 1024;
    canvas.height = 1536;

    // Clear the canvas with a transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configure text settings
    ctx.textAlign = 'center';
    ctx.fillStyle = UI_WHITE_HEX;

    // Draw title
    ctx.font = '112px monospace';
    ctx.fillText('Railway World', canvas.width / 2, canvas.height * 0.2);

    // Draw subtitle
    ctx.font = '64px monospace';
    ctx.fillText(
      '3D Railway Infrastructure',
      canvas.width / 2,
      canvas.height * 0.35
    );
    ctx.fillText('Visualizer', canvas.width / 2, canvas.height * 0.42);

    // Draw author
    ctx.font = '64px monospace';
    ctx.fillText(
      'Developed by Chad $yntax',
      canvas.width / 2,
      canvas.height * 0.65
    );

    // Draw social links
    ctx.font = '72px monospace';
    ctx.fillText('X - @chad_syntax', canvas.width / 2, canvas.height * 0.8);
    ctx.font = '44px monospace';
    ctx.fillText(
      'github.com/chad-syntax/railway-world',
      canvas.width / 2,
      canvas.height * 0.9
    );

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Create material with the texture
    const contentMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    // Create a plane slightly in front of the panel
    const contentGeometry = new THREE.PlaneGeometry(
      this.BILLBOARD_WIDTH - 1,
      this.BILLBOARD_HEIGHT - 1
    );
    const contentMesh = new THREE.Mesh(contentGeometry, contentMaterial);
    contentMesh.position.z = -0.26; // Slightly in front of the panel
    contentMesh.rotation.y = Math.PI; // Face the same way as the panel

    // Add to the billboard mesh
    this.group.add(contentMesh);
  }

  onUpdate(delta: number): void {}
}
