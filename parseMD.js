function parseFrontmatter(data) {
	const normalizedData = String(data ?? "").replace(/\r\n?/g, "\n");
	const frontmatterPattern = /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/;
	const match = frontmatterPattern.exec(normalizedData);

	if (!match) {
		return {
			frontmatterObj: {},
			data: normalizedData,
		};
	}

	return {
		frontmatterObj: parseSimpleFrontmatter(match[1]),
		data: normalizedData.slice(match[0].length),
	};
}

function parseSimpleFrontmatter(frontmatter) {
	const frontmatterObj = {};

	frontmatter.split("\n").forEach((rawLine) => {
		const line = rawLine.trim();

		if (!line || line.startsWith("#")) {
			return;
		}

		const separatorIndex = line.indexOf(":");

		if (separatorIndex === -1) {
			return;
		}

		const key = line.slice(0, separatorIndex).trim();
		const value = line.slice(separatorIndex + 1).trim();

		if (!key) {
			return;
		}

		frontmatterObj[key] = stripWrappingQuotes(value);
	});

	return frontmatterObj;
}

function stripWrappingQuotes(value) {
	if (value.length < 2) {
		return value;
	}

	const firstChar = value.at(0);
	const lastChar = value.at(-1);

	if (firstChar === '"' && lastChar === '"') {
		return value.slice(1, -1).replace(/\\"/g, '"');
	}

	if (firstChar === "'" && lastChar === "'") {
		return value.slice(1, -1).replace(/\\'/g, "'");
	}

	return value;
}

function escapeHtml(text) {
	return String(text).replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function escapeAttribute(text) {
	return escapeHtml(text);
}

function isSafeUrl(url) {
	const trimmedUrl = url.trim();

	if (!trimmedUrl || trimmedUrl.startsWith("//")) {
		return false;
	}

	const compactUrl = Array.from(trimmedUrl).filter((char) => {
		const charCode = char.charCodeAt(0);

		return charCode > 0x1f && charCode !== 0x7f && !/\s/.test(char);
	}).join("");
	const protocolMatch = /^([a-z][a-z0-9+.-]*):/i.exec(compactUrl);

	if (!protocolMatch) {
		return true;
	}

	return ["http", "https", "mailto", "tel"].includes(protocolMatch[1].toLowerCase());
}

function renderImage(altText, url) {
	const trimmedUrl = url.trim();

	if (!isSafeUrl(trimmedUrl)) {
		return escapeHtml(altText);
	}

	return `<img src="${escapeAttribute(trimmedUrl)}" alt="${escapeAttribute(altText)}" />`;
}

function renderLink(text, url, title) {
	const trimmedUrl = url.trim();

	if (!isSafeUrl(trimmedUrl)) {
		return escapeHtml(text);
	}

	const titleAttribute = title === undefined ? "" : ` title="${escapeAttribute(title)}"`;

	return `<a href="${escapeAttribute(trimmedUrl)}"${titleAttribute}>${escapeHtml(text)}</a>`;
}

function stashToken(tokens, value) {
	const token = `\u0000MDTOKEN${tokens.length}\u0000`;
	tokens.push({ token, value });

	return token;
}

function restoreTokens(text, tokens) {
	return tokens.reduce((html, item) => html.split(item.token).join(item.value), text);
}

function renderInline(text) {
	const tokens = [];
	let inline = text.replace(/`([^`\n]+)`/g, (_match, code) => {
		return stashToken(tokens, `<code>${escapeHtml(code)}</code>`);
	});

	inline = inline.replace(/!\[([^\]\n]*)\]\(([^)\s"]+)(?:\s+"([^"]*)")?\)/g, (_match, altText, url) => {
		return stashToken(tokens, renderImage(altText, url));
	});

	inline = inline.replace(/\[([^\]\n]+)\]\(([^)\s"]+)(?:\s+"([^"]*)")?\)/g, (_match, textContent, url, title) => {
		return stashToken(tokens, renderLink(textContent, url, title));
	});

	inline = escapeHtml(inline);
	inline = inline.replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>");
	inline = inline.replace(/__([^_\n]+)__/g, "<b>$1</b>");
	inline = inline.replace(/~~([^~\n]+)~~/g, "<del>$1</del>");
	inline = inline.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<i>$2</i>");
	inline = inline.replace(/(^|[^_])_([^_\n]+)_/g, "$1<i>$2</i>");

	return restoreTokens(inline, tokens);
}

function isFenceStart(line) {
	return /^\s*```[A-Za-z0-9_-]*[ \t]*$/.test(line);
}

function isFenceEnd(line) {
	return /^\s*```[ \t]*$/.test(line);
}

function getFenceLanguage(line) {
	const match = /^\s*```([A-Za-z0-9_-]*)[ \t]*$/.exec(line);

	return match ? match[1] : "";
}

function isAtxHeading(line) {
	return /^#{1,6}(?:\s+|$)/.test(line);
}

function renderAtxHeading(line) {
	const match = /^(#{1,6})\s*(.*?)\s*#*\s*$/.exec(line);

	if (!match || !match[2]) {
		return `<p>${renderInline(line)}</p>`;
	}

	return `<h${match[1].length}>${renderInline(match[2])}</h${match[1].length}>`;
}

function getSetextHeadingLevel(line) {
	if (/^={2,}\s*$/.test(line)) {
		return 1;
	}

	if (/^-{2,}\s*$/.test(line)) {
		return 2;
	}

	return 0;
}

function isBlockquote(line) {
	return /^\s*>\s?/.test(line);
}

function renderBlockquote(lines) {
	const content = lines.map((line) => renderInline(line.replace(/^\s*>\s?/, "").trim())).join("<br>");

	return `<blockquote><p>${content}</p></blockquote>`;
}

function isUnorderedListItem(line) {
	return /^\s*[*+-]\s+/.test(line);
}

function isOrderedListItem(line) {
	return /^\s*\d+\.\s+/.test(line);
}

function renderList(lines, tagName, itemPattern) {
	const items = lines.map((line) => {
		return `<li>${renderInline(line.replace(itemPattern, "").trim())}</li>`;
	});

	return `<${tagName}>\n${items.join("\n")}\n</${tagName}>`;
}

function isBlockStart(line) {
	return isFenceStart(line) ||
		isAtxHeading(line) ||
		isBlockquote(line) ||
		isUnorderedListItem(line) ||
		isOrderedListItem(line);
}

function renderCodeBlock(lines, startIndex) {
	const language = getFenceLanguage(lines[startIndex]);
	const codeLines = [];
	let index = startIndex + 1;

	while (index < lines.length && !isFenceEnd(lines[index])) {
		codeLines.push(lines[index]);
		index += 1;
	}

	if (index < lines.length) {
		index += 1;
	}

	const classAttribute = language ? ` class="${escapeAttribute(language)}"` : "";

	return {
		html: `<pre${classAttribute}><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
		nextIndex: index,
	};
}

function renderMarkdownBlocks(markdown) {
	const lines = markdown.split("\n");
	const blocks = [];
	let index = 0;

	while (index < lines.length) {
		const line = lines[index];

		if (!line.trim()) {
			index += 1;
			continue;
		}

		if (isFenceStart(line)) {
			const codeBlock = renderCodeBlock(lines, index);
			blocks.push(codeBlock.html);
			index = codeBlock.nextIndex;
			continue;
		}

		if (isAtxHeading(line)) {
			blocks.push(renderAtxHeading(line));
			index += 1;
			continue;
		}

		const setextHeadingLevel = index + 1 < lines.length ? getSetextHeadingLevel(lines[index + 1]) : 0;

		if (setextHeadingLevel) {
			blocks.push(`<h${setextHeadingLevel}>${renderInline(line.trim())}</h${setextHeadingLevel}>`);
			index += 2;
			continue;
		}

		if (isBlockquote(line)) {
			const quoteLines = [];

			while (index < lines.length && isBlockquote(lines[index])) {
				quoteLines.push(lines[index]);
				index += 1;
			}

			blocks.push(renderBlockquote(quoteLines));
			continue;
		}

		if (isUnorderedListItem(line)) {
			const listLines = [];

			while (index < lines.length && isUnorderedListItem(lines[index])) {
				listLines.push(lines[index]);
				index += 1;
			}

			blocks.push(renderList(listLines, "ul", /^\s*[*+-]\s+/));
			continue;
		}

		if (isOrderedListItem(line)) {
			const listLines = [];

			while (index < lines.length && isOrderedListItem(lines[index])) {
				listLines.push(lines[index]);
				index += 1;
			}

			blocks.push(renderList(listLines, "ol", /^\s*\d+\.\s+/));
			continue;
		}

		const paragraphLines = [];

		while (
			index < lines.length &&
			lines[index].trim() &&
			!isBlockStart(lines[index]) &&
			!(index + 1 < lines.length && getSetextHeadingLevel(lines[index + 1]))
		) {
			paragraphLines.push(lines[index].trim());
			index += 1;
		}

		blocks.push(`<p>${renderInline(paragraphLines.join(" "))}</p>`);
	}

	return blocks.join("\n");
}

export function parseMd(data) {
	const { frontmatterObj, data: content } = parseFrontmatter(data);

	return {
		metadata: frontmatterObj,
		content: renderMarkdownBlocks(content),
	};
}
