export class InputManager {
  private keys = new Set<string>();
  private pointerX = 0;
  private launchQueued = false;

  constructor(private readonly target: HTMLElement) {}

  bind(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.target.addEventListener('pointermove', this.onPointerMove);
    this.target.addEventListener('pointerdown', this.onPointerDown);
  }

  unbind(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('pointermove', this.onPointerMove);
    this.target.removeEventListener('pointerdown', this.onPointerDown);
  }

  getHorizontalAxis(): number {
    const left = this.keys.has('ArrowLeft') || this.keys.has('a') || this.keys.has('A');
    const right = this.keys.has('ArrowRight') || this.keys.has('d') || this.keys.has('D');

    if (left && !right) return -1;
    if (right && !left) return 1;
    return 0;
  }

  getPointerX(): number {
    return this.pointerX;
  }

  consumeLaunchAction(): boolean {
    const shouldLaunch = this.launchQueued;
    this.launchQueued = false;
    return shouldLaunch;
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.key);

    if (event.key === ' ' || event.code === 'Space') {
      this.launchQueued = true;
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.key);
  };

  private onPointerMove = (event: PointerEvent): void => {
    const rect = this.target.getBoundingClientRect();
    this.pointerX = event.clientX - rect.left;
  };

  private onPointerDown = (event: PointerEvent): void => {
    this.onPointerMove(event);
    this.launchQueued = true;
  };
}
