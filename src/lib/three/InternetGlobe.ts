import * as THREE from 'three';
import { Building } from './Building';
import { World } from './World';
import { WorldObject } from './WorldObject';

type InternetGlobeConstructorOptions = {
  name: string;
  world: World;
  x: number;
  y: number;
  z: number;
  domains: string[]; // Changed to array of domains
  buildingId: string; // ID of the building to connect to
};

export class InternetGlobe extends WorldObject {
  private group: THREE.Group;
  private globe!: THREE.Mesh; // Using the definite assignment assertion
  private domainText: THREE.Object3D[] = [];
  private connectionLine: THREE.Mesh | null = null; // Changed to Mesh for TubeGeometry
  private domains: string[];
  private buildingId: string;
  private globeRadius = 1.5;
  private globeHeight = 6; // Height above ground

  constructor(options: InternetGlobeConstructorOptions) {
    super(options);

    const { domains, buildingId } = options;

    this.domains = domains;
    this.buildingId = buildingId;

    this.group = new THREE.Group();

    // Create the globe mesh (World Wide Web style)
    this.createGlobe();

    // Create text around the equator
    this.createDomainText();

    // Create the connection line to the building
    this.createConnectionLine();

    // Create sprite text above the globe
    this.createLabel();

    // Position the globe
    this.group.position.set(this.x, this.globeHeight, this.z);

    // Add the group to the scene
    this.world.scene.add(this.group);
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

  private createLabel(): void {
    const text = 'Public Networking';

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    canvas.width = 4096;
    canvas.height = 256;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#ffffff';
    context.font = '96px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create the texture and adjust settings for sharper rendering
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter; // Avoid mipmapping for text
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false; // Disable mipmaps for text textures

    // Create the sprite material with appropriate settings
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false, // Avoid z-fighting artifacts
      sizeAttenuation: true, // Scale with distance
    });

    const sprite = new THREE.Sprite(material);

    // Calculate appropriate scale based on canvas dimensions
    const scaleX = canvas.width / 200;
    const scaleY = canvas.height / 200;
    sprite.scale.set(scaleX, scaleY, 1);

    sprite.position.set(0, this.globeRadius + 0.5, 0);

    this.group.add(sprite);
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

  private createConnectionLine(): void {
    // Simply call our shared method
    this.updateOrCreateConnectionLine();
  }

  private updateConnectionLine(): void {
    if (this.connectionLine) {
      // Only remove the existing line when updating
      this.group.remove(this.connectionLine);
      this.connectionLine = null;

      // Create a new line
      this.updateOrCreateConnectionLine();
    }
  }

  private updateOrCreateConnectionLine(): void {
    // Find the target building
    const targetBuilding = this.world.objects.get(this.buildingId) as
      | Building
      | undefined;

    if (targetBuilding) {
      // Create a curved line connecting the globe to the building
      // Use the bottom of the globe as the starting point rather than the center
      const points = this.generateCurvedLinePath(
        new THREE.Vector3(0, -this.globeRadius, 0), // Bottom of the globe (local coordinates)
        new THREE.Vector3(
          targetBuilding.x - this.x,
          -this.globeHeight + 1.5, // Just a bit above ground level
          targetBuilding.z - this.z - 1.5 // Behind the building
        )
      );

      // Create a smooth curve from the points
      const curve = new THREE.CatmullRomCurve3(points);

      // Create a tube geometry along the curve
      const tubeGeometry = new THREE.TubeGeometry(
        curve,
        64, // tubularSegments - increase for smoother tube
        0.02, // radius - controls the thickness
        8, // radiusSegments - controls the roundness of the tube
        false // closed
      );

      // Create material for the tube
      const tubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0.9,
        emissive: 0x3498db,
        emissiveIntensity: 0.3, // Slight glow
        roughness: 0.4,
        metalness: 0.6,
      });

      // Create the mesh with the tube geometry
      this.connectionLine = new THREE.Mesh(tubeGeometry, tubeMaterial);
      this.connectionLine.castShadow = true;
      this.group.add(this.connectionLine);
    }
  }

  private generateCurvedLinePath(
    start: THREE.Vector3,
    end: THREE.Vector3
  ): THREE.Vector3[] {
    // Create a curved path between the two points
    const curvePoints = [];
    const numPoints = 30; // More points for smoother curve

    // First, create two control points to have better control over the curve
    // First control point - back of the building, going straight back
    const controlPoint1 = new THREE.Vector3(
      end.x, // Same X as building connection point
      end.y, // Same Y as building connection point
      end.z - 3 // Further back from the building
    );

    // Second control point - below the globe, going up
    const controlPoint2 = new THREE.Vector3(
      start.x, // Same X as globe
      -this.globeHeight + 0.5, // Low point, just above ground
      end.z - 1.5 // Still behind, but closer to globe
    );

    // Create a cubic bezier curve with two control points for more control
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;

      // Use a cubic Bezier curve with 2 control points
      // For a more controlled path from building -> back -> up -> globe
      const point = new THREE.Vector3(
        this.cubicBezier(end.x, controlPoint1.x, controlPoint2.x, start.x, t),
        this.cubicBezier(end.y, controlPoint1.y, controlPoint2.y, start.y, t),
        this.cubicBezier(end.z, controlPoint1.z, controlPoint2.z, start.z, t)
      );

      curvePoints.push(point);
    }

    return curvePoints;
  }

  // Add cubic bezier function for more control over the curve
  private cubicBezier(
    p0: number, // Starting point (building)
    p1: number, // First control point
    p2: number, // Second control point
    p3: number, // End point (globe)
    t: number
  ): number {
    return (
      Math.pow(1 - t, 3) * p0 +
      3 * Math.pow(1 - t, 2) * t * p1 +
      1.05 * (1 - t) * t * t * p2 +
      Math.pow(t, 3) * p3
    );
  }

  private quadraticBezier(
    p0: number,
    p1: number,
    p2: number,
    t: number
  ): number {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
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

      // Update the connection line if building position changes
      this.updateConnectionLine();
    }
  }
}
