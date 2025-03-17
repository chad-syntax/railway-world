import { v4 as uuidv4 } from 'uuid';
import { World } from './World';
import * as THREE from 'three';

export type Position = {
  x: number;
  y: number;
  z: number;
};

type WorldObjectConstructorOptions = {
  name: string;
  world: World;
  position: Position;
};

type CreateLabelOptions = {
  canvasWidth?: number;
  canvasHeight?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  color?: string;
  backgroundColor?: string;
};

const DEFAULT_LABEL_OPTIONS = {
  canvasWidth: 4096,
  canvasHeight: 256,
  fontSize: 96,
  fontFamily: 'monospace',
  fontWeight: 'normal',
  textAlign: 'center' as CanvasTextAlign,
  textBaseline: 'middle' as CanvasTextBaseline,
  color: '#ffffff',
};

export abstract class WorldObject {
  public group: THREE.Group = new THREE.Group();
  public world: World;
  public name: string;
  public id: string;
  public position: Position;

  abstract onUpdate(delta: number): void;

  constructor(options: WorldObjectConstructorOptions) {
    const { name, world, position } = options;

    this.world = world;
    this.name = name;
    this.id = uuidv4();
    this.position = position;
  }

  protected createLabel(
    text: string,
    position: Position,
    options: CreateLabelOptions = DEFAULT_LABEL_OPTIONS
  ): void {
    const {
      canvasWidth,
      canvasHeight,
      fontSize,
      fontFamily,
      fontWeight,
      textAlign,
      textBaseline,
      color,
      backgroundColor,
    } = options;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    canvas.width = canvasWidth || DEFAULT_LABEL_OPTIONS.canvasWidth;
    canvas.height = canvasHeight || DEFAULT_LABEL_OPTIONS.canvasHeight;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = color || '#ffffff';
    context.font = `${fontSize}px ${
      fontFamily || DEFAULT_LABEL_OPTIONS.fontFamily
    }`;
    context.textAlign = textAlign || DEFAULT_LABEL_OPTIONS.textAlign;
    context.textBaseline = textBaseline || DEFAULT_LABEL_OPTIONS.textBaseline;
    // Add text shadow if background color is provided

    // Add a black outline to the text for better visibility
    context.strokeStyle = '#000000';
    context.lineWidth = 4;
    context.lineJoin = 'round';

    // Draw the text outline first
    context.strokeText(text, canvas.width / 2, canvas.height / 2);

    // Reset fill style to original color for the main text
    context.fillStyle = color || '#ffffff';

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

    sprite.position.set(position.x, position.y, position.z);

    this.group.add(sprite);
  }
}
