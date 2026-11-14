type WaveformName = "sawtooth" | "square" | "sine" | "triangle";

const ORDER: readonly WaveformName[] = [
  "sawtooth",
  "square",
  "sine",
  "triangle",
];

const WIDTH = 1000;
const HEIGHT = 1000;
const MID_Y = HEIGHT * 0.5;
const AMP_Y = HEIGHT * 0.3;
const SQUARE_MARGIN = 1 / 16;
const SINE_STEPS = 128;

const INITIAL_HOLD_MS = 2400;
const HOLD_MS = 3800;
const HALF_CYCLE_MS = 140;

type Point = readonly [x: number, y: number];

function buildWaveform(name: WaveformName): readonly Point[] {
  switch (name) {
    case "sawtooth":
      return [
        [0, 0],
        [0.5, 1],
        [0.5, -1],
        [1, 0],
      ];
    case "square":
      return [
        [0, -1],
        [SQUARE_MARGIN, -1],
        [SQUARE_MARGIN, 1],
        [0.5, 1],
        [0.5, -1],
        [1 - SQUARE_MARGIN, -1],
        [1 - SQUARE_MARGIN, 1],
        [1, 1],
      ];
    case "triangle":
      return [
        [0, -1],
        [1 / 3, 1],
        [2 / 3, -1],
        [1, 1],
      ];
    case "sine": {
      const pts: Point[] = [];
      for (let i = 0; i <= SINE_STEPS; i++) {
        const x = i / SINE_STEPS;
        pts.push([x, Math.sin(Math.PI * 2 * x)]);
      }
      return pts;
    }
  }
}

const WAVEFORMS: Record<WaveformName, readonly Point[]> = {
  sawtooth: buildWaveform("sawtooth"),
  square: buildWaveform("square"),
  sine: buildWaveform("sine"),
  triangle: buildWaveform("triangle"),
};

function toPathData(points: readonly Point[], amp: number): string {
  if (amp <= 0.0005) {
    return `M-2 ${MID_Y}L1002 ${MID_Y}L1002 1002L-2 1002Z`;
  }
  const scaledAmp = AMP_Y * amp;
  const y0 = (MID_Y - points[0][1] * scaledAmp).toFixed(1);
  let d = `M-2 ${y0}`;
  let lastY = y0;
  for (let i = 0; i < points.length; i++) {
    const sx = (points[i][0] * WIDTH).toFixed(1);
    const sy = (MID_Y - points[i][1] * scaledAmp).toFixed(1);
    d += `L${sx} ${sy}`;
    lastY = sy;
  }
  d += `L1002 ${lastY}L1002 1002L-2 1002Z`;
  return d;
}

export class ToneHeroWaveform extends HTMLElement {
  private pathEl: SVGPathElement | null = null;
  private index = 0;
  private amp = 1;
  private timerId: number | undefined;
  private rafId: number | undefined;
  private inView = true;
  private observer: IntersectionObserver | undefined;
  private reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  connectedCallback() {
    this.pathEl = this.querySelector("path");
    if (!this.pathEl) return;

    this.renderWaveform();
    this.addEventListener("click", this.handleClick);
    document.addEventListener("visibilitychange", this.handleVisibility);
    this.reducedMotion.addEventListener("change", this.handleVisibility);

    if ("IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(([entry]) => {
        this.inView = entry?.isIntersecting ?? true;
        this.syncSchedule();
      });
      this.observer.observe(this);
    }

    this.syncSchedule(INITIAL_HOLD_MS);
  }

  disconnectedCallback() {
    this.stopTimers();
    this.removeEventListener("click", this.handleClick);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    this.reducedMotion.removeEventListener("change", this.handleVisibility);
    this.observer?.disconnect();
  }

  private get shouldAutoPlay(): boolean {
    return this.inView && !document.hidden && !this.reducedMotion.matches;
  }

  private handleVisibility = () => {
    if (!this.shouldAutoPlay) {
      this.stopTimers();
      this.amp = 1;
      this.renderWaveform();
      return;
    }
    this.syncSchedule();
  };

  private handleClick = () => {
    if (this.reducedMotion.matches) {
      this.stopTimers();
      this.index = (this.index + 1) % ORDER.length;
      this.amp = 1;
      this.renderWaveform();
      return;
    }
    this.transitionToNext();
  };

  private syncSchedule(delay = HOLD_MS) {
    if (!this.shouldAutoPlay) return;
    if (this.timerId === undefined && this.rafId === undefined) {
      this.timerId = window.setTimeout(() => {
        this.timerId = undefined;
        this.transitionToNext();
      }, delay);
    }
  }

  private stopTimers() {
    if (this.timerId !== undefined) {
      clearTimeout(this.timerId);
      this.timerId = undefined;
    }
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }

  private transitionToNext() {
    this.stopTimers();
    const startAmp = this.amp;
    const inDuration = Math.max(40, HALF_CYCLE_MS * Math.sqrt(startAmp));
    const outDuration = HALF_CYCLE_MS;
    const start = performance.now();
    let swapped = false;

    // Single continuous cosine cycle: 1 → 0 (flat) → 1 as the next waveform
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < inDuration) {
        const u = elapsed / inDuration;
        this.amp = startAmp * 0.5 * (1 + Math.cos(Math.PI * u));
        this.renderWaveform();
        this.rafId = requestAnimationFrame(tick);
        return;
      }

      if (!swapped) {
        this.index = (this.index + 1) % ORDER.length;
        swapped = true;
      }

      const u = Math.min(1, (elapsed - inDuration) / outDuration);
      this.amp = 0.5 * (1 - Math.cos(Math.PI * u));
      this.renderWaveform();

      if (u < 1) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = undefined;
        this.syncSchedule(HOLD_MS);
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private renderWaveform() {
    const points = WAVEFORMS[ORDER[this.index]];
    this.pathEl?.setAttribute("d", toPathData(points, this.amp));
  }
}

if (!customElements.get("tone-hero-waveform")) {
  customElements.define("tone-hero-waveform", ToneHeroWaveform);
}
