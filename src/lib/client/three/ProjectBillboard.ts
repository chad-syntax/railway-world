import { Billboard } from './Billboard';
import { World } from './World';
import { Position } from './WorldObject';
import * as THREE from 'three';
import { Team } from '../../types';
import {
  UI_DARK_BLUE_GRAY_HEX,
  UI_WHITE_HEX,
  UI_LIGHT_GRAY_HEX,
} from '../../../lib/colors';

type ProjectBillboardConstructorOptions = {
  name: string;
  world: World;
  position: Position;
  projectName: string;
  updatedAt: string;
  team: Team;
};

export class ProjectBillboard extends Billboard {
  private projectName: string;
  private updatedAt: string;
  private team: Team;

  constructor(options: ProjectBillboardConstructorOptions) {
    super({
      ...options,
      height: 15,
      width: 30,
    });

    const { projectName, updatedAt, team } = options;
    this.projectName = projectName;
    this.updatedAt = updatedAt;
    this.team = team;

    this.createBillboardContent();
  }

  loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  async loadImages(
    railwayIconUrl: string,
    teamAvatarUrl: string
  ): Promise<{
    railwayIcon: HTMLImageElement;
    teamAvatar: HTMLImageElement;
  }> {
    const [railwayIcon, teamAvatar] = await Promise.all([
      this.loadImage(railwayIconUrl),
      this.loadImage(teamAvatarUrl),
    ]);

    return { railwayIcon, teamAvatar };
  }

  createBillboardContent(): void {
    this.loadImages(
      '/api/icon?url=https://devicons.railway.com/i/railway-light.svg',
      `/api/icon?url=${encodeURIComponent(this.team.avatar)}`
    ).then(({ railwayIcon, teamAvatar }) => {
      // Create a canvas for the billboard content
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 2048;
      canvas.height = 1024;

      // Fill background (matching the panel color but slightly lighter)
      ctx.fillStyle = UI_DARK_BLUE_GRAY_HEX;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load Railway icon
      const iconSize = canvas.height * 0.2;

      // Draw icon
      ctx.drawImage(
        railwayIcon,
        canvas.width * 0.1, // x position
        canvas.height * 0.1, // y position
        iconSize,
        iconSize
      );

      // Configure text settings
      ctx.textAlign = 'left';
      ctx.fillStyle = UI_WHITE_HEX;

      // Draw project name
      ctx.font = '112px monospace';
      ctx.fillText(this.projectName, canvas.width * 0.23, canvas.height * 0.23);

      // draw team label
      ctx.font = '80px monospace';
      ctx.fillStyle = UI_LIGHT_GRAY_HEX;
      ctx.fillText('Team', canvas.width * 0.23, canvas.height * 0.48);

      // draw team name
      ctx.font = '80px monospace';
      ctx.fillStyle = UI_WHITE_HEX;
      ctx.fillText(this.team.name, canvas.width * 0.23, canvas.height * 0.58);

      // draw team avatar
      const avatarSize = canvas.height * 0.2;
      const avatarX = canvas.width * 0.1;
      const avatarY = canvas.height * 0.4;
      const radius = avatarSize / 2;

      // Save the current context state
      ctx.save();

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
      ctx.closePath();

      // Add a white border around the circle
      ctx.strokeStyle = UI_WHITE_HEX;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Clip and draw the image
      ctx.clip();
      ctx.drawImage(teamAvatar, avatarX, avatarY, avatarSize, avatarSize);

      // Restore the context state
      ctx.restore();

      // draw updated at
      const updatedAtText = `Project Last Updated: ${new Date(
        this.updatedAt
      ).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}`;

      ctx.font = '36px monospace';
      ctx.fillStyle = UI_LIGHT_GRAY_HEX;
      ctx.fillText(updatedAtText, canvas.width * 0.23, canvas.height * 0.85);

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // Create material with the texture
      const contentMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
      });

      // Create a plane slightly in front of the panel
      const contentGeometry = new THREE.PlaneGeometry(
        this.BILLBOARD_WIDTH - 1,
        this.BILLBOARD_HEIGHT - 1
      );
      const contentMesh = new THREE.Mesh(contentGeometry, contentMaterial);
      contentMesh.position.z = -0.26; // Slightly in front of the panel
      contentMesh.rotation.y = Math.PI; // Face the same way as the panel

      // Add to the billboard mesh
      this.group.add(contentMesh);
    });
  }

  onUpdate(delta: number): void {}

  getInteractionText(): string {
    return `View Project in Railway`;
  }

  onInteract(): void {
    this.world.unlockControls();

    const projectUrl = `https://railway.com/project/${this.world.railwayData.projectId}`;

    // open a link to the project
    window.open(projectUrl, '_blank');
  }
}
