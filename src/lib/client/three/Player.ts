import * as THREE from 'three';
import { WorldObject } from './WorldObject';
import { World } from './World';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { UI_WHITE } from '../../colors';

type PlayerConstructorOptions = {
  world: World;
};

export class Player extends WorldObject {
  public camera: THREE.PerspectiveCamera;
  private static readonly PLAYER_HEIGHT = 1.7; // Average human height in meters
  private static readonly INTERACTION_DISTANCE = 5.0; // Maximum distance for interaction

  // Movement speeds
  private static readonly NORMAL_SPEED = 30.0;
  private static readonly WALKING_SPEED = 5.0;
  private static readonly SNEAK_SPEED = 2.0;
  private static readonly FLYING_SNEAK_SPEED = 5.0;
  private static readonly NORMAL_VERTICAL_SPEED = 15.0;
  private static readonly SNEAK_VERTICAL_SPEED = 5.0;
  private static readonly PLAYER_GRAVITY_MULTIPLIER = 3;

  private controls: PointerLockControls;
  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();
  private moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    shift: false,
  };
  private SPEED = Player.NORMAL_SPEED;
  private VERTICAL_SPEED = Player.NORMAL_VERTICAL_SPEED;
  private JUMP_FORCE = 7;
  private isWalkingMode = false;
  private GRAVITY = 9.8;
  private isGrounded = false;
  private verticalVelocity = 0;

  // Interaction system
  private raycaster: THREE.Raycaster;
  private crosshair!: THREE.Group;
  private currentInteractable: WorldObject | null = null;
  private interactionPrompt: THREE.Sprite | null = null;

  constructor(options: PlayerConstructorOptions) {
    const { world } = options;
    super({
      name: 'Player',
      position: {
        x: 0,
        y: Player.PLAYER_HEIGHT,
        z: 0,
      },
      world,
    });

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, Player.PLAYER_HEIGHT, 20);

    this.controls = new PointerLockControls(
      this.camera,
      world.renderer.domElement
    );

    // Set up click listener to enable pointer lock
    document.addEventListener('click', () => {
      if (this.world.populated) {
        this.controls.lock();
      }
    });

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);

    window.addEventListener('resize', this.onResize);

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // Initialize interaction system
    this.raycaster = new THREE.Raycaster();
    this.createCrosshair();
    this.createInteractionPrompt();

    // Extend controls to add update method
    this.controls.update = this.updateControls;
  }

  private createCrosshair(): void {
    // Create a crosshair using thin planes
    const size = 0.1; // Small size
    const thickness = 0.01; // Line thickness

    // Create vertical line
    const verticalGeometry = new THREE.PlaneGeometry(thickness, size * 2);
    const horizontalGeometry = new THREE.PlaneGeometry(size * 2, thickness);

    const material = new THREE.MeshBasicMaterial({
      color: UI_WHITE,
      depthTest: false, // Don't test against depth buffer
      depthWrite: false, // Don't write to depth buffer
      transparent: true, // Make it transparent
      opacity: 0.65, // But fully opaque
    });

    // Create the crosshair by combining both lines
    this.crosshair = new THREE.Group();
    const verticalLine = new THREE.Mesh(verticalGeometry, material);
    const horizontalLine = new THREE.Mesh(horizontalGeometry, material);

    // Set render order on the lines
    verticalLine.renderOrder = 999;
    horizontalLine.renderOrder = 999;

    this.crosshair.add(verticalLine);
    this.crosshair.add(horizontalLine);

    // Add to player's group
    this.group.add(this.crosshair);

    // Make sure it's visible
    this.crosshair.renderOrder = 999;

    // Set initial position
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(this.camera.quaternion);
    this.crosshair.position.copy(this.camera.position);
    this.crosshair.position.add(forward.multiplyScalar(5));
  }

  private createInteractionPrompt(): void {
    // Create a canvas for the text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;

    // Clear the canvas with a transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Configure text settings
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw text with outline
    ctx.strokeText('Press E to interact', canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press E to interact', canvas.width / 2, canvas.height / 2);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Create sprite material
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });

    // Create sprite
    this.interactionPrompt = new THREE.Sprite(material);
    this.interactionPrompt.scale.set(2, 0.5, 1);
    this.interactionPrompt.visible = false;

    // Add to camera
    this.camera.add(this.interactionPrompt);
  }

  private updateInteraction(): void {
    if (!this.controls.isLocked) return;

    // Update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(new THREE.Vector2(), this.camera);

    // Find objects intersecting the ray
    const intersects = this.raycaster.intersectObjects(
      this.world.getScene().children,
      true
    );

    console.log(intersects);

    // Find the first intersected object that has an onInteract method
    const interactable = intersects.find((intersect) => {
      let currentObject: THREE.Object3D | null = intersect.object;
      while (currentObject && !(currentObject instanceof WorldObject)) {
        currentObject = currentObject.parent;
      }
      return (
        currentObject instanceof WorldObject && 'onInteract' in currentObject
      );
    });

    if (interactable) {
      let currentObject: THREE.Object3D | null = interactable.object;
      while (currentObject && !(currentObject instanceof WorldObject)) {
        currentObject = currentObject.parent;
      }
      if (
        currentObject instanceof WorldObject &&
        'onInteract' in currentObject
      ) {
        this.currentInteractable = currentObject;
        if (this.interactionPrompt) {
          this.interactionPrompt.visible = true;
          // Position the prompt slightly above the crosshair
          this.interactionPrompt.position.set(0, 0.1, -0.1);
        }
      }
    } else {
      this.currentInteractable = null;
      if (this.interactionPrompt) {
        this.interactionPrompt.visible = false;
      }
    }
  }

  private handleInteraction(): void {
    if (this.currentInteractable && 'onInteract' in this.currentInteractable) {
      (this.currentInteractable as any).onInteract();
    }
  }

  private updateControls = (delta: number) => {
    if (!this.controls.isLocked) return;

    // Calculate movement direction
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;

    this.direction.z =
      Number(this.moveState.forward) - Number(this.moveState.backward);
    this.direction.x =
      Number(this.moveState.right) - Number(this.moveState.left);
    this.direction.y = Number(this.moveState.up) - Number(this.moveState.down);
    this.direction.normalize();

    if (this.moveState.shift) {
      this.SPEED = this.isWalkingMode
        ? Player.SNEAK_SPEED
        : Player.FLYING_SNEAK_SPEED;
    } else {
      this.SPEED = this.isWalkingMode
        ? Player.WALKING_SPEED
        : Player.NORMAL_SPEED;
    }

    if (this.moveState.shift) {
      this.VERTICAL_SPEED = Player.SNEAK_VERTICAL_SPEED;
    } else {
      this.VERTICAL_SPEED = Player.NORMAL_VERTICAL_SPEED;
    }

    // Handle gravity and ground collision in walking mode
    if (this.isWalkingMode) {
      // Apply gravity
      this.verticalVelocity -=
        this.GRAVITY * (delta * Player.PLAYER_GRAVITY_MULTIPLIER);

      // Check for ground collision
      if (
        this.camera.position.y + this.verticalVelocity * delta <=
        Player.PLAYER_HEIGHT
      ) {
        this.camera.position.y = Player.PLAYER_HEIGHT;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      } else {
        this.isGrounded = false;
      }

      // Apply vertical movement
      this.camera.position.y += this.verticalVelocity * delta;
    } else {
      // Normal flying mode
      if (this.moveState.up || this.moveState.down) {
        this.velocity.y = this.direction.y * this.VERTICAL_SPEED * delta;
        this.camera.position.y += this.velocity.y;
      }
    }

    // Apply horizontal movement
    if (this.moveState.forward || this.moveState.backward) {
      this.velocity.z = this.direction.z * this.SPEED * delta;
    }
    if (this.moveState.left || this.moveState.right) {
      this.velocity.x = this.direction.x * this.SPEED * delta;
    }

    // Move the camera
    this.controls.moveRight(this.velocity.x);
    this.controls.moveForward(this.velocity.z);

    // Update crosshair to be 5 units in front of camera's direction
    if (this.crosshair) {
      // Get camera's forward direction
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(this.camera.quaternion);

      // Calculate position 5 units in front
      this.crosshair.position.copy(this.camera.position);
      this.crosshair.position.add(forward.multiplyScalar(5));

      // Make crosshair face camera
      this.crosshair.lookAt(this.camera.position);
    }
  };

  private toggleMode = () => {
    this.isWalkingMode = !this.isWalkingMode;
    this.SPEED = this.isWalkingMode
      ? Player.WALKING_SPEED
      : Player.NORMAL_SPEED;
    // Reset vertical velocity when switching modes
    this.verticalVelocity = 0;

    // Update UI
    const flyingPanel = document.querySelector('.flying-mode');
    const walkingPanel = document.querySelector('.walking-mode');
    if (flyingPanel && walkingPanel) {
      flyingPanel.classList.toggle('hidden', this.isWalkingMode);
      walkingPanel.classList.toggle('hidden', !this.isWalkingMode);
    }
  };

  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
        this.moveState.forward = true;
        break;
      case 'KeyS':
        this.moveState.backward = true;
        break;
      case 'KeyA':
        this.moveState.left = true;
        break;
      case 'KeyD':
        this.moveState.right = true;
        break;
      case 'KeyQ':
        // Toggle between walking and flying modes
        this.toggleMode();
        break;
      case 'Space':
        if (this.isWalkingMode && this.isGrounded) {
          // Jump in walking mode
          this.verticalVelocity = this.JUMP_FORCE;
          this.isGrounded = false;
        } else if (!this.isWalkingMode) {
          // Normal flying mode
          this.moveState.up = true;
        }
        break;
      case 'ControlLeft':
      case 'ControlRight':
        this.moveState.down = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.moveState.shift = true;
        break;
      case 'KeyE':
        this.handleInteraction();
        break;
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'KeyW':
        this.moveState.forward = false;
        break;
      case 'KeyS':
        this.moveState.backward = false;
        break;
      case 'KeyA':
        this.moveState.left = false;
        break;
      case 'KeyD':
        this.moveState.right = false;
        break;
      case 'Space':
        this.moveState.up = false;
        break;
      case 'ControlLeft':
      case 'ControlRight':
        this.moveState.down = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.moveState.shift = false;
        break;
    }
  };

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

  onUpdate(delta: number) {
    this.controls.update(delta);
    this.updateInteraction();
  }
}
