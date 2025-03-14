import { v4 as uuidv4 } from 'uuid';
import { World } from './World';

type WorldObjectConstructorOptions = {
  name: string;
  world: World;
  x: number;
  y: number;
  z: number;
};

export abstract class WorldObject {
  public world: World;
  public name: string;
  public id: string;
  public x: number;
  public y: number;
  public z: number;

  abstract onUpdate(delta: number): void;

  constructor(options: WorldObjectConstructorOptions) {
    const { name, world, x, y, z } = options;

    this.world = world;
    this.name = name;
    this.id = uuidv4();
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
