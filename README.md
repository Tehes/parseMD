# Markdown Parser

## Overview

The `parseMd` function is a lightweight JavaScript utility for converting Markdown syntax into HTML. It supports a wide range of Markdown features including headers, lists, blockquotes, images, links, and text formatting, making it a simple yet effective tool for parsing Markdown content in web applications.

## Features

- **Headers**: Converts Markdown headers (`#`, `##`, ..., `######`) into corresponding HTML header tags (`<h1>`, `<h2>`, ..., `<h6>`). Also supports alternative header syntax.
- **Lists**: Transforms unordered (`*`) and ordered lists (`1.`, `2.`, etc.) into HTML list elements (`<ul>`, `<ol>`, `<li>`).
- **Blockquotes**: Converts Markdown blockquotes (`>`) into HTML blockquote tags (`<blockquote>`).
- **Images**: Parses Markdown image syntax (`![alt text](url)`) into HTML image tags (`<img src="url" alt="alt text" />`).
- **Links**: Converts Markdown links (`[text](url "title")`) into HTML anchor tags (`<a href="url" title="title">text</a>`).
- **Text Formatting**: Supports bold (`**text**` or `__text__`), italic (`*text*` or `_text_`), and strikethrough (`~~text~~`) text formatting.
- **Code Blocks**: Converts inline code (`\`code\``) and fenced code blocks (``` `code` ```) into HTML code elements (`<code>`, `<pre>`).
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
# My Project

This is an **example** of a Markdown document.

## Features

- Easy to use
- Lightweight
- Supports multiple Markdown features

> "Markdown is a lightweight markup language."

\`\`\`javascript
console.log("Hello, world!");
\`\`\`

![Sample Image](https://example.com/image.jpg)

For more details, visit [our website](https://example.com).
`;

const html = parseMd(markdown);
console.log(html);
```
### Output

```html
<h1>My Project</h1>
<p>This is an <b>example</b> of a Markdown document.</p>
<h2>Features</h2>
<ul>
  <li>Easy to use</li>
  <li>Lightweight</li>
  <li>Supports multiple Markdown features</li>
</ul>
<blockquote>"Markdown is a lightweight markup language."</blockquote>
<pre class="javascript"><code>console.log("Hello, world!");</code></pre>
<img src="https://example.com/image.jpg" alt="Sample Image" />
<p>For more details, visit <a href="https://example.com" title="">our website</a>.</p>
```

## How It Works

The parseMd function works by replacing Markdown syntax in a string with corresponding HTML tags. It processes the input string through a series of regular expression replacements, each handling a specific aspect of the Markdown syntax.

### Steps:

	1.	Escape HTML: Before processing the Markdown, the function escapes any existing HTML tags in the input to prevent XSS attacks.
	2.	Transform Headers: Converts lines starting with #, ##, etc., into header tags (<h1>, <h2>, etc.).
	3.	Convert Lists: Recognizes and processes both unordered (*) and ordered lists (1.) into appropriate HTML list structures.
	4.	Handle Blockquotes: Converts lines starting with > into HTML blockquotes.
	5.	Parse Images and Links: Identifies and transforms Markdown image and link syntax into HTML <img> and <a> tags.
	6.	Apply Text Formatting: Converts bold, italic, and strikethrough syntax into corresponding HTML tags.
	7.	Format Code Blocks: Handles both inline and block-level code, wrapping them in <code> and <pre> tags.
	8.	Wrap Paragraphs: Ensures any remaining standalone text is wrapped in paragraph tags (<p>).
