// THE SEARCH FIELD
const searchField = document.querySelector("#search");
if (searchField) {
	const elements = document.querySelectorAll("#sidebar .instance");
	function testSearch(searchString: string): void {
		elements.forEach((el: HTMLElement) => {
			if (searchString === "") {
				el.style.display = null;
			} else if (!el.textContent.toLowerCase().includes(searchString)) {
				el.style.display = "none";
			} else {
				el.style.display = null;
			}
		});
		//check the containers
		document
			.querySelectorAll("#sidebar .category")
			.forEach((category: HTMLElement) => {
				category.style.display = Array.from(
					category.querySelectorAll(".instance")
				).every((el: HTMLElement) => {
					return el.style.display === "none";
				})
					? "none"
					: null;
			});
	}

	searchField.querySelector("input").addEventListener("input", (e) => {
		const input = e.target as HTMLInputElement;
		const searchString = input.value.toLowerCase().trim();
		testSearch(searchString);
	});
	searchField.querySelector("button").addEventListener("click", () => {
		//clear the value
		searchField.querySelector("input").value = "";
		testSearch("");
	});
}

//scroll to target item if not in mobile view
const classPageElement = document.querySelector("#class-page");
if (getComputedStyle(classPageElement).display === "flex") {
	const targetElement = document.querySelector("#sidebar .target");
	if (targetElement) {targetElement.scrollIntoView()}
}