export type TimerOptions = {
  durationMs: number;

  /** Called frequently for UI updates */
  onTick?: (remainingMs: number) => void;

  /** Called exactly once when timer hits 0 */
  onComplete?: () => void;

  /** UI refresh rate (NOT time source) */
  tickRateMs?: number;

  /** Optional: use performance.now() instead of Date.now() (recommended) */
  useHighResolutionTime?: boolean;
};

export class CountdownTimer {
  private durationMs: number;
  private endTime = 0;

  private intervalId: number | null = null;

  private paused = false;
  private completed = false;

  private remainingOnPause = 0;

  private options: TimerOptions;

  private now: () => number;

  constructor(options: TimerOptions) {
    this.options = options;
    this.durationMs = options.durationMs;

    // High precision clock is better for UI timers
    this.now = options.useHighResolutionTime
      ? () => performance.now()
      : () => Date.now();
  }

  // -------------------------
  // CONTROL
  // -------------------------

  start(durationMs?: number) {
    this.stop();

    if (durationMs !== undefined) {
      this.durationMs = durationMs;
    }

    this.paused = false;
    this.completed = false;
    this.remainingOnPause = 0;

    this.endTime = this.now() + this.durationMs;

    this.startLoop();
  }

  pause() {
    if (this.paused || this.completed) return;

    this.remainingOnPause = this.getRemaining();
    this.paused = true;

    this.clearLoop();
  }

  resume() {
    if (!this.paused || this.completed) return;

    this.paused = false;
    this.endTime = this.now() + this.remainingOnPause;

    this.startLoop();
  }

  stop() {
    this.clearLoop();

    this.paused = false;
    this.completed = false;
    this.remainingOnPause = 0;
    this.endTime = 0;
  }

  reset(durationMs?: number) {
    this.stop();

    if (durationMs !== undefined) {
      this.durationMs = durationMs;
    }

    this.endTime = this.now() + this.durationMs;

    this.options.onTick?.(this.durationMs);
  }

  // -------------------------
  // STATE
  // -------------------------

  getRemaining(): number {
    if (this.paused) return this.remainingOnPause;
    if (this.endTime === 0) return 0;

    return Math.max(0, this.endTime - this.now());
  }

  isRunning(): boolean {
    return !this.paused && !this.completed && this.getRemaining() > 0;
  }

  isPaused(): boolean {
    return this.paused;
  }

  // -------------------------
  // LOOP
  // -------------------------

  private startLoop() {
    const tickRate = this.options.tickRateMs ?? 100;

    this.tick(); // immediate render

    this.intervalId = window.setInterval(() => {
      this.tick();
    }, tickRate);
  }

  private tick() {
    if (this.completed) return;

    const remaining = this.getRemaining();

    // Always clamp to zero for UI consistency
    const safeRemaining = Math.max(0, remaining);

    this.options.onTick?.(safeRemaining);

    if (safeRemaining <= 0) {
      this.completed = true;
      this.clearLoop();
      this.options.onComplete?.();
    }
  }

  private clearLoop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
