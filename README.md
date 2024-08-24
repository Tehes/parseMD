# Markdown Parser

## Overview

The `parseMd` function is a lightweight JavaScript utility for converting Markdown syntax into HTML, including the extraction and processing of YAML Frontmatter. It supports a wide range of Markdown features including headers, lists, blockquotes, images, links, and text formatting, making it a simple yet effective tool for parsing Markdown content in web applications.

## Features

- **Frontmatter**: Extracts YAML Frontmatter from the Markdown data and returns it as a JavaScript object.
- **Headers**: Converts Markdown headers (`#`, `##`, ..., `######`) into corresponding HTML header tags (`<h1>`, `<h2>`, ..., `<h6>`). Also supports alternative header syntax.
- **Lists**: Transforms unordered (`*`) and ordered lists (`1.`, `2.`, etc.) into HTML list elements (`<ul>`, `<ol>`, `<li>`).
- **Blockquotes**: Converts Markdown blockquotes (`>`) into HTML blockquote tags (`<blockquote>`).
- **Images**: Parses Markdown image syntax (`![alt text](url)`) into HTML image tags (`<img src="url" alt="alt text" />`).
- **Links**: Converts Markdown links (`[text](url "title")`) into HTML anchor tags (`<a href="url" title="title">text</a>`).
- **Text Formatting**: Supports bold (`**text**` or `__text__`), italic (`*text*` or `_text_`), and strikethrough (`~~text~~`) text formatting.
- **Code Blocks**: Converts inline code (`\`code\``) and fenced code blocks (``` `code` ```) into HTML code elements (`\<code>\`, `<pre>`).
- **Paragraphs**: Automatically wraps standalone lines of text in paragraph tags (`<p>`).

## Installation

You can include the `parseMd` function in your project by importing it directly from your JavaScript module:

```javascript
import { parseMd } from './path-to-your-file/parseMd';
```

or use a cdn

```javascript
import { parseMd } from 'https://cdn.jsdelivr.net/gh/Tehes/parseMD@main/parseMD.js';
```

## Usage

### Example

```javascript
import { parseMd } from './parseMd';

const markdown = `
import { parseMd } from './parseMd';

const markdown = `
---
title: "My Project"
author: "John Doe"
date: "2024-08-24"
---

# My Project

This is an **example** of Markdown with Frontmatter.

## Features
- Easy to use
- Lightweight
- Supports multiple Markdown features

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

![Sample Image](https://example.com/image.jpg)

Visit [our website](https://example.com) for more details.
`;

const { metadata, content } = parseMd(markdown);
console.log(metadata); // Logs the extracted Frontmatter object
console.log(content); // Logs the converted HTML
```

### Output

```javascript
{
  metadata: {
    title: "My Project",
    author: "John Doe",
    date: "2021-08-24"
  },
  content: `
<h1>My Project</h1>
<p>This is an <b>example</b> of Markdown with Frontmatter.</p>
<h2>Features</h2>
<ul>
  <li>Easy to use</li>
  <li>Lightweight</li>
  <li>Supports multiple Markdown features</li>
</ul>
<pre class="javascript"><code>console.log("Hello, world!");</code></pre>
<img src="https://example.com/image.jpg" alt="Sample Image" />
<p>Visit <a href="https://example.com">our website</a> for more details.</p>
`
}
```

## How It Works

The parseMd function works by replacing Markdown syntax in a string with corresponding HTML tags. It processes the input string through a series of regular expression replacements, each handling a specific aspect of the Markdown syntax.

### Steps

1. Extract Frontmatter: Separates YAML Frontmatter at the beginning of the document and converts it into an object.
2. Escape HTML: Safeguards against XSS attacks by escaping any HTML tags in the input.
3. Transform Headers, Lists, Blockquotes, etc.: Identifies and converts headers, lists, and other Markdown syntax into their HTML equivalents.
4. Parse Images and Links: Detects and transforms image and link notations into HTML tags.
5. Apply Text Formatting: Processes bold, italic, and strikethrough text into HTML tags.
6. Format Code Blocks: Handles both inline and block code formats.
7. Wrap Paragraphs: Ensures any remaining text is neatly wrapped in paragraph tags.
