export class InputManager {
  private keyStates: Map<string, boolean> = new Map();
  private trackedKeys = ['ArrowLeft', 'ArrowRight', 'a', 'd', 'r', 'R', ' ', 'Enter'];

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.trackedKeys.includes(e.key)) {
      this.keyStates.set(e.key.toLowerCase(), true);
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (this.trackedKeys.includes(e.key)) {
      this.keyStates.set(e.key.toLowerCase(), false);
    }
  };

  constructor() {
    // Initialize all tracked keys to false
    this.trackedKeys.forEach(key => this.keyStates.set(key.toLowerCase(), false));

    // Attach event listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  getInputVector(): { left: boolean; right: boolean } {
    const left = this.keyStates.get('arrowleft') || this.keyStates.get('a') || false;
    const right = this.keyStates.get('arrowright') || this.keyStates.get('d') || false;

    return { left, right };
  }

  isKeyPressed(key: string): boolean {
    return this.keyStates.get(key.toLowerCase()) || false;
  }

  cleanup(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
