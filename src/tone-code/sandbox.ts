/**
 * Runs a snippet of Tone.js code in a throwaway iframe. Removing the iframe is
 * how a run is stopped: it takes every timer and worker with it, while closing
 * the AudioContext frees the audio hardware immediately.
 */

export type SandboxMessage =
	| { type: "log"; text: string }
	| { type: "error"; text: string }
	| { type: "buffer"; channels: Float32Array[]; sampleRate: number }
	| { type: "ready" };

type FrameWindow = Window & {
	Tone?: {
		start(): Promise<void>;
		getContext(): { close?(): Promise<void> };
	};
	toneCodeStarted?: Promise<void>;
	toneCodeWaveform?: { getValue(): Float32Array };
};

type AudioSessionNavigator = Navigator & {
	audioSession?: { type: string };
};

/**
 * Share the parent window's Web Audio constructors with the iframe: iOS Safari
 * keeps AudioContexts owned by hidden/untapped subframes suspended forever,
 * whereas an AudioContext created from the tapped top-level window starts cleanly.
 */
const webAudioGlobals = [
	"AudioContext",
	"webkitAudioContext",
	"OfflineAudioContext",
	"webkitOfflineAudioContext",
	"BaseAudioContext",
	"AudioNode",
	"AudioParam",
	"AudioBuffer",
	"AudioWorkletNode",
] as const;

function shareWebAudioGlobals(frame: FrameWindow) {
	const parentGlobals = window as unknown as Record<string, unknown>;
	const frameGlobals = frame as unknown as Record<string, unknown>;
	for (const key of webAudioGlobals) {
		if (key in window) {
			frameGlobals[key] = parentGlobals[key];
		}
	}
	// On iOS Safari, `new AudioContext()` inside a tap gesture starts immediately in `"running"`
	// state without firing `statechange`, which leaves standardized-audio-context waiting forever.
	for (const key of ["AudioContext", "webkitAudioContext"] as const) {
		const Ctor = parentGlobals[key] as (typeof AudioContext) | undefined;
		if (!Ctor) continue;
		frameGlobals[key] = new Proxy(Ctor, {
			construct(target, args) {
				const ctx: AudioContext = Reflect.construct(target, args);
				if (ctx.state === "running") {
					setTimeout(() => {
						if (ctx.state === "running") ctx.dispatchEvent(new Event("statechange"));
					}, 0);
				}
				return ctx;
			},
		});
	}
}

/** Let Web Audio play even when the iOS hardware Ring/Silent switch is on Silent */
function enablePlaybackSession(nav?: Navigator) {
	const session = (nav as AudioSessionNavigator | undefined)?.audioSession;
	if (session && session.type !== "playback") {
		session.type = "playback";
	}
}

const scriptCache = new Map<string, string>();
const pendingScripts = new Map<string, Promise<void>>();

/** Pre-fetch Tone.js so `run()` can execute it and `Tone.start()` synchronously inside the user gesture */
export function preloadTone(toneUrl: string) {
	const resolved = new URL(toneUrl, location.href).href;
	if (scriptCache.has(resolved) || pendingScripts.has(resolved)) return;
	const pending = fetch(resolved)
		.then((r) => (r.ok ? r.text() : ""))
		.then((text) => {
			if (text) scriptCache.set(resolved, text);
		})
		.catch(() => {})
		.finally(() => pendingScripts.delete(resolved));
	pendingScripts.set(resolved, pending);
}

const setupCode = `
window.TONE_SILENCE_LOGGING = true;
window.toneCodeSend = (message) => parent.postMessage({ toneCode: message }, "*");
const format = (value) => {
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value, null, 2) ?? String(value);
	} catch {
		return String(value);
	}
};
for (const level of ["log", "info", "warn", "error"]) {
	const original = console[level].bind(console);
	console[level] = (...args) => {
		original(...args);
		window.toneCodeSend({ type: level === "error" ? "error" : "log", text: args.map(format).join(" ") });
	};
}
addEventListener("error", (e) => window.toneCodeSend({ type: "error", text: e.message }));
addEventListener("unhandledrejection", (e) => window.toneCodeSend({ type: "error", text: String(e.reason?.message ?? e.reason) }));
`;

const runnerCode = (code: string) => `
await (window.toneCodeStarted ?? Tone.start());
// the page reads this to draw what is playing
window.toneCodeWaveform = new Tone.Waveform(1024);
Tone.getDestination().connect(window.toneCodeWaveform);
const result = await (async () => {
${code}
})();
if (result instanceof Tone.ToneAudioBuffer) {
	const channels = Array.from({ length: result.numberOfChannels }, (_, i) => result.getChannelData(i));
	window.toneCodeSend({ type: "buffer", channels, sampleRate: result.sampleRate });
}
await Tone.loaded();
window.toneCodeSend({ type: "ready" });
`;

function appendScript(doc: Document, content: string, type?: string) {
	const script = doc.createElement("script");
	if (type) script.type = type;
	script.textContent = content;
	doc.head.append(script);
}

export class Sandbox {
	private iframe?: HTMLIFrameElement;

	private listener = (event: MessageEvent) => {
		if (this.iframe && event.source === this.iframe.contentWindow && event.data?.toneCode) {
			this.onMessage(event.data.toneCode);
		}
	};

	constructor(
		private container: HTMLElement,
		private onMessage: (message: SandboxMessage) => void,
	) {}

	run(code: string, toneUrl: string) {
		this.stop();
		enablePlaybackSession(navigator);
		const resolvedUrl = new URL(toneUrl, location.href).href;
		const toneScript = scriptCache.get(resolvedUrl);
		if (!toneScript) preloadTone(toneUrl);

		const iframe = document.createElement("iframe");
		iframe.sandbox.add("allow-scripts", "allow-same-origin");
		iframe.allow = "autoplay";
		iframe.title = "Tone.js code runner";
		addEventListener("message", this.listener);
		this.container.append(iframe);
		this.iframe = iframe;

		const doc = iframe.contentDocument!;
		const frame = iframe.contentWindow as FrameWindow | null;
		if (frame) {
			enablePlaybackSession(frame.navigator);
			shareWebAudioGlobals(frame);
		}
		appendScript(doc, setupCode);
		if (toneScript) {
			appendScript(doc, toneScript);
			if (frame?.Tone) {
				frame.toneCodeStarted = frame.Tone.start();
			}
			appendScript(doc, runnerCode(code), "module");
		} else {
			// If Tone.js hasn't finished preloading yet, unlock Web Audio on the parent document synchronously now
			const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
			const unlock = AudioCtx ? new AudioCtx() : undefined;
			unlock?.resume().catch(() => {});
			const ext = doc.createElement("script");
			ext.src = resolvedUrl;
			ext.onload = () => {
				if (frame?.Tone) frame.toneCodeStarted = frame.Tone.start();
				unlock?.close().catch(() => {});
				appendScript(doc, runnerCode(code), "module");
			};
			ext.onerror = () => {
				unlock?.close().catch(() => {});
				this.onMessage({ type: "error", text: `Failed to load ${toneUrl}` });
			};
			doc.head.append(ext);
		}
	}

	/** The samples currently playing through Tone.Destination, while a snippet is running */
	waveform(): Float32Array | undefined {
		try {
			// the iframe has the page's origin, so its Tone can be read directly
			const frame = this.iframe?.contentWindow as FrameWindow | null;
			return frame?.toneCodeWaveform?.getValue();
		} catch {
			return undefined;
		}
	}

	stop() {
		removeEventListener("message", this.listener);
		try {
			const frame = this.iframe?.contentWindow as FrameWindow | null;
			frame?.Tone?.getContext().close?.().catch(() => {});
		} catch {
			// ignore if already torn down
		}
		this.iframe?.remove();
		this.iframe = undefined;
	}
}
