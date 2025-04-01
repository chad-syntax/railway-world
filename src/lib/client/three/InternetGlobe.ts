import * as THREE from 'three';
import { ServiceStructure } from './ServiceStructure';
import { World } from './World';
import { WorldObject, Position } from './WorldObject';
import { CONNECTION_BLUE, UI_WHITE, COLOR_BLUE_HEX } from '../../../lib/colors';

type InternetGlobeConstructorOptions = {
  name: string;
  world: World;
  position: Position;
  domains: string[]; // Changed to array of domains
  serviceStructureId: string; // ID of the service structure this globe is connected to
  serviceId: string; // ID of the service this globe is connected to
};

export class InternetGlobe extends WorldObject {
  public domains: string[];
  public serviceId: string;

  private globe!: THREE.Mesh; // Using the definite assignment assertion
  private domainRing!: THREE.Object3D;
  private globeRadius = 3;

  constructor(options: InternetGlobeConstructorOptions) {
    super(options);

    const { domains, serviceId } = options;

    this.domains = domains;
    this.serviceId = serviceId;

    // Create the globe mesh (World Wide Web style)
    this.createGlobe();

    // Create text around the equator
    this.createDomainText();

    // Position the globe at ground level
    this.group.position.set(this.position.x, this.position.y, this.position.z);

    // Create sprite text above the globe
    this.createLabel(
      'Internet',
      {
        x: 0,
        y: this.globeRadius * 2 + 2,
        z: 0,
      },
      {
        fontSize: 256,
      }
    );
  }

  private createGlobe(): void {
    // Create a sphere for the globe
    const geometry = new THREE.SphereGeometry(this.globeRadius, 32, 32);

    // Create a material with wireframe to look like the "World Wide Web" icon
    const material = new THREE.MeshStandardMaterial({
      color: CONNECTION_BLUE, // Blue color
      wireframe: true, // Make it a wireframe
      emissive: CONNECTION_BLUE, // Add a slight glow
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
      color: UI_WHITE,
      transparent: true,
      opacity: 0.8,
    });

    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);

    innerSphere.position.y = this.globeRadius;

    // Create the globe mesh
    this.globe = new THREE.Mesh(geometry, material);
    this.globe.castShadow = true;
    this.globe.receiveShadow = true;
    this.globe.position.y = this.globeRadius;

    // Add both spheres to the group
    this.group.add(this.globe);
    this.group.add(innerSphere);
    this.group.rotation.y = -Math.PI / 2;
  }

  private createDomainText(): void {
    // Only show the first domain if there are multiple
    const displayText = this.domains.join(' | ');
    if (!displayText) return;

    const { texture } = this.createTextTexture(displayText, {
      fontSize: 48,
      canvasWidth: 2048,
      canvasHeight: 128,
      strokeWidth: 0,
      backgroundColor: COLOR_BLUE_HEX,
    });

    // Create material with the texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Create a ring around the equator
    const ringGeometry = new THREE.CylinderGeometry(
      this.globeRadius + 0.5, // radiusTop
      this.globeRadius + 0.5, // radiusBottom
      0.65, // height
      64, // radialSegments
      1, // heightSegments
      true // openEnded
    );

    this.domainRing = new THREE.Mesh(ringGeometry, material);
    this.domainRing.position.y = this.globeRadius;
    this.domainRing.rotation.y = Math.PI / 2; // Rotate to align with equator
    this.domainRing.rotation.x = -Math.PI / 36;

    // Add to group and track for rotation updates
    this.group.add(this.domainRing);
  }

  // The globe should slowly rotate
  onUpdate(delta: number): void {
    // rotate the globe (inner and outer)
    this.globe.rotation.y += delta * 0.25;

    // rotate the domain ring
    this.domainRing.rotation.y = -(this.globe.rotation.y * 2);

    // rotate the whole group slightly
    this.group.rotation.y += (-Math.PI / 36) * delta;
  }

  getInteractionText(): string {
    return `Visit ${this.domains[0]}`;
  }

  onInteract(): void {
    this.world.unlockControls();

    const domainUrl = `https://${this.domains[0]}`;

    window.open(domainUrl, '_blank');
  }
}
