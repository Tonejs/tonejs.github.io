import { getVersion } from "./common"

export class IframeExample {

	private offlineRender: string;
	private iframe: HTMLIFrameElement;
	private parent: HTMLElement;
	private onmessagebind: () => void;
	public onmessage: (obj) => void;

	constructor(parent, offlineRender = "") {
		this.offlineRender = offlineRender;
		this.parent = parent;
		this.onmessagebind = this.onRecvMessage.bind(this)
	}

	private createIframe() {
		this.stop()
		this.iframe = document.createElement('iframe')
		this.iframe.sandbox.add("allow-scripts")
		this.iframe.sandbox.add("allow-same-origin")
		this.iframe.allow = "autoplay"
		window.addEventListener('message', this.onmessagebind, true)
	}

	private iframeHeader() {
		return /*javascript*/`
			<style>
				body {
					height: 300px;
					margin: 0px;
					position: absolute;
					top: 0px;
					left: 0px;
					width: 100%;
				}
			</style>
			<script>
			// don't print the tone.js logging to the console
			window.TONE_SILENCE_LOGGING = true;
			//overwrite console.log to send info the client
			const originalLog = console.log.bind(console)
			console.log = (...args) => {
				originalLog(...args)
				// defer the logging until after it's loaded
				setTimeout(() => {
					window.parent.postMessage({ console : args }, "*")
				}, 10)
			}
			</script>
			
			`
	}

	private iframeBody() {
		const assetPath = `${window.location.protocol}//${window.location.host}/docs/${getVersion()}/assets/js`
		console.log(assetPath)
		return /*javascript*/`
			<script src="${assetPath}/Tone.js"></script>
			<script src="${assetPath}/Plot.js"></script>
			<script>
				window.onerror = e => {
					window.parent.postMessage({ error : e }, "*")
				}
				// turn off after 10 seconds
				Tone.Destination.volume.rampTo(-Infinity, 1, "+29")
				if (${this.offlineRender === ""}){
					setTimeout(() => {
						window.parent.postMessage({ done : true }, "*")
					}, 30400)
				}
			</script>
		`
	}

	private iframeCode(code: string) {
		return `
			<script>
				if (${this.offlineRender !== ""}){
					Tone.Offline(() => {
						${code}
					}, ${this.offlineRender.split(' ').join(', ')}).then(buffer => {
						const plot = TonePlot.Plot.signal(buffer)
						document.body.appendChild(plot)
					}).catch(e => {
						window.parent.postMessage({ error : e }, "*")
					})
				} else {
					${code}
				}
			</script>
		`
	}

	async load(code) {
		const content = this.iframeHeader() + this.iframeBody() + this.iframeCode(code)
		const blob = new Blob([content], { type: 'text/html' })
		this.createIframe()
		this.parent.appendChild(this.iframe)
		const loaded = new Promise((done, onerror) => {
			this.iframe.onload = done
			this.iframe.onerror = onerror
		})
		this.iframe.src = URL.createObjectURL(blob)

		// wait for the iframe to load
		await Promise.race([loaded, new Promise((_, error) => {
			// 10 second timeout
			setTimeout(() => {
				error("Timeout!")
			}, 10000)
		})]).catch(() => {
			this.onmessage({ error: "timeout" })
		})
	}

	stop() {
		window.removeEventListener('message', this.onmessagebind, true)
		if (this.iframe) {
			this.iframe.remove()
		}
	}

	private onRecvMessage(e: MessageEvent) {
		console.log('message')
		if (e.source === this.iframe.contentWindow) {
			this.onmessage(e.data)
			if (e.data.error || e.data.done) {
				this.stop()
			}
		}
	}
}
