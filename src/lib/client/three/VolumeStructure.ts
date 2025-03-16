import * as THREE from 'three';
import { Volume } from '../../types';
import { World } from './World';
import { WorldObject, Position } from './WorldObject';

type VolumeStructureOptions = {
  name: string;
  world: World;
  volume: Volume;
  position: Position;
};

export class VolumeStructure extends WorldObject {
  private volume: Volume;
  private color: number = 0xc3c3c3;
  private usage: number = 0;
  private width: number = 1;
  private height: number = 1;
  private depth: number = 1;
  private iconMesh: THREE.Mesh | null = null;
  private innerVolumeMesh: THREE.Mesh | null = null;
  private wireframeMesh: THREE.Mesh | null = null;

  constructor(options: VolumeStructureOptions) {
    super(options);

    const { volume } = options;
    this.volume = volume;

    this.usage = this.volume.currentSizeMB / this.volume.sizeMB;
    this.color =
      this.usage > 0.8 ? 0xff0000 : this.usage > 0.5 ? 0xffff00 : 0x00ff00;

    this.createVolume();
    this.addVolumeIcon();
    this.createVolumeName();
    this.createLabel(
      this.volume.name,
      {
        x: 0,
        y: this.height,
        z: 0,
      },
      {
        canvasWidth: 2048,
        canvasHeight: 128,
        fontSize: 32,
      }
    );
  }

  private createVolume() {
    // Create wireframe cube
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const wireframeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      wireframe: true,
      wireframeLinewidth: 2,
      transparent: true,
      opacity: 0.8,
    });

    this.wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    this.group.add(this.wireframeMesh);

    // Create inner volume cube that shows usage
    const innerHeight = this.height * this.usage;

    const innerGeometry = new THREE.BoxGeometry(
      this.width,
      innerHeight,
      this.depth
    );

    const innerMaterial = new THREE.MeshStandardMaterial({
      color: this.color,
      roughness: 0.4,
      metalness: 0.6,
      emissive: new THREE.Color(this.color).multiplyScalar(0.2),
    });

    const usageTextCanvas = document.createElement('canvas');
    const usageTextContext = usageTextCanvas.getContext('2d')!;
    usageTextCanvas.width = 1024;
    usageTextCanvas.height = 1024;

    usageTextContext.clearRect(
      0,
      0,
      usageTextCanvas.width,
      usageTextCanvas.height
    );
    usageTextContext.font = 'bold 128px Arial';
    usageTextContext.fillStyle = '#ffffff';
    usageTextContext.textAlign = 'center';
    usageTextContext.textBaseline = 'middle';

    const usageText = `${Math.round(this.volume.currentSizeMB)} / ${
      this.volume.sizeMB
    }mb`;
    usageTextContext.fillText(
      usageText,
      usageTextCanvas.width / 2,
      usageTextCanvas.height / 2
    );

    const usageTextTexture = new THREE.Texture(usageTextCanvas);
    usageTextTexture.needsUpdate = true;
    usageTextTexture.minFilter = THREE.LinearFilter;
    usageTextTexture.magFilter = THREE.LinearFilter;

    const usageTextMaterial = new THREE.MeshBasicMaterial({
      map: usageTextTexture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const usageTextGeometry = new THREE.PlaneGeometry(
      this.width,
      this.height,
      1
    );

    const usageTextMesh = new THREE.Mesh(usageTextGeometry, usageTextMaterial);

    // Position on top face of the inner volume cube
    const innerTopPosition = (innerHeight - this.height) / 2 + innerHeight / 2;
    usageTextMesh.position.set(0, innerTopPosition + 0.001, 0); // Small offset to prevent z-fighting
    usageTextMesh.rotation.x = -Math.PI / 2; // Rotate to lay flat on top
    this.group.add(usageTextMesh);

    this.innerVolumeMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    // Position inner volume at bottom of wireframe
    this.innerVolumeMesh.position.y = (innerHeight - this.height) / 2;
    this.group.add(this.innerVolumeMesh);

    this.group.position.set(this.position.x, this.position.y, this.position.z);
    this.world.scene.add(this.group);
  }

  private addVolumeIcon(): void {
    // Create a temporary img element to load the SVG
    const img = new Image();
    img.onload = () => {
      // Create a canvas to render the SVG at high resolution
      const canvas = document.createElement('canvas');
      // Use higher resolution for sharper rendering
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Use crisp rendering for SVG
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the SVG to canvas at high resolution
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Create texture from the high-res canvas
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      // Use appropriate texture filtering
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = this.world.maxAnisotropy;

      const iconSize = Math.min(this.width, this.height) * 0.5;
      const iconGeometry = new THREE.PlaneGeometry(iconSize, iconSize);
      const iconMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
      });

      this.iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);

      // Position icon on front face
      this.iconMesh.position.set(0, 0, this.depth / 2 + 0.01);
      this.group.add(this.iconMesh);
    };

    // Load the SVG
    img.src = '/volume.svg';
  }

  private createVolumeName(): void {
    const canvas = document.createElement('canvas');

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const textWidth = this.width * 0.8;
    const textHeight = this.height * 0.2;
    const textGeometry = new THREE.PlaneGeometry(textWidth, textHeight);
    const textMesh = new THREE.Mesh(textGeometry, material);

    // Position text on right side near top
    textMesh.position.set(this.width / 2 + 0.01, this.height * 0.8, 0);
    textMesh.rotation.y = Math.PI / 2; // Rotate to face right

    this.group.add(textMesh);
  }

  onUpdate(delta: number): void {}
}
