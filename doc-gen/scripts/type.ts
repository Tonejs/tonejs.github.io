import { IS_IFRAME } from "./common";

//make sure you're not running an in iframe
if (!IS_IFRAME) {
	document
		.querySelectorAll(".type a")
		.forEach((element: HTMLAnchorElement) => {
			element.parentNode.addEventListener("mouseenter", (e) => {
				if (e instanceof MouseEvent) {
					const el = document.elementFromPoint(e.clientX, e.clientY);
					if (el.parentNode === element.parentNode) {
						//create an iframe
						const iframe = document.createElement(
							"iframe"
						) as HTMLIFrameElement;
						element.parentNode.appendChild(iframe);
						iframe.classList.add("hover");
						if (el.getBoundingClientRect().top < 260) {
							iframe.classList.add("down");
						}
						iframe.onload = () => {
							if (
								iframe.contentWindow.document.body
									.scrollHeight > 0
							) {
								let iframeHeight = Math.min(
									iframe.contentWindow.document.body
										.scrollHeight + 10,
									260
								);
								iframeHeight = Math.max(iframeHeight, 100);
								iframe.style.height = `${iframeHeight}px`;
							}
						};
						iframe.src = element.href;
					}
				}
			});
			element.parentNode.addEventListener("mouseleave", (e) => {
				const iframe = element.parentNode.querySelector("iframe");
				if (iframe) {
					iframe.remove();
				}
			});
		});

	//make all external links open in a new page
	document.body.querySelectorAll("a").forEach((a) => {
		const link = a.getAttribute("href");
		if (link && link.startsWith("http")) {
			a.target = "_blank";
		}
	});
} else {
	//remove all of the internal links when it's opened as an iframe
	document.body.querySelectorAll("a").forEach((a) => {
		if (a.target !== "_blank") {
			a.href = "#";
			a.style.pointerEvents = "none";
		}
	});
}
