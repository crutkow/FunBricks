import { GameState } from '../state/GameState';

export class HudRenderer {
  render(ctx: CanvasRenderingContext2D, state: GameState, width: number, height: number): void {
    ctx.save();
    ctx.fillStyle = '#f5f7fb';
    ctx.font = 'bold 20px Segoe UI, system-ui, sans-serif';
    ctx.fillText(`Score: ${state.score}`, 20, 32);
    ctx.fillText(`Lives: ${state.lives}`, 200, 32);
    ctx.fillText(`Level: ${state.level}`, 340, 32);

    if (state.status === 'ready') {
      this.drawCenteredText(ctx, width, height, 'Click or press Space to launch');
    } else if (state.status === 'paused') {
      this.drawCenteredText(ctx, width, height, 'Paused');
    } else if (state.status === 'won') {
      this.drawCenteredText(ctx, width, height, 'You Win! Click to restart');
    } else if (state.status === 'lost') {
      this.drawCenteredText(ctx, width, height, 'Game Over - Click to restart');
    }

    ctx.restore();
  }

  private drawCenteredText(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    text: string
  ): void {
    ctx.save();
    ctx.fillStyle = '#9bb4d7';
    ctx.font = '24px Segoe UI, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, width / 2, height / 2);
    ctx.restore();
  }
}
