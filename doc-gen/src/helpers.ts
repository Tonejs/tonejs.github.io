const marked = require("marked");
const hljs = require("highlight.js");
import { registerHelper, SafeString } from "handlebars";

marked.setOptions({
	highlight: function (code, lang) {
		if (lang) {
			console.log(code);
			return code;
			// return `<div class="e">
			// 			<div class="center">${code.split('').map((letter:string) => {
			// 				if (letter.match(/[\-\+\|><]/g)){
			// 					return `<span>${letter}</span>`
			// 				} else {
			// 					return letter
			// 				}
			// 			}).join('')}</div>
			// 		</div>`
			// // return hljs.highlight(lang, code).value;
		} else {
			return `<div class="ascii-diagram">
						<div class="center">${code
							.split("")
							.map((letter: string) => {
								if (letter.match(/[\-\+\|><]/g)) {
									return `<span>${letter}</span>`;
								} else {
									return letter;
								}
							})
							.join("")}</div>
					</div>`;
		}
	},
});

export async function registerHelpers(allData: any) {
	/**
	 * Convert this into markdown
	 */
	registerHelper("markdown", function (content) {
		let text = content.fn(this);
		const brackets: RegExp = /\[\[([^\]]+)\]\]/g;
		//if it refers to an internal function
		function isClassOrFunction(name: string): boolean {
			if (name.includes(".")) {
				name = name.split(".")[0];
			}
			return (
				allData.children.findIndex((doc) => {
					return (
						doc.name === name &&
						(doc.kindString === "Class" ||
							doc.kindString === "Function")
					);
				}) !== -1
			);
		}
		text = text.replace(
			brackets,
			(match: string, content: string): string => {
				const localLink = !isClassOrFunction(content);
				return `[${content}](${localLink ? "#" : ""}${content.replace(
					".",
					"#"
				)})`;
			}
		);
		return marked(text);
	});

	const cachedIds: Map<number, Object> = new Map();
	function getObjectFromId(id: number, data): any {
		if (cachedIds.has(id)) {
			return cachedIds.get(id);
		} else {
			for (let i = 0; i < data.children.length; i++) {
				const obj = data.children[i];
				if (obj.id === id) {
					cachedIds.set(id, obj);
					return obj;
				}
				if (obj.children) {
					const results = getObjectFromId(id, obj);
					if (results) {
						return results;
					}
				}
			}
		}
	}

	/**
	 * Resolve the id, return the corresponding object
	 */
	registerHelper("resolveId", function (id: number, context) {
		return getObjectFromId(id, allData);
	});

	/**
	 * get the current version
	 */
	registerHelper("version", function () {
		return allData.version;
	});

	/**
	 * Get the class constructor
	 */
	registerHelper("getConstructor", function (data) {
		return data.children.filter(
			(data) => data.kindString === "Constructor"
		);
	});

	/**
	 * Get all of the properties and accessors belonging to a class
	 */
	registerHelper("getProperties", function (data) {
		const props = data.children.filter(
			(data) =>
				data.kindString === "Property" || data.kindString === "Accessor"
		);
		return props.sort((a, b) => a.name.localeCompare(b.name));
	});

	/**
	 * Get all of the methods belonging to a class
	 */
	registerHelper("getMethods", function (data) {
		const props = data.children.filter(
			(data) => data.kindString === "Method"
		);
		return props.sort((a, b) => a.name.localeCompare(b.name));
	});

	/**
	 * Moves comments from implemented class to the implementing class when there is no comment
	 */
	registerHelper("implementedBy", function (doc) {
		if (doc.implementedTypes && doc.implementedTypes.length) {
			const implementer = getObjectFromId(
				doc.implementedTypes[0].id,
				allData
			);
			if (implementer) {
				doc.children.forEach((prop) => {
					const implementingProp = implementer.children.find(
						(child) => child.name === prop.name
					);
					if (implementingProp) {
						if (prop.kindString === "Accessor") {
							prop.getSignature.forEach((signature, i) => {
								if (
									!signature.comment &&
									implementingProp.comment
								) {
									signature.comment =
										implementingProp.comment;
								}
							});
						} else if (
							prop.kindString === "Property" &&
							!prop.comment
						) {
							prop.comment = implementingProp.comment;
						} else if (prop.kindString === "Method") {
							prop.signatures.forEach((signature, i) => {
								if (
									!signature.comment &&
									implementingProp.signatures &&
									implementingProp.signatures[i]
								) {
									signature.comment =
										implementingProp.signatures[i].comment;
								}
							});
						}
					}
				});
			}
		}
	});

	/**
	 * Navigate up the hierarchy to find the comment which corresponds to the id
	 */
	registerHelper("resolveComment", function (id: number, context) {
		// console.log(context)
		let origObject = getObjectFromId(id, allData);
		let i = 0;
		while (
			origObject &&
			(origObject.overwrites || origObject.implements) &&
			origObject.signatures &&
			!origObject.signatures.some((sig) => sig.comment)
		) {
			origObject = getObjectFromId(origObject.overwrites.id, allData);
			//make sure you don't go into an infinite loop
			if (i++ > 100) {
				break;
			}
		}
		return origObject;
	});

	/**
	 * highlight a block of code as javascript
	 */
	registerHelper("highlight", function (code: string, context) {
		return `<code class="language-js hljs">${
			hljs.highlight("typescript", code).value
		}</code>`;
	});

	/**
	 * Gives some basic conditional tests
	 */
	registerHelper("ifCond", function (
		v1: any,
		operator: any,
		v2: any,
		options: any
	) {
		switch (operator) {
			case "==":
				// tslint:disable-next-line:triple-equals
				return v1 == v2 ? options.fn(this) : options.inverse(this);
			case "!=":
				// tslint:disable-next-line:triple-equals
				return v1 != v2 ? options.fn(this) : options.inverse(this);
			case "===":
				return v1 === v2 ? options.fn(this) : options.inverse(this);
			case "<":
				return v1 < v2 ? options.fn(this) : options.inverse(this);
			case "<=":
				return v1 <= v2 ? options.fn(this) : options.inverse(this);
			case ">":
				return v1 > v2 ? options.fn(this) : options.inverse(this);
			case ">=":
				return v1 >= v2 ? options.fn(this) : options.inverse(this);
			case "&&":
				return v1 && v2 ? options.fn(this) : options.inverse(this);
			case "||":
				return v1 || v2 ? options.fn(this) : options.inverse(this);
			default:
				return options.inverse(this);
		}
	});

	/**
	 * Test if the method or class is deprecated
	 */
	registerHelper("isDeprecated", function (obj: any, context) {
		return (
			obj.comment &&
			obj.comment.tags &&
			obj.comment.tags.findIndex(({ tag }) => tag === "deprecated") !== -1
		);
	});

	/**
	 * Generate a link for a type
	 */
	registerHelper("typeLink", function (id: number, context) {
		const obj = getObjectFromId(id, allData);
		if (obj && obj.kindString === "Class") {
			return obj.name;
		} else if (obj && obj.kindString === "Interface") {
			return `interface/${obj.name}`;
		} else if (obj && obj.kindString === "Type alias") {
			return `type/${obj.name}`;
		}
		// return `<code class="language-js">${hljs.highlight('js', code).value}</code>`;
	});

	/**
	 * Replace one string with another in the file
	 */
	registerHelper("replace", function (word, replaceA, withB) {
		// console.log(word, other)
		return word.replace(replaceA, withB);
	});

	/**
	 * get the commit hash
	 */
	registerHelper("commitHash", () => {
		return allData.commit;
	});

	/**
	 * Compress the given string by removing all newlines.
	 *
	 * @param text  The string that should be compressed.
	 * @returns The string with all newlines stripped.
	 */
	registerHelper("compact", function (options: any): string {
		const lines = options.fn(this).split("\n");

		for (let i = 0, c = lines.length; i < c; i++) {
			lines[i] = lines[i].trim().replace(/&nbsp;/, " ");
		}
		return lines.join("");
	});

	/**
	 * Get all of the classes in their groups (group by top level folder)
	 */
	registerHelper("toc", () => {
		return allData.groups
			.filter((group) => {
				//ignore some of the categories
				return group.categories && group.title !== "Type aliases";
			})
			.map((group) => {
				return {
					title: group.title,
					children: group.categories
						.filter(({ title }) => title !== "Global")
						.map(({ title, children }) => {
							return {
								title,
								children: children.map(
									(id) => getObjectFromId(id, allData).name
								),
							};
						}),
				};
			});
	});

	/**
	 * If it's got either min or max
	 */
	registerHelper("nominalRange", (obj) => {
		const min = obj.find((o) => o.tag === "min");
		const max = obj.find((o) => o.tag === "max");
		let ret = "";
		if (min || max) {
			ret += "Range: ";
			if (min && max) {
				ret += `${min.text} to ${max.text}`;
			} else if (min) {
				ret += `${min.text} (min)`;
			} else if (max) {
				ret += `${max.text} (max)`;
			}
		}
		return ret;
	});

	/**
	 * Parse the example
	 */
	registerHelper("offlineExample", (obj) => {
		const offline = obj.filter((o) => o.tag === "offline")[0];
		if (offline) {
			return `data-offline-example="${offline.text}"`;
		} else {
			return "";
		}
	});
}
