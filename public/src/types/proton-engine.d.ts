declare module 'proton-engine' {
  export class Proton {
    constructor();
    addEmitter(emitter: Emitter): void;
    addRenderer(renderer: CanvasRenderer): void;
    update(): void;
    fps?: number;
  }

    export class Emitter {
    constructor();
    p: { x: number; y: number };
    rate: Rate;
    addInitialize(init: any): void;
    addBehaviour(behaviour: any): void;
    emit(totalEmitTimes?: number | string, life?: number | string): void;
    stopEmit(): void;
    removeAllParticles(): void;
    preEmit?: (callback: () => void) => void;
  }

    export class Rate {
    constructor(numpan: Span | number, timepan?: Span | number);
  }

  export class Span {
    constructor(min: number, max?: number, center?: boolean);
  }

  export class Radius {
    constructor(min: number, max: number);
  }

  export class Life {
    constructor(min: number, max: number);
  }

  export class Velocity {
    constructor(
      speed: number,
      angle: Span,
      type?: 'polar' | 'cartesian'
    );
  }

  export class Color {
    constructor(color1: string, color2?: string);
  }

  export class Alpha {
    constructor(start: number, end: number);
  }

  export class CanvasRenderer {
    constructor(canvas: HTMLCanvasElement);
  }

  export default Proton;
}

