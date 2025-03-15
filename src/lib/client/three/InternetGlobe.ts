import * as THREE from 'three';
import { ServiceStructure } from './ServiceStructure';
import { World } from './World';
import { WorldObject, Position } from './WorldObject';

type InternetGlobeConstructorOptions = {
  name: string;
  world: World;
  position: Position;
  domains: string[]; // Changed to array of domains
  serviceStructureId: string; // ID of the service structure this globe is connected to
};

export class InternetGlobe extends WorldObject {
  private globe!: THREE.Mesh; // Using the definite assignment assertion
  private domainText: THREE.Object3D[] = [];
  private domains: string[];
  private globeRadius = 1.5;
  private globeHeight = 1.5; // Equal to globeRadius so bottom of globe rests on ground level

  constructor(options: InternetGlobeConstructorOptions) {
    super(options);

    const { domains } = options;

    this.domains = domains;

    // Create the globe mesh (World Wide Web style)
    this.createGlobe();

    // Create text around the equator
    this.createDomainText();

    // Position the globe at ground level
    this.group.position.set(this.position.x, this.globeHeight, this.position.z);

    // Add the group to the scene
    this.world.scene.add(this.group);

    // Create sprite text above the globe
    this.createLabel('Internet', {
      x: 0,
      y: this.globeRadius + 0.5,
      z: 0,
    });
  }

  private createGlobe(): void {
    // Create a sphere for the globe
    const geometry = new THREE.SphereGeometry(this.globeRadius, 32, 32);

    // Create a material with wireframe to look like the "World Wide Web" icon
    const material = new THREE.MeshStandardMaterial({
      color: 0x3498db, // Blue color
      wireframe: true, // Make it a wireframe
      emissive: 0x3498db, // Add a slight glow
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.8,
    });

    // Create a solid inner sphere for better appearance
    const innerGeometry = new THREE.SphereGeometry(
      this.globeRadius * 0.95,
      32,
      32
    );
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });

    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);

    // Create the globe mesh
    this.globe = new THREE.Mesh(geometry, material);
    this.globe.castShadow = true;
    this.globe.receiveShadow = true;

    // Add both spheres to the group
    this.group.add(this.globe);
    this.group.add(innerSphere);
  }

  private createDomainText(): void {
    // Only show the first domain if there are multiple
    const displayText = this.domains.join(' | ');
    if (!displayText) return;

    // Create a canvas texture for the text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    // Size the canvas appropriately
    canvas.width = 4096;
    canvas.height = 256;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#00008B';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Set up text style
    context.font = '96px monospace';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Add a subtle shadow for better visibility
    context.shadowColor = 'rgba(0, 0, 0, 0.5)';
    context.shadowBlur = 4;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    // Draw the text
    context.fillText(displayText, canvas.width / 2, canvas.height / 2);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create material with the texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Create a ring around the equator
    const ringGeometry = new THREE.CylinderGeometry(
      this.globeRadius + 0.05, // radiusTop
      this.globeRadius + 0.05, // radiusBottom
      0.3, // height
      32, // radialSegments
      1, // heightSegments
      true // openEnded
    );

    const ring = new THREE.Mesh(ringGeometry, material);
    ring.rotation.y = Math.PI / 2; // Rotate to align with equator

    // Add to group and track for rotation updates
    this.group.add(ring);
    this.domainText.push(ring);
  }

  // The globe should slowly rotate
  onUpdate(delta: number): void {
    if (this.globe) {
      // Rotate around Y axis
      this.globe.rotation.y += delta * 0.25;

      // Update the domain text rotation to remain visible
      this.domainText.forEach((text) => {
        // This keeps the text facing the camera by counteracting the globe's rotation
        text.rotation.y = -(this.globe.rotation.y * 2);
      });
    }
  }
}
