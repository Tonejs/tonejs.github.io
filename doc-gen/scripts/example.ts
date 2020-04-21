import { IS_IFRAME, getVersion } from "./common"
import * as monaco from "monaco-editor";
import { IframeExample } from "./iframe";

// add Tone.js to it
async function fetchToneDts() {
	//get the currently loaded version on the page
	const response = await fetch(`./assets/tone.d.ts`)
	if (response.ok) {
		return await response.text()
	} else {
		throw new Error("couldn't load description")
	}
}

async function main() {

	// @ts-ignore
	self.MonacoEnvironment = {
		getWorkerUrl: function (_, label) {
			if (label === "typescript" || label === "javascript") {
				return "./assets/ts.worker.bundle.js";
			}
			return "./assets/editor.worker.bundle.js";
		}
	};

	document.querySelectorAll(".example pre").forEach(async (example: HTMLElement) => {

		const content = example.textContent;

		const model = monaco.editor.createModel(content.trim(), "typescript");
		const element = example.parentElement

		const editor = monaco.editor.create(element, {
			model,
			theme: "vs-dark",
			scrollBeyondLastLine: false,
			minimap: {
				enabled: false
			}
		});
		example.textContent = ""

		const offlineRender = element.getAttribute('data-offline-example') || undefined
		if (offlineRender) {
			element.classList.add('offline')
		}

		const runText = !offlineRender ? "► Run" : "↻ Render"
		const stopText = "❙❙ Running"

		//add a run button to the bottom
		const button = document.createElement("button")
		button.textContent = runText
		element.appendChild(button)
		const infoText = document.createElement('span')
		infoText.id = 'info'
		element.appendChild(infoText)

		const iframeExample = new IframeExample(element, offlineRender)
		iframeExample.onmessage = message => {
			if (message.error) {
				reset()
				infoText.textContent = '› ' + message.error
				infoText.classList.add('error')
			} else if (message.console) {
				infoText.textContent = '› ' + message.console.map(msg => JSON.stringify(msg)).join(', ')
			} else if (message.done) {
				reset()
			}
		}

		// if it's offline, render it immediately
		if (offlineRender) {
			await render()
		}

		button.addEventListener("click", async e => {


			if (button.textContent === runText) {
				await render()
			} else if (button.textContent === stopText) {
				reset()
			}
		})

		function reset() {
			iframeExample.stop()
			button.textContent = runText
			infoText.classList.remove('error')
			infoText.textContent = ""
			button.disabled = false
		}

		async function render() {
			infoText.textContent = ""
			button.textContent = "Loading..."
			button.disabled = true
			await iframeExample.load(editor.getValue())
			button.disabled = false
			button.textContent = !offlineRender ? stopText : runText
		}

		//cancel it
		editor.onDidChangeModelContent(() => {
			if (!offlineRender) {
				reset()
			}
		})
	});

	monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
		target: monaco.languages.typescript.ScriptTarget.ES2015,
		allowNonTsExtensions: true,
		lib: ["ES2015"]
	});

	/**
	 * Add the declaration
	 */
	let declr = await fetchToneDts()

	// wrap it in the namespace instead of module declaration
	declr = declr.replace("declare module 'tone' {", "namespace Tone {")

	// add the console
	declr += `
		interface Console {
			log(message?: any, ...optionalParams: any[]): void;
		}
		declare var Console: {
			prototype: Console;
			new(): Console;
		};
		const console = new Console()
	`

	monaco.languages.typescript.typescriptDefaults.addExtraLib(
		declr,
		"file:///node_modules/tone/index.d.ts"
	);
	monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
		noSemanticValidation: true,
		noSyntaxValidation: true,
	});
}
if (!IS_IFRAME) {
	main()
}
