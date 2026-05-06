# parseMD

`parseMD` is a small, dependency-free Markdown utility for browser and CDN usage. It converts a limited Markdown subset
to HTML and extracts simple frontmatter from the beginning of a document.

It is intentionally not a complete CommonMark parser and it does not parse full YAML.

## Features

- **Simple frontmatter**: Extracts `key: value` pairs between opening and closing `---` lines.
- **Headings**: Supports `#` through `######` and setext-style H1/H2 headings.
- **Lists**: Supports flat unordered lists with `*`, `-`, or `+` and flat ordered lists like `1.`.
- **Blockquotes**: Converts consecutive `>` lines into one `<blockquote>`.
- **Images**: Converts `![alt text](url)` into safe `<img>` tags.
- **Links**: Converts `[text](url)` and `[text](url "title")` into safe `<a>` tags.
- **Text formatting**: Supports `**bold**`, `__bold__`, `*italic*`, `_italic_`, and `~~strikethrough~~`.
- **Code**: Supports fenced code blocks and inline code.
- **Escaping**: Escapes raw HTML by default and only allows relative URLs plus `http:`, `https:`, `mailto:`, and `tel:`
  URLs.

## Installation

Import the function directly as an ES module:

```javascript
import { parseMd } from "./parseMD.js";
```

Or use it from a CDN:

```javascript
import { parseMd } from "https://cdn.jsdelivr.net/gh/Tehes/parseMD@main/parseMD.js";
```

## Usage

```javascript
import { parseMd } from "./parseMD.js";

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

Visit [our website](https://example.com "Example") for more details.
`;

const { metadata, content } = parseMd(markdown);

console.log(metadata);
console.log(content);
```

Output:

```javascript
{
  metadata: {
    title: "My Project",
    author: "John Doe",
    date: "2024-08-24"
  },
  content: `<h1>My Project</h1>
<p>This is an <b>example</b> of Markdown with simple frontmatter.</p>
<h2>Features</h2>
<ul>
<li>Easy to use</li>
<li>Lightweight</li>
<li>No runtime dependencies</li>
</ul>
<pre class="javascript"><code>console.log(&quot;Hello, world!&quot;);</code></pre>
<img src="https://example.com/image.jpg" alt="Sample Image" />
<p>Visit <a href="https://example.com" title="Example">our website</a> for more details.</p>`
}
```

## Frontmatter Scope

Frontmatter is deliberately simple:

```markdown
---
title: "Example"
published: true
description: Text with: colon
---
```

Values are returned as strings. Matching single or double quotes around a value are removed. Nested YAML objects,
arrays, dates, booleans, and numbers are not parsed into typed values.

## Security Notes

Raw HTML in Markdown input is escaped. For links and images, unsafe URL schemes such as `javascript:` and `data:` are
ignored, so the generated HTML does not include unsafe `href` or `src` attributes.
