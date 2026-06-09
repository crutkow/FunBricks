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
    // Brick colors: 118x59 each
    this.sprites.set('brick-red', { name: 'brick-red', x: 43, y: 125, width: 118, height: 59 });
    this.sprites.set('brick-orange', { name: 'brick-orange', x: 184, y: 125, width: 118, height: 59 });
    this.sprites.set('brick-yellow', { name: 'brick-yellow', x: 326, y: 125, width: 118, height: 59 });
    this.sprites.set('brick-green', { name: 'brick-green', x: 466, y: 125, width: 118, height: 59 });
    this.sprites.set('brick-cyan', { name: 'brick-cyan', x: 43, y: 260, width: 118, height: 59 });
    this.sprites.set('brick-blue', { name: 'brick-blue', x: 184, y: 260, width: 118, height: 59 });
    this.sprites.set('brick-purple', { name: 'brick-purple', x: 326, y: 260, width: 118, height: 59 });
    this.sprites.set('brick-magenta', { name: 'brick-magenta', x: 466, y: 260, width: 118, height: 59 });

    // Paddles: 172x48 and 276x48
    this.sprites.set('paddle-normal', { name: 'paddle-normal', x: 867, y: 148, width: 170, height: 48 });
    this.sprites.set('paddle-long', { name: 'paddle-long', x: 1084, y: 148, width: 276, height: 48 });

    // Ball: 42x42
    this.sprites.set('ball', { name: 'ball', x: 882, y: 377, width: 42, height: 42 });

    // Heart: 35x35
    this.sprites.set('heart', { name: 'heart', x: 1073, y: 481, width: 35, height: 35 });

    // Speed arrow: 35x35
    this.sprites.set('speed', { name: 'speed', x: 1205, y: 481, width: 35, height: 35 });

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
