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
  strokeColor?: string;
  strokeWidth?: number;
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
  backgroundColor: undefined,
  strokeColor: '#000000',
  strokeWidth: 4,
};

type CreateTextTextureOptions = {
  canvasWidth?: number;
  canvasHeight?: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  color?: string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
};

const DEFAULT_TEXT_TEXTURE_OPTIONS = {
  canvasWidth: 256,
  canvasHeight: 256,
  fontSize: 24,
  fontWeight: 'normal',
  fontFamily: 'monospace',
  textAlign: 'center' as CanvasTextAlign,
  textBaseline: 'middle' as CanvasTextBaseline,
  color: '#ffffff',
  backgroundColor: undefined,
  strokeColor: '#000000',
  strokeWidth: 4,
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
      canvasWidth = DEFAULT_LABEL_OPTIONS.canvasWidth,
      canvasHeight = DEFAULT_LABEL_OPTIONS.canvasHeight,
      fontSize = DEFAULT_LABEL_OPTIONS.fontSize,
      fontFamily = DEFAULT_LABEL_OPTIONS.fontFamily,
      fontWeight = DEFAULT_LABEL_OPTIONS.fontWeight,
      textAlign = DEFAULT_LABEL_OPTIONS.textAlign,
      textBaseline = DEFAULT_LABEL_OPTIONS.textBaseline,
      color = DEFAULT_LABEL_OPTIONS.color,
      backgroundColor = DEFAULT_LABEL_OPTIONS.backgroundColor,
      strokeColor = DEFAULT_LABEL_OPTIONS.strokeColor,
      strokeWidth = DEFAULT_LABEL_OPTIONS.strokeWidth,
    } = options;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    if (backgroundColor) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    context.fillStyle = color;
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    context.textAlign = textAlign;
    context.textBaseline = textBaseline;

    // Add a black outline to the text for better visibility
    context.strokeStyle = strokeColor;
    context.lineWidth = strokeWidth;
    context.lineJoin = 'round';

    // Draw the text outline first
    context.strokeText(text, canvas.width / 2, canvas.height / 2);

    // Reset fill style to original color for the main text
    context.fillStyle = color;

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

  createTextTexture(
    text: string | string[],
    options: CreateTextTextureOptions = DEFAULT_TEXT_TEXTURE_OPTIONS
  ) {
    const {
      canvasWidth = DEFAULT_TEXT_TEXTURE_OPTIONS.canvasWidth,
      canvasHeight = DEFAULT_TEXT_TEXTURE_OPTIONS.canvasHeight,
      fontSize = DEFAULT_TEXT_TEXTURE_OPTIONS.fontSize,
      fontWeight = DEFAULT_TEXT_TEXTURE_OPTIONS.fontWeight,
      fontFamily = DEFAULT_TEXT_TEXTURE_OPTIONS.fontFamily,
      textAlign = DEFAULT_TEXT_TEXTURE_OPTIONS.textAlign,
      textBaseline = DEFAULT_TEXT_TEXTURE_OPTIONS.textBaseline,
      color = DEFAULT_TEXT_TEXTURE_OPTIONS.color,
      backgroundColor = DEFAULT_TEXT_TEXTURE_OPTIONS.backgroundColor,
      strokeColor = DEFAULT_TEXT_TEXTURE_OPTIONS.strokeColor,
      strokeWidth = DEFAULT_TEXT_TEXTURE_OPTIONS.strokeWidth,
    } = options;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    if (backgroundColor) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    context.fillStyle = color;
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    context.textAlign = textAlign;
    context.textBaseline = textBaseline;

    context.strokeStyle = strokeColor;
    context.lineWidth = strokeWidth;
    context.lineJoin = 'round';

    const lines = Array.isArray(text) ? text : [text];

    lines.forEach((line, index) => {
      context.strokeText(
        line,
        canvas.width / 2,
        canvas.height / 2 + index * fontSize
      );

      context.fillText(
        line,
        canvas.width / 2,
        canvas.height / 2 + index * fontSize
      );
    });

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return {
      texture,
    };
  }
}
