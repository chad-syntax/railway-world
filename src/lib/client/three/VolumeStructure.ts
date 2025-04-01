import * as THREE from 'three';
import { Volume } from '../../types';
import { World } from './World';
import { WorldObject, Position } from './WorldObject';
import {
  VOLUME_LIGHT_GRAY,
  VOLUME_RED,
  VOLUME_YELLOW,
  VOLUME_GREEN,
  VOLUME_BLACK,
  UI_WHITE_HEX,
} from '../../../lib/colors';

type VolumeStructureOptions = {
  name: string;
  world: World;
  volume: Volume;
  position: Position;
};

export class VolumeStructure extends WorldObject {
  public volume: Volume;
  private color: number = VOLUME_LIGHT_GRAY;
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
      this.usage > 0.8
        ? VOLUME_RED
        : this.usage > 0.5
        ? VOLUME_YELLOW
        : VOLUME_GREEN;

    this.createVolume();
    this.addVolumeIcon();
    this.createLabel(
      this.volume.name,
      {
        x: 0,
        y: this.height + 0.25,
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
      color: VOLUME_BLACK,
      wireframe: true,
      wireframeLinewidth: 2,
      transparent: true,
      opacity: 0.8,
    });

    this.wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);
    this.wireframeMesh.position.y = this.height / 2;
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

    const { texture } = this.createTextTexture(
      `${Math.round(this.volume.currentSizeMB)} / ${this.volume.sizeMB}mb`,
      {
        fontSize: 128,
        fontWeight: 'lighter',
        canvasWidth: 1024,
        canvasHeight: 1024,
        strokeWidth: 6,
      }
    );

    const usageTextMaterial = new THREE.MeshBasicMaterial({
      map: texture,
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
    usageTextMesh.position.set(0, innerHeight + 0.002, 0); // Small offset to prevent z-fighting
    usageTextMesh.rotation.x = -Math.PI / 2; // Rotate to lay flat on top
    this.group.add(usageTextMesh);

    this.innerVolumeMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    // Position inner volume at bottom of wireframe
    this.innerVolumeMesh.position.y = innerHeight / 2 + 0.001;
    this.group.add(this.innerVolumeMesh);

    this.group.position.set(this.position.x, this.position.y, this.position.z);
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
      this.iconMesh.position.set(0, this.height / 2, this.depth / 2 + 0.01);
      this.group.add(this.iconMesh);
    };

    // Load the SVG
    img.src = '/volume.svg';
  }

  onUpdate(delta: number): void {}

  getInteractionText(): string {
    return `View ${this.volume.name} in Railway`;
  }

  onInteract(): void {
    this.world.unlockControls();

    const volumeUrl = `https://railway.com/project/${this.world.railwayData.projectId}/volume/${this.volume.id}/metrics?environmentId=${this.world.railwayData.environmentId}`;

    window.open(volumeUrl, '_blank');
  }
}
