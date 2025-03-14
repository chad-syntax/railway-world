// import * as THREE from 'three';
// import { Service } from './api';

// // Building types and their colors
// const BUILDING_TYPES = {
//   nodejs: 0x68a063, // Node.js green
//   postgres: 0x336791, // Postgres blue
//   redis: 0xd82c20, // Redis red
//   default: 0xaaaaaa, // Default gray
// };

// // Create a text sprite for service name
// function createTextSprite(text: string): THREE.Sprite {
//   const canvas = document.createElement('canvas');
//   const context = canvas.getContext('2d')!;

//   canvas.width = 256;
//   canvas.height = 128;

//   context.font = '24px Arial';
//   context.fillStyle = 'white';
//   context.textAlign = 'center';
//   context.fillText(text, 128, 64);

//   const texture = new THREE.Texture(canvas);
//   texture.needsUpdate = true;

//   const material = new THREE.SpriteMaterial({ map: texture });
//   const sprite = new THREE.Sprite(material);
//   sprite.scale.set(5, 2.5, 1);

//   return sprite;
// }

// // Create a building for a service
// export function createBuilding(service: Service): THREE.Group {
//   const group = new THREE.Group();
//   group.userData.service = service;

//   // Get color based on service type
//   const color =
//     BUILDING_TYPES[service.type as keyof typeof BUILDING_TYPES] ||
//     BUILDING_TYPES.default;

//   // Building height based on service type (just for visual variety)
//   const height = 2 + Math.random() * 2;

//   // Create building geometry
//   const geometry = new THREE.BoxGeometry(3, height, 3);
//   const material = new THREE.MeshStandardMaterial({
//     color,
//     roughness: 0.7,
//     metalness: 0.2,
//   });

//   const building = new THREE.Mesh(geometry, material);
//   building.position.set(0, height / 2, 0);
//   building.castShadow = true;
//   building.receiveShadow = true;

//   // Create text sprite for service name
//   const nameSprite = createTextSprite(service.name);
//   nameSprite.position.set(0, height + 1, 0);

//   // Add building and name to group
//   group.add(building);
//   group.add(nameSprite);

//   // Position the entire group
//   group.position.set(service.x, 0, service.z);

//   return group;
// }

// // Create a connection between two service buildings
// export function createConnection(
//   fromBuilding: THREE.Group,
//   toBuilding: THREE.Group
// ): THREE.Line {
//   const fromPos = fromBuilding.position.clone();
//   const toPos = toBuilding.position.clone();

//   // Adjust positions to be slightly above ground level
//   fromPos.y = 0.5;
//   toPos.y = 0.5;

//   // Create line geometry
//   const geometry = new THREE.BufferGeometry().setFromPoints([fromPos, toPos]);

//   // Create line material
//   const material = new THREE.LineBasicMaterial({
//     color: 0xffffff,
//     opacity: 0.5,
//     transparent: true,
//     linewidth: 1,
//   });

//   return new THREE.Line(geometry, material);
// }

// // Create a moving block representing a request between services
// export function createRequestBlock(
//   fromBuilding: THREE.Group,
//   toBuilding: THREE.Group,
//   request: any
// ): THREE.Mesh {
//   // Create a small cube for the request
//   const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

//   // Color based on request method
//   let color = 0xffffff;
//   switch (request.method) {
//     case 'GET':
//       color = 0x4caf50;
//       break; // Green
//     case 'POST':
//       color = 0x2196f3;
//       break; // Blue
//     case 'PUT':
//       color = 0xff9800;
//       break; // Orange
//     case 'DELETE':
//       color = 0xf44336;
//       break; // Red
//     default:
//       color = 0x9c27b0;
//       break; // Purple
//   }

//   const material = new THREE.MeshStandardMaterial({
//     color,
//     emissive: color,
//     emissiveIntensity: 0.5,
//   });

//   const cube = new THREE.Mesh(geometry, material);

//   // Store request data in userData for later reference (e.g., for tooltips)
//   cube.userData.request = request;

//   // Position at the starting building
//   const fromPos = fromBuilding.position.clone();
//   fromPos.y = 2; // Slightly above the building
//   cube.position.copy(fromPos);

//   return cube;
// }

// // Animate a request block moving from one building to another
// export function animateRequest(
//   scene: THREE.Scene,
//   requestBlock: THREE.Mesh,
//   fromBuilding: THREE.Group,
//   toBuilding: THREE.Group,
//   duration: number = 2
// ): void {
//   const fromPos = fromBuilding.position.clone();
//   const toPos = toBuilding.position.clone();

//   // Set height for animation path (arc)
//   fromPos.y = 2;
//   toPos.y = 2;

//   const startTime = performance.now();

//   // Add to scene
//   scene.add(requestBlock);

//   // Animation function
//   function animate() {
//     const now = performance.now();
//     const elapsed = (now - startTime) / 1000; // seconds

//     if (elapsed < duration) {
//       // Calculate progress (0 to 1)
//       const progress = elapsed / duration;

//       // Linear interpolation between points
//       const x = fromPos.x + (toPos.x - fromPos.x) * progress;
//       const z = fromPos.z + (toPos.z - fromPos.z) * progress;

//       // Add arc for y-coordinate (highest at the middle)
//       const y = fromPos.y + Math.sin(progress * Math.PI) * 3;

//       // Update position
//       requestBlock.position.set(x, y, z);

//       // Continue animation
//       requestAnimationFrame(animate);
//     } else {
//       // Animation complete, remove the block
//       scene.remove(requestBlock);
//     }
//   }

//   // Start animation
//   animate();
// }
