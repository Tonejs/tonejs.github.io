/**
 * Turns a TypeDoc reflection tree (tone.json) into Starlight markdown pages,
 * one per exported class, function, interface, type alias and variable.
 *
 * Pages are published under /docs/<version>/, and /docs/<channel>/ (latest, next)
 * holds redirects to them, the same URL scheme the docs have always used.
 *
 * Run directly (`npm run api`) to regenerate pages from the cached tone.json
 * files without fetching or re-running TypeDoc.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { channelPaths, channels, paths } from "./config.mjs";

const Kind = {
	Module: 2,
	Namespace: 4,
	Variable: 32,
	Function: 64,
	Class: 128,
	Interface: 256,
	Constructor: 512,
	Property: 1024,
	Method: 2048,
	Accessor: 262144,
	TypeAlias: 2097152,
};

/** Order in which kinds claim a URL when two names only differ by case (Context / context) */
const kindPriority = [Kind.Class, Kind.Interface, Kind.Function, Kind.TypeAlias, Kind.Variable, Kind.Namespace];
const kindLabel = {
	[Kind.Namespace]: "namespace",
	[Kind.Variable]: "variable",
	[Kind.Function]: "function",
	[Kind.Class]: "class",
	[Kind.Interface]: "interface",
	[Kind.TypeAlias]: "type",
};

/** Sidebar/overview grouping, audio concepts first */
const categoryOrder = ["Core", "Source", "Instrument", "Effect", "Component", "Signal", "Event", "Unit"];

/** Members inherited from these base classes are listed by name instead of documented in full */
const plumbing = new Set(["Tone", "ToneWithContext", "ToneAudioNode"]);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Mirrors github-slugger, which Astro uses for heading ids */
function createSlugger() {
	const seen = new Map();
	return (text) => {
		const base = text
			.toLowerCase()
			.replace(/[^\p{L}\p{N}\s_-]/gu, "")
			.replace(/\s/g, "-");
		let slug = base;
		let count = seen.get(base) ?? 0;
		while (seen.has(slug)) {
			slug = `${base}-${++count}`;
		}
		seen.set(base, count);
		seen.set(slug, 0);
		return slug;
	};
}

/** Escape text for use inside inline HTML in markdown */
function esc(text) {
	return String(text).replace(/[&<>"*_[\]`\\|{}~]/g, (c) => `&#${c.charCodeAt(0)};`);
}

const yamlString = (s) => JSON.stringify(s);

/** Only touch files whose content changed, so `astro dev` reloads just those pages */
function writeIfChanged(file, content) {
	if (!existsSync(file) || readFileSync(file, "utf8") !== content) writeFileSync(file, content);
}

const indent = (text, spaces = 2) => {
	const pad = " ".repeat(spaces);
	return text
		.split("\n")
		.map((line, i) => (i > 0 && line ? pad + line : line))
		.join("\n");
};

const stripPrefix = (text, prefix) => (text.startsWith(prefix) ? text.slice(prefix.length) : text);

function tagContent(comment, tag) {
	return comment?.blockTags?.filter((t) => t.tag === tag) ?? [];
}

function isDeprecated(reflection) {
	const comments = [reflection.comment, ...(reflection.signatures ?? []).map((s) => s.comment), reflection.getSignature?.comment];
	return comments.some((c) => tagContent(c, "@deprecated").length);
}

function category(reflection) {
	const tag = tagContent(reflection.comment, "@category")[0];
	return tag ? tag.content.map((p) => p.text).join("").trim() : "Global";
}

// ---------------------------------------------------------------------------
// page planning: decide which reflections get pages and where every id links to
// ---------------------------------------------------------------------------

/** `base` is the url prefix of the version, e.g. /docs/15.1.22/ */
function planPages(project, base) {
	const pages = [];
	const links = new Map();
	const taken = new Set();

	// typedoc-plugin-missing-exports puts what Tone.js uses but doesn't export (Monophonic, Effect, …) into an
	// "<internal>" module. Those get pages, planned after the exported ones so they never take an exported name's URL.
	const internalModule = project.children.find((c) => c.kind === Kind.Module);
	const internal = new Set((internalModule?.children ?? []).filter((c) => kindPriority.includes(c.kind)));
	const byKind = (a, b) => kindPriority.indexOf(a.kind) - kindPriority.indexOf(b.kind);
	const exported = project.children.filter((c) => kindPriority.includes(c.kind));
	const sorted = [...exported.sort(byKind), ...[...internal].sort(byKind)];
	for (const reflection of sorted) {
		let slug = reflection.name.toLowerCase();
		if (taken.has(slug)) {
			slug = `${slug}-${kindLabel[reflection.kind]}`;
		}
		taken.add(slug);
		const url = `${base}${slug}/`;
		const page = { reflection, slug, url, members: planMembers(reflection), memberUrls: new Map(), internal: internal.has(reflection) };
		pages.push(page);
		links.set(reflection.id, url);
		for (const { member, anchor } of page.members) {
			page.memberUrls.set(member.name, `${url}#${anchor}`);
			registerLinks(member, `${url}#${anchor}`, links);
		}
	}
	pages.sort((a, b) => a.reflection.name.localeCompare(b.reflection.name));

	// inherited members link to where they are documented on the declaring class's page
	const byName = new Map(pages.filter((p) => p.reflection.kind === Kind.Class).map((p) => [p.reflection.name, p]));
	const inheritedUrl = (member) => byName.get(ownerName(member))?.memberUrls.get(member.name);
	for (const page of pages) {
		const planned = new Set(page.members.map((p) => p.member));
		for (const member of page.reflection.children ?? []) {
			const url = inheritedUrl(member);
			if (url && !planned.has(member)) registerLinks(member, url, links);
		}
	}
	return { pages, links, inheritedUrl };
}

/** Give every nested reflection (signatures, parameters, accessors) the url of its documented member */
function registerLinks(reflection, url, links) {
	links.set(reflection.id, url);
	for (const key of ["signatures", "parameters", "children"]) {
		for (const child of reflection[key] ?? []) registerLinks(child, url, links);
	}
	for (const key of ["getSignature", "setSignature"]) {
		if (reflection[key]) registerLinks(reflection[key], url, links);
	}
}

/** The class an inherited member is declared in (inheritedFrom only names the direct parent, which may not be exported) */
function ownerName(member) {
	if (!member.inheritedFrom) return undefined;
	const source = member.sources ?? member.signatures?.[0]?.sources ?? member.getSignature?.sources ?? member.setSignature?.sources;
	return source?.[0] ? basename(source[0].fileName, ".ts") : member.inheritedFrom.name.split(".")[0];
}

/**
 * Work out which members are documented in full on a page, in heading order,
 * so anchors can be computed before any page is rendered.
 */
function planMembers(reflection) {
	const slug = createSlugger();
	const planned = [];
	if (reflection.kind === Kind.Namespace) {
		slug("Types");
		for (const member of reflection.children ?? []) {
			planned.push({ member, anchor: slug(member.name), section: "Types" });
		}
		return planned;
	}
	const members = (reflection.children ?? []).filter((m) => !plumbing.has(ownerName(m)));
	const sections = [
		["Constructor", members.filter((m) => m.kind === Kind.Constructor)],
		["Properties", members.filter((m) => m.kind === Kind.Property || m.kind === Kind.Accessor)],
		["Methods", members.filter((m) => m.kind === Kind.Method)],
	];
	for (const [title, list] of sections) {
		if (!list.length) continue;
		slug(title);
		// deprecated members go last
		const ordered = [...list.filter((m) => !isDeprecated(m)), ...list.filter(isDeprecated)];
		for (const member of ordered) {
			const heading = member.kind === Kind.Method ? `${member.name}()` : member.name;
			const anchor = member.kind === Kind.Constructor ? "constructor" : slug(heading);
			planned.push({ member, anchor, section: title, heading });
		}
	}
	return planned;
}

// ---------------------------------------------------------------------------
// rendering
// ---------------------------------------------------------------------------

function createRenderer(links, inheritedUrl) {
	const link = (id, label) => {
		const url = typeof id === "number" ? links.get(id) : undefined;
		return url ? `<a href="${url}">${label}</a>` : label;
	};

	/** TypeDoc type → HTML with links to other API pages */
	function type(t, ctx = "") {
		if (!t) return "";
		switch (t.type) {
			case "intrinsic":
				return esc(t.name);
			case "literal":
				if (t.value === null) return "null";
				if (typeof t.value === "object") return `${t.value.negative ? "-" : ""}${t.value.value}n`;
				return esc(typeof t.value === "string" ? JSON.stringify(t.value) : t.value);
			case "reference": {
				const name = esc(t.name.split(".").pop());
				const args = t.typeArguments?.length ? `&lt;${t.typeArguments.map((a) => type(a)).join(", ")}&gt;` : "";
				return (t.refersToTypeParameter ? name : link(t.target, name)) + args;
			}
			case "union":
			case "intersection": {
				const out = t.types.map((u) => type(u, "union")).join(t.type === "union" ? " | " : " &amp; ");
				return ctx === "array" ? `(${out})` : out;
			}
			case "array":
				return `${type(t.elementType, "array")}[]`;
			case "tuple":
				return `[${(t.elements ?? []).map((e) => type(e)).join(", ")}]`;
			case "namedTupleMember":
				return `${esc(t.name)}${t.isOptional ? "?" : ""}: ${type(t.element)}`;
			case "optional":
				return `${type(t.elementType, "array")}?`;
			case "rest":
				return `...${type(t.elementType, "array")}`;
			case "typeOperator":
				return `${t.operator} ${type(t.target, "array")}`;
			case "indexedAccess":
				return `${type(t.objectType, "array")}[${type(t.indexType)}]`;
			case "query":
				return `typeof ${type(t.queryType)}`;
			case "inferred":
				return `infer ${esc(t.name)}`;
			case "predicate":
				return `${t.asserts ? "asserts " : ""}${esc(t.name)}${t.targetType ? ` is ${type(t.targetType)}` : ""}`;
			case "conditional": {
				const out = `${type(t.checkType)} extends ${type(t.extendsType)} ? ${type(t.trueType)} : ${type(t.falseType)}`;
				return ctx ? `(${out})` : out;
			}
			case "mapped":
				return `{ [${esc(t.parameter)} in ${type(t.parameterType)}]: ${type(t.templateType)} }`;
			case "templateLiteral":
				return `\`${esc(t.head)}${t.tail.map(([part, text]) => `\${${type(part)}}${esc(text)}`).join("")}\``;
			case "reflection":
				return reflectionType(t.declaration, ctx);
			default:
				return esc(t.name ?? "unknown");
		}
	}

	function reflectionType(decl, ctx) {
		if (decl.signatures?.length) {
			const out = decl.signatures.map((s) => `(${params(s)}) =&gt; ${type(s.type)}`).join(" | ");
			return ctx ? `(${out})` : out;
		}
		const props = (decl.children ?? []).map((c) => `${esc(c.name)}${c.flags?.isOptional ? "?" : ""}: ${type(c.type)}`);
		const index = (decl.indexSignatures ?? []).map((s) => `[${s.parameters.map((p) => `${esc(p.name)}: ${type(p.type)}`).join(", ")}]: ${type(s.type)}`);
		return `{ ${[...index, ...props].join("; ")} }`;
	}

	function params(signature) {
		return (signature.parameters ?? [])
			.map((p) => `<span class="api-param">${p.flags?.isRest ? "..." : ""}${esc(p.name)}${p.flags?.isOptional || p.defaultValue ? "?" : ""}</span>: ${type(p.type)}`)
			.join(", ");
	}

	function typeParams(signature) {
		const list = signature.typeParameters ?? signature.typeParameter;
		return list?.length ? `&lt;${list.map((tp) => esc(tp.name)).join(", ")}&gt;` : "";
	}

	/** Comment display parts → markdown */
	function parts(list = []) {
		return list
			.map((p) => {
				if (p.kind === "inline-tag") {
					const label = stripPrefix(p.text, "Tone.");
					const url = typeof p.target === "number" ? links.get(p.target) : typeof p.target === "string" ? p.target : undefined;
					return url ? `[${label}](${url})` : `\`${label}\``;
				}
				return p.text;
			})
			.join("");
	}

	const liveFences = new Set(["```", "```ts", "```typescript", "```js", "```javascript"]);

	/** Turn @example blocks into runnable code */
	function examples(comment) {
		return tagContent(comment, "@example").map((tag) => {
			const lines = parts(tag.content).trim().split("\n");
			if (liveFences.has(lines[0].trimEnd())) lines[0] = "```js live";
			return lines.join("\n");
		});
	}

	function commentBody(comment, { withExamples = true } = {}) {
		if (!comment) return "";
		const out = [];
		const summary = parts(comment.summary).trim();
		if (summary) out.push(`<div class="api-description">\n\n${summary}\n\n</div>`);
		for (const tag of tagContent(comment, "@deprecated")) {
			const text = parts(tag.content).trim();
			out.push(`:::caution[Deprecated]\n${text || "This will be removed in a future version."}\n:::`);
		}
		const min = tagContent(comment, "@min")[0];
		const max = tagContent(comment, "@max")[0];
		if (min || max) {
			out.push(`**Range:** ${min ? parts(min.content).trim() : "−∞"} to ${max ? parts(max.content).trim() : "∞"}`);
		}
		if (withExamples) out.push(...examples(comment));
		const see = tagContent(comment, "@see").map((t) => parts(t.content).trim());
		if (see.length) out.push(`**See also:** ${see.join(", ")}`);
		return out.join("\n\n");
	}

	function signatureBlock(code) {
		return `<div class="api-signature"><code>${code}</code></div>`;
	}

	function parameterList(signature) {
		const list = signature.parameters ?? [];
		if (!list.length) return "";
		const items = list.map((p) => {
			const optional = p.flags?.isOptional || p.defaultValue ? ` <span class="api-optional">optional</span>` : "";
			const def = p.defaultValue && p.defaultValue !== "..." ? ` <span class="api-default">default <code>${esc(p.defaultValue)}</code></span>` : "";
			const desc = parts(p.comment?.summary).trim();
			const extra = commentBody({ blockTags: p.comment?.blockTags?.filter((t) => t.tag !== "@example") });
			return `- <span class="api-param">${esc(p.name)}</span> <code>${type(p.type)}</code>${optional}${def}${desc ? `\n\n  ${indent(desc)}` : ""}${extra ? `\n\n  ${indent(extra)}` : ""}`;
		});
		return `<div class="api-params">\n\n<p class="api-label">Parameters</p>\n\n${items.join("\n")}\n\n</div>`;
	}

	function returns(signature, { skipVoid = true } = {}) {
		const t = signature.type;
		if (!t || (skipVoid && t.type === "intrinsic" && t.name === "void")) return "";
		const desc = tagContent(signature.comment, "@returns").map((tag) => parts(tag.content).trim()).join(" ");
		return `<span class="api-label">Returns</span> <code>${type(t)}</code>${desc ? ` ${desc}` : ""}`;
	}

	function signature(name, s, { isConstructor = false } = {}) {
		const prefix = isConstructor ? `<span class="api-keyword">new</span> ` : "";
		const ret = isConstructor ? "" : `: ${type(s.type)}`;
		return [
			signatureBlock(`${prefix}${esc(name)}${isConstructor ? "" : typeParams(s)}(${params(s)})${ret}`),
			commentBody(s.comment),
			parameterList(s),
			isConstructor ? "" : returns(s),
		]
			.filter(Boolean)
			.join("\n\n");
	}

	function flagsLine(member) {
		const flag = (name, text = name) => `<span class="api-flag api-flag-${name}">${text}</span>`;
		const notes = [];
		if (member.flags?.isStatic) notes.push(flag("static"));
		if ((member.kind === Kind.Accessor && !member.setSignature) || member.flags?.isReadonly) notes.push(flag("readonly", "read-only"));
		if (member.flags?.isOptional) notes.push(flag("optional"));
		const owner = ownerName(member);
		if (owner) {
			const url = inheritedUrl(member);
			notes.push(flag("inherited", `↳ inherited from ${url ? `<a href="${url}">${owner}</a>` : owner}`));
		}
		return notes.length ? `<p class="api-flags">${notes.join(" ")}</p>` : "";
	}

	/** `heading` is omitted for the page's own reflection (function, type and variable pages) */
	function member(m, heading) {
		const out = [];
		if (heading && m.kind !== Kind.Constructor) out.push(`### ${heading}`, flagsLine(m));
		if (m.kind === Kind.Constructor) {
			out.push(...m.signatures.map((s) => signature(stripPrefix(s.name, "new "), s, { isConstructor: true })));
		} else if (m.kind === Kind.Method || m.kind === Kind.Function) {
			out.push(...m.signatures.map((s) => signature(m.name, s)));
		} else if (m.kind === Kind.Accessor) {
			const get = m.getSignature ?? m.setSignature;
			const t = m.getSignature?.type ?? m.setSignature?.parameters?.[0]?.type;
			out.push(signatureBlock(`${esc(m.name)}: ${type(t)}`), commentBody(get?.comment));
		} else if (m.kind === Kind.TypeAlias) {
			out.push(signatureBlock(`type ${esc(m.name)}${typeParams(m)} = ${type(m.type)}`), commentBody(m.comment));
		} else if (m.kind === Kind.Interface) {
			out.push(signatureBlock(`interface ${esc(m.name)}`), commentBody(m.comment));
		} else {
			out.push(signatureBlock(`${esc(m.name)}${m.flags?.isOptional ? "?" : ""}: ${type(m.type)}`), commentBody(m.comment));
			if (m.defaultValue && m.defaultValue !== "...") out.push(`**Default:** \`${m.defaultValue}\``);
		}
		const body = out.filter(Boolean).join("\n\n");
		if (!heading) return body;
		const kind = { [Kind.Method]: "method", [Kind.Constructor]: "constructor" }[m.kind] ?? (m.kind === Kind.TypeAlias || m.kind === Kind.Interface ? "type" : "property");
		return `<div class="api-member api-member-${kind}">\n\n${body}\n\n</div>`;
	}

	return { type, parts, commentBody, member, signature, signatureBlock, examples };
}

function firstSentence(markdown) {
	const plain = markdown
		.replace(/```[\s\S]*?```/g, "")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[`*_]/g, "")
		.replace(/\s+/g, " ")
		.trim();
	const match = plain.match(/^.*?[.!?](\s|$)/);
	return (match ? match[0] : plain).trim();
}

/** Astro drops the dots from folder names when it makes urls, so every page sets its own */
const slugOf = (url) => url.slice(url.startsWith("/") ? 1 : 0, url.endsWith("/") ? -1 : undefined);

function renderPage(page, render, channel, categoryClass) {
	const r = page.reflection;
	const summary = render.parts(r.comment?.summary).trim();
	const frontmatter = [
		`title: ${yamlString(r.name)}`,
		`slug: ${yamlString(slugOf(page.url))}`,
		summary && `description: ${yamlString(firstSentence(summary))}`,
		`editUrl: ${r.sources?.[0]?.url ? yamlString(r.sources[0].url) : "false"}`,
		(channel.name !== "latest" || page.internal) && "pagefind: false",
	].filter(Boolean);

	const body = [];
	const details = [`<span class="api-kind">${page.internal ? "internal " : ""}${kindLabel[r.kind]}</span>`];
	const cat = category(r);
	if (cat !== "Global") details.push(`<span class="api-category">${cat}</span>`);
	for (const ext of r.extendedTypes ?? []) details.push(`<span class="api-extends">↳ extends <code>${render.type(ext)}</code></span>`);
	body.push(`<p class="api-details ${categoryClass ?? ""}">${details.join(" ")}</p>`);

	if (r.kind === Kind.Class || r.kind === Kind.Interface || r.kind === Kind.Namespace) {
		body.push(render.commentBody(r.comment));
		let section;
		for (const { member, section: title, heading } of page.members) {
			if (title !== section) {
				section = title;
				body.push(`## ${title}`);
			}
			body.push(render.member(member, heading ?? member.name));
		}
		body.push(inheritedSummary(r, render));
	} else {
		body.push(render.member(r));
	}

	return `---\n${frontmatter.join("\n")}\n---\n\n${body.filter(Boolean).join("\n\n")}\n`;
}

/** Plumbing members inherited from base classes, listed compactly at the end of the page */
function inheritedSummary(reflection, render) {
	const byOwner = new Map();
	for (const m of reflection.children ?? []) {
		const owner = ownerName(m);
		if (!plumbing.has(owner)) continue;
		if (!byOwner.has(owner)) byOwner.set(owner, []);
		byOwner.get(owner).push(m);
	}
	if (!byOwner.size) return "";
	const lines = [...byOwner].map(([owner, members]) => {
		const items = members.map((m) => {
			const label = m.kind === Kind.Method ? `${m.name}()` : m.name;
			return render.parts([{ kind: "inline-tag", text: label, target: m.id }]);
		});
		return `- From \`${owner}\`: ${items.join(", ")}`;
	});
	return `## Inherited members\n\n${lines.join("\n")}`;
}

// ---------------------------------------------------------------------------
// overview page + sidebar
// ---------------------------------------------------------------------------

/** Sidebar and overview groups, of exported reflections only */
function groupPages(pages) {
	const groups = new Map(categoryOrder.map((c) => [c, []]));
	const extra = { Functions: [], "Other classes": [], Variables: [], "Options & types": [] };
	for (const page of pages.filter((p) => !p.internal)) {
		const r = page.reflection;
		const cat = category(r);
		if (groups.has(cat)) groups.get(cat).push(page);
		else if (r.kind === Kind.Namespace) groups.get("Unit").unshift(page);
		else if (r.kind === Kind.Function) extra.Functions.push(page);
		else if (r.kind === Kind.Class) extra["Other classes"].push(page);
		else if (r.kind === Kind.Variable) extra.Variables.push(page);
		else extra["Options & types"].push(page);
	}
	return [...groups, ...Object.entries(extra)].filter(([, list]) => list.length);
}

const pageLabel = (page) => (page.reflection.kind === Kind.Function ? `${page.reflection.name}()` : page.reflection.name);

function renderOverview(groups, channel, meta, base) {
	const intro =
		channel.name === "latest"
			? `Reference for Tone.js ${meta.version}, the current release on npm. Docs for the upcoming release are under [next](/docs/next/), and docs for [older versions](/versions/) are archived.`
			: `Reference for the upcoming Tone.js release (${meta.version}), built from the \`${channel.branch}\` branch. See the [current release](/docs/latest/) for the stable API.`;
	const sections = groups.map(
		([title, list], i) => `<div class="api-group cat-${i}">\n\n## ${title}\n\n${list.map((p) => `- [${pageLabel(p)}](${p.url})`).join("\n")}\n\n</div>`,
	);
	return [
		"---",
		`title: ${yamlString(channel.name === "latest" ? "API Reference" : "API Reference (next)")}`,
		`slug: ${yamlString(slugOf(base))}`,
		`description: ${yamlString(`Tone.js ${meta.version} API reference`)}`,
		"editUrl: false",
		channel.name !== "latest" && "pagefind: false",
		"---",
		"",
		intro,
		"",
		sections.join("\n\n"),
		"",
	]
		.filter((l) => l !== false)
		.join("\n");
}

function sidebarGroup(groups, base) {
	return {
		label: "API",
		collapsed: false,
		items: [
			{ label: "Overview", link: base },
			...groups.map(([title, list], i) => ({
				label: title,
				collapsed: true,
				items: list.map((p) => ({ label: pageLabel(p), link: p.url, attrs: { class: `cat-${i}` } })),
			})),
		],
	};
}

// ---------------------------------------------------------------------------

function redirectPage(target) {
	return `<!doctype html>
<meta charset="utf-8">
<title>Redirecting…</title>
<meta http-equiv="refresh" content="0; url=${target}">
<link rel="canonical" href="${target}">
<script>location.replace(${JSON.stringify(target)} + location.hash)</script>
`;
}

/** /docs/<channel>/… → /docs/<version>/…, plus tone.json where it has always been */
function writePublicFiles(channel, base, pages) {
	const { json, redirects } = channelPaths(channel);
	for (const url of [base, ...pages.map((p) => p.url)]) {
		const dir = join(redirects, url.slice(base.length));
		mkdirSync(dir, { recursive: true });
		writeFileSync(join(dir, "index.html"), redirectPage(url));
	}
	const versionDir = join(paths.public, base);
	mkdirSync(versionDir, { recursive: true });
	cpSync(json, join(versionDir, "tone.json"));
}

export function generateApi(channel) {
	const { json, meta: metaFile, pages: outDir } = channelPaths(channel);
	const project = JSON.parse(readFileSync(json, "utf8"));
	const meta = JSON.parse(readFileSync(metaFile, "utf8"));
	const base = `/docs/${meta.version}/`;
	const { pages, links, inheritedUrl } = planPages(project, base);
	const render = createRenderer(links, inheritedUrl);

	mkdirSync(outDir, { recursive: true });
	const files = new Set(["index.md"]);
	const groups = groupPages(pages);
	// cat-<n> classes color a category the same way in the sidebar, the overview and each page
	const categoryClass = new Map(groups.flatMap(([, list], i) => list.map((p) => [p, `cat-${i}`])));
	// internal pages aren't in a group, they take the color of their @category
	const groupIndex = new Map(groups.map(([title], i) => [title, i]));
	const classOf = (page) => categoryClass.get(page) ?? (groupIndex.has(category(page.reflection)) ? `cat-${groupIndex.get(category(page.reflection))}` : undefined);
	for (const page of pages) {
		files.add(`${page.slug}.md`);
		writeIfChanged(join(outDir, `${page.slug}.md`), renderPage(page, render, channel, classOf(page)));
	}
	writeIfChanged(join(outDir, "index.md"), renderOverview(groups, channel, meta, base));
	for (const file of readdirSync(outDir)) {
		if (!files.has(file)) rmSync(join(outDir, file), { recursive: true });
	}
	writePublicFiles(channel, base, pages);
	return sidebarGroup(groups, base);
}

/** Regenerate the pages for every channel that has been synced, and the sidebar that links them */
export function generateAll() {
	const sidebar = [];
	rmSync(join(paths.public, "docs"), { recursive: true, force: true });
	for (const channel of channels) {
		if (!existsSync(channelPaths(channel).json)) continue;
		sidebar.push(generateApi(channel));
		console.log(`generated ${channel.name} api pages`);
	}
	mkdirSync(paths.cache, { recursive: true });
	writeFileSync(paths.sidebar, JSON.stringify(sidebar, null, "\t"));
}

if (import.meta.url === `file://${process.argv[1]}`) {
	generateAll();
}
