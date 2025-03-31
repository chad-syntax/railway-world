import * as THREE from 'three';
import { WorldObject } from './WorldObject';
import { World } from './World';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

type PlayerConstructorOptions = {
  world: World;
};

export class Player extends WorldObject {
  public camera: THREE.PerspectiveCamera;
  private static readonly PLAYER_HEIGHT = 1.7; // Average human height in meters

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

    // Extend controls to add update method
    this.controls.update = this.updateControls;
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
  }
}
