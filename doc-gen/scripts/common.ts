export const IS_IFRAME = window.location !== window.parent.location;

export function getVersion() {
	let version = document.querySelector("#topbar #version").textContent;
	if (version.startsWith("v")) {
		version = version.slice(1);
	}
	return version;
}
