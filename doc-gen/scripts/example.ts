import { IS_IFRAME } from "./common";

if (!IS_IFRAME) {
	document
		.querySelectorAll(".example pre")
		.forEach(async (example: HTMLElement) => {
			// wrap it in tone-code
			example.innerHTML = `
				<tone-code>
					${example.innerHTML}
				</tone-code>
			`;
		});
}
