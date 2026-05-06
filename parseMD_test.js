import { parseMd } from "./parseMD.js";

function assert(condition, message) {
	if (!condition) {
		throw new Error(message);
	}
}

function assertEquals(actual, expected) {
	if (actual !== expected) {
		throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
	}
}

function assertIncludes(actual, expected) {
	assert(actual.includes(expected), `Expected ${JSON.stringify(actual)} to include ${JSON.stringify(expected)}`);
}

Deno.test("escapes raw HTML and removes unsafe link and image URLs", () => {
	const result = parseMd(`Hello <script>alert("x")</script>

[bad](javascript:alert(1))

![bad image](data:text/html,<svg>)`);

	assertIncludes(result.content, "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
	assert(!result.content.includes("<script>"), "Raw script tag should not be emitted");
	assert(!result.content.includes("javascript:"), "Unsafe href should not be emitted");
	assert(!result.content.includes("data:text/html"), "Unsafe image src should not be emitted");
	assert(!result.content.includes("<a "), "Unsafe link should render as text");
	assert(!result.content.includes("<img "), "Unsafe image should render as alt text");
});

Deno.test("allows safe URLs and escapes generated attributes", () => {
	const result = parseMd(`[safe](https://example.com/?a=1&b=2 "A title")

![Alt "quoted"](./image.png?size=1&name=test)`);

	assertIncludes(result.content, `<a href="https://example.com/?a=1&amp;b=2" title="A title">safe</a>`);
	assertIncludes(result.content, `<img src="./image.png?size=1&amp;name=test" alt="Alt &quot;quoted&quot;" />`);
});

Deno.test("keeps code content escaped and outside markdown parsing", () => {
	const result = parseMd(`\`\`\`js
# not a heading
* not a list
<script>alert(1)</script>
\`\`\`

Use \`**not bold**\`.`);

	assertIncludes(
		result.content,
		`<pre class="js"><code># not a heading
* not a list
&lt;script&gt;alert(1)&lt;/script&gt;</code></pre>`,
	);
	assertIncludes(result.content, "<code>**not bold**</code>");
	assert(!result.content.includes("<h1>"), "Heading syntax inside code should not be parsed");
	assert(!result.content.includes("<li>"), "List syntax inside code should not be parsed");
	assert(!result.content.includes("<b>not bold</b>"), "Inline code should not be parsed as bold");
});

Deno.test("wraps unordered and ordered lists at document boundaries", () => {
	const result = parseMd(`* A
* B

Intro

1. One
2. Two

End`);

	assertEquals(
		result.content,
		`<ul>
<li>A</li>
<li>B</li>
</ul>
<p>Intro</p>
<ol>
<li>One</li>
<li>Two</li>
</ol>
<p>End</p>`,
	);
});

Deno.test("extracts simple frontmatter and trims headings", () => {
	const result = parseMd(`---
title: "My Project"
author: 'John Doe'
description: Text with: colon
empty:

ignored line
---
# My Project`);

	assertEquals(result.metadata.title, "My Project");
	assertEquals(result.metadata.author, "John Doe");
	assertEquals(result.metadata.description, "Text with: colon");
	assertEquals(result.metadata.empty, "");
	assertEquals(result.content, "<h1>My Project</h1>");
});

Deno.test("renders the documented README-style example", () => {
	const markdown = `---
title: "My Project"
author: "John Doe"
date: "2024-08-24"
---

# My Project

This is an **example** of Markdown with simple frontmatter.

## Features

- Easy to use
- Lightweight
- No runtime dependencies

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

![Sample Image](https://example.com/image.jpg)

Visit [our website](https://example.com "Example") for more details.`;

	const result = parseMd(markdown);

	assertEquals(result.metadata.title, "My Project");
	assertIncludes(result.content, "<h1>My Project</h1>");
	assertIncludes(result.content, "<li>No runtime dependencies</li>");
	assertIncludes(
		result.content,
		`<pre class="javascript"><code>console.log(&quot;Hello, world!&quot;);</code></pre>`,
	);
	assertIncludes(result.content, `<a href="https://example.com" title="Example">our website</a>`);
});
