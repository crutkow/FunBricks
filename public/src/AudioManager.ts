export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();

  async load(manifestPath: string = '/assets.json'): Promise<void> {
    const response = await fetch(manifestPath);
    if (!response.ok) {
      throw new Error(`Failed to load audio manifest from ${manifestPath}`);
    }
    const assets = await response.json();
    const list = (assets as any).sounds || [];
    const promises: Promise<void>[] = [];

    for (const s of list) {
      const p = new Promise<void>((resolve) => {
        const audio = new Audio(s.file);
        audio.preload = 'auto';
        const onDone = () => resolve();
        audio.addEventListener('canplaythrough', onDone, { once: true });
        audio.addEventListener('error', onDone, { once: true });
        try {
          audio.load();
        } catch (e) {
          resolve();
        }
        this.sounds.set(s.name, audio);
      });
      promises.push(p);
    }

    await Promise.all(promises);
  }

  play(name: string): void {
    const audio = this.sounds.get(name);
    if (!audio) return;
    try {
      audio.currentTime = 0;
      void audio.play();
    } catch (e) {
      // ignore play errors (autoplay policy, etc.)
    }
  }

  get(name: string): HTMLAudioElement | undefined {
    return this.sounds.get(name);
  }
}
