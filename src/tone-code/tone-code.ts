import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting } from "@codemirror/language";
import { Compartment, Prec } from "@codemirror/state";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { basicSetup, EditorView } from "codemirror";
import { css, html, LitElement, nothing } from "lit";
import { property, query, state } from "lit/decorators.js";
import { preloadTone, Sandbox, type SandboxMessage } from "./sandbox";
import { drawPlot, drawWaveform } from "./waveform";

/** Runs are stopped automatically after this many seconds */
const DURATION = 10;

/** one-dark's colors on the page's own background (light mode uses basicSetup's defaults) */
const dark = [
  EditorView.theme({}, { dark: true }),
  syntaxHighlighting(oneDarkHighlightStyle),
];

const isDark = () => document.documentElement.dataset.theme === "dark";

type Line = { type: "log" | "error"; text: string };

/**
 * An editable, runnable Tone.js snippet. The code is read from the element's
 * <pre> child, which stays visible as the fallback until the editor loads:
 *
 *   <tone-code tone="/build/Tone.js"><pre>new Tone.Synth()...</pre></tone-code>
 */
export class ToneCode extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-block: 1rem;
      border: 1px solid var(--tone-example-border, #b5e9f5);
      border-radius: 0.25rem;
      background: var(--tone-example, #ecfbff);
      overflow: hidden;
      font-size: var(--sl-text-code, 0.875rem);
    }
    .editor {
      padding-block: 0.5rem;
    }
    .cm-editor {
      max-height: 32rem;
      background: transparent;
    }
    .cm-editor.cm-focused {
      outline: none;
    }
    .cm-scroller {
      font-family: var(--__sl-font-mono, ui-monospace, monospace);
      line-height: 1.6;
    }
    /* no line numbers or fold markers; CodeMirror's own theme rules are more specific than these */
    .cm-editor .cm-gutters {
      display: none;
    }
    .cm-editor .cm-content {
      padding-inline: 0.75rem;
    }
    .cm-editor .cm-activeLine {
      background: transparent !important;
    }
    .toolbar {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.4rem 0.6rem;
      border-top: 1px solid var(--tone-example-border, #b5e9f5);
    }
    button {
      flex: none;
      font: inherit;
      font-family: var(--__sl-font, system-ui);
      font-size: 0.85rem;
      font-weight: 600;
      min-width: 4.5rem;
      padding: 0.2rem 0.9rem;
      border: 1px solid var(--tone-example-border, #b5e9f5);
      border-radius: 0.25rem;
      background: var(--tone-example-button, #c9effa);
      color: var(--tone-example-text, #0b5466);
      cursor: pointer;
    }
    button:hover {
      filter: brightness(0.95);
    }
    .live {
      flex: 1;
      min-width: 0;
      height: 2rem;
      clip-path: inset(0% 100% 0% 0%);
    }
    .output {
      margin: 0;
      padding: 0.5rem 0.75rem;
      max-height: 12rem;
      overflow: auto;
      border-top: 1px solid var(--tone-example-border, #b5e9f5);
      background: var(--sl-color-bg, white);
      font-family: var(--__sl-font-mono, ui-monospace, monospace);
      white-space: pre-wrap;
    }
    .error {
      color: var(--tone-red, #d42a2a);
    }
    .buffer {
      display: block;
      width: 100%;
      height: 10rem;
      border-top: 1px solid var(--tone-example-border, #b5e9f5);
      background: var(--sl-color-bg, white);
    }
    .frame {
      position: absolute;
      width: 0;
      height: 0;
      overflow: hidden;
    }
    .frame iframe {
      border: 0;
    }
  `;

  @property() tone = "/build/Tone.js";
  @state() private running = false;
  @state() private lines: Line[] = [];
  @state() private buffer?: { channels: Float32Array[]; sampleRate: number };

  @query(".editor", true) private editorElement!: HTMLElement;
  @query(".frame", true) private frameElement!: HTMLElement;
  @query(".live", true) private liveCanvas!: HTMLCanvasElement;
  @query(".buffer") private bufferCanvas?: HTMLCanvasElement;
  @query(".output") private output?: HTMLElement;

  private editor?: EditorView;
  private sandbox?: Sandbox;
  private timeout?: number;
  private frame?: number;
  private theme = new Compartment();
  private themeObserver = new MutationObserver(() => this.updateTheme());

  connectedCallback() {
    super.connectedCallback();
    addEventListener("tone-code-run", this.onOtherRun);
    this.themeObserver.observe(document.documentElement, {
      attributeFilter: ["data-theme"],
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    removeEventListener("tone-code-run", this.onOtherRun);
    this.themeObserver.disconnect();
    this.stop();
  }

  /** Only one snippet plays at a time */
  private onOtherRun = (event: Event) => {
    if (event.target !== this) this.stop();
  };

  firstUpdated() {
    preloadTone(this.tone);
    const run = () => (this.run(), true);
    this.editor = new EditorView({
      doc: this.querySelector("pre")?.textContent?.trim() ?? "",
      root: this.shadowRoot!,
      parent: this.editorElement,
      extensions: [
        basicSetup,
        javascript(),
        this.theme.of(isDark() ? dark : []),
        Prec.highest(
          keymap.of([
            { key: "Mod-Enter", run },
            { key: "Shift-Enter", run },
            { key: "Mod-s", run, preventDefault: true },
          ]),
        ),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && this.running) this.stop();
        }),
      ],
    });
    this.sandbox = new Sandbox(this.frameElement, (message) =>
      this.onMessage(message),
    );
  }

  private updateTheme() {
    this.editor?.dispatch({
      effects: this.theme.reconfigure(isDark() ? dark : []),
    });
    // the canvases read their color from the page's theme
    this.requestUpdate();
  }

  private get color() {
    return (
      getComputedStyle(this).getPropertyValue("--tone-blue").trim() || "#3335ed"
    );
  }

  run() {
    if (!this.editor || !this.sandbox) return;
    this.dispatchEvent(
      new CustomEvent("tone-code-run", { bubbles: true, composed: true }),
    );
    this.stop();
    this.lines = [];
    this.buffer = undefined;
    this.sandbox.run(this.editor.state.doc.toString(), this.tone);
    this.running = true;
    this.timeout = window.setTimeout(() => this.stop(), DURATION * 1000);
    this.drawLive();
    this.animateWaveform(true);
  }

  stop() {
    const wasRunning = this.running;
    clearTimeout(this.timeout);
    cancelAnimationFrame(this.frame!);
    this.sandbox?.stop();
    this.running = false;
    if (wasRunning) this.animateWaveform(false);
  }

  private animateWaveform(entering: boolean) {
    if (!this.liveCanvas) return;
    this.liveCanvas.getAnimations().forEach((a) => a.cancel());
    this.liveCanvas.animate(
      entering
        ? [
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)" },
          ]
        : [
            { clipPath: "inset(0% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 100%)" },
          ],
      {
        duration: 80,
        easing: entering ? "ease-out" : "ease-in",
        fill: "forwards",
      },
    );
  }

  /** Draws what's playing every frame while running. Once stopped, the last frame slides out */
  private drawLive = () => {
    if (!this.liveCanvas || !this.running) return;
    const values = this.sandbox?.waveform() ?? new Float32Array();
    drawWaveform(this.liveCanvas, values, this.color);
    this.frame = requestAnimationFrame(this.drawLive);
  };

  private onMessage(message: SandboxMessage) {
    switch (message.type) {
      case "log":
      case "error":
        this.lines = [...this.lines.slice(-49), message];
        if (message.type === "error") this.stop();
        break;
      case "buffer":
        // an offline render has nothing left to play
        this.buffer = message;
        this.stop();
        break;
    }
  }

  updated() {
    if (this.bufferCanvas && this.buffer) {
      const style = getComputedStyle(this);
      drawPlot(
        this.bufferCanvas,
        this.buffer.channels,
        this.buffer.sampleRate,
        {
          line: this.color,
          axis:
            style.getPropertyValue("--tone-example-border").trim() || "#b5e9f5",
          text: style.getPropertyValue("--sl-color-gray-3").trim() || "#8b8b8b",
        },
      );
    }
    this.output?.scrollTo({ top: this.output.scrollHeight });
  }

  render() {
    return html`
      <div class="editor"></div>
      <div class="toolbar">
        <button @click=${() => (this.running ? this.stop() : this.run())}>
          ${this.running ? "Stop" : "Run"}
        </button>
        <canvas class="live"></canvas>
      </div>
      ${
        this.lines.length
          ? html`<pre class="output">
${this.lines.map((line) => html`<div class=${line.type}>${line.text}</div>`)}</pre>`
          : nothing
      }
      ${this.buffer ? html`<canvas class="buffer"></canvas>` : nothing}
      <div class="frame"></div>
    `;
  }
}

if (!customElements.get("tone-code"))
  customElements.define("tone-code", ToneCode);

declare global {
  interface HTMLElementTagNameMap {
    "tone-code": ToneCode;
  }
}
