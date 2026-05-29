export interface Sprite {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class SpriteManager {
  private image: HTMLImageElement | null = null;
  private sprites: Map<string, Sprite> = new Map();

  constructor() {
    this.initializeSprites();
  }

  private initializeSprites(): void {
    // Brick colors: 64x32 each
    this.sprites.set('brick-red', { name: 'brick-red', x: 0, y: 0, width: 64, height: 32 });
    this.sprites.set('brick-orange', { name: 'brick-orange', x: 64, y: 0, width: 64, height: 32 });
    this.sprites.set('brick-yellow', { name: 'brick-yellow', x: 128, y: 0, width: 64, height: 32 });
    this.sprites.set('brick-green', { name: 'brick-green', x: 192, y: 0, width: 64, height: 32 });
    this.sprites.set('brick-cyan', { name: 'brick-cyan', x: 256, y: 0, width: 64, height: 32 });
    this.sprites.set('brick-blue', { name: 'brick-blue', x: 320, y: 0, width: 64, height: 32 });
    this.sprites.set('brick-purple', { name: 'brick-purple', x: 384, y: 0, width: 64, height: 32 });
    this.sprites.set('brick-magenta', { name: 'brick-magenta', x: 448, y: 0, width: 64, height: 32 });

    // Paddles: 64x16 and 96x16
    this.sprites.set('paddle-normal', { name: 'paddle-normal', x: 0, y: 32, width: 64, height: 16 });
    this.sprites.set('paddle-long', { name: 'paddle-long', x: 64, y: 32, width: 96, height: 16 });

    // Ball: 16x16
    this.sprites.set('ball', { name: 'ball', x: 0, y: 48, width: 16, height: 16 });

    // Heart: 16x16
    this.sprites.set('heart', { name: 'heart', x: 16, y: 48, width: 16, height: 16 });

    // Speed arrow: 16x16
    this.sprites.set('speed', { name: 'speed', x: 32, y: 48, width: 16, height: 16 });

    // Multiplier 2x: 32x16
    this.sprites.set('mult-2x', { name: 'mult-2x', x: 48, y: 48, width: 32, height: 16 });
  }

  async load(path: string = '/sprite_sheet.png'): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load sprite sheet from ${path}`));
      };
      img.src = path;
    });
  }

  draw(
    ctx: CanvasRenderingContext2D,
    spriteName: string,
    x: number,
    y: number,
    scale: number = 1
  ): void {
    if (!this.image) {
      return;
    }

    const sprite = this.sprites.get(spriteName);
    if (!sprite) {
      console.warn(`Sprite not found: ${spriteName}`);
      return;
    }

    ctx.drawImage(
      this.image,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      x,
      y,
      sprite.width * scale,
      sprite.height * scale
    );
  }

  getSprite(name: string): Sprite | undefined {
    return this.sprites.get(name);
  }
}
