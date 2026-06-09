/**
 * Tracks keyboard and pointer state for the game.
 * Supports both keyboard (arrows / A-D / space) and mouse/pointer control.
 */
export class Input {
  left = false;
  right = false;

  /** Absolute pointer x within the canvas, or null if pointer not used yet. */
  pointerX: number | null = null;

  /** Set true for one frame when launch is requested (space / click). */
  private launchRequested = false;

  constructor(private target: HTMLElement) {
    this.attach();
  }

  private attach(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.target.addEventListener('pointermove', this.onPointerMove);
    this.target.addEventListener('pointerdown', this.onPointerDown);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('pointermove', this.onPointerMove);
    this.target.removeEventListener('pointerdown', this.onPointerDown);
  }

  /** Returns true once per launch request, then clears the flag. */
  consumeLaunch(): boolean {
    if (this.launchRequested) {
      this.launchRequested = false;
      return true;
    }
    return false;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.left = true;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.right = true;
        break;
      case ' ':
      case 'Spacebar':
        this.launchRequested = true;
        e.preventDefault();
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.left = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.right = false;
        break;
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    const rect = this.target.getBoundingClientRect();
    this.pointerX = e.clientX - rect.left;
  };

  private onPointerDown = (e: PointerEvent): void => {
    const rect = this.target.getBoundingClientRect();
    this.pointerX = e.clientX - rect.left;
    this.launchRequested = true;
  };
}
