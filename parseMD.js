// This function replaces dangerous HTML characters with their safe equivalents.
function escapeHtml(text) {
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function parseMd(md) {
    // Escape HTML entities to prevent injection attacks
    // Example:
    // Input: "<script>alert('Hello!')</script>"
    // Output: "&lt;script&gt;alert(&#039;Hello!&#039;)&lt;/script&gt;"
    md = escapeHtml(md);

    // Unordered List (ul)
    // Example:
    // Input: "* Item 1\n* Item 2"
    // Output: "<ul>\n<li>Item 1</li><li>Item 2</li></ul>"
    md = md.replace(/^\s*\n\*/gm, '<ul>\n*');
    md = md.replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2');
    md = md.replace(/^\*(.+)/gm, '<li>$1</li>');
    md = md.replace(/<\/ul>\s*$/, '</ul>\n');

    // Ordered List (ol)
    // Example:
    // Input: "1. First item\n2. Second item"
    // Output: "<ol>\n<li>First item</li><li>Second item</li></ol>"
    md = md.replace(/^\s*\n\d\./gm, '<ol>\n1.');
    md = md.replace(/^(\d\..+)\s*\n([^\d\.])/gm, '$1\n</ol>\n\n$2');
    md = md.replace(/^\d\.(.+)/gm, '<li>$1</li>');
    md = md.replace(/<\/ol>\s*$/, '</ol>\n');

    // Blockquote
    // Example:
    // Input: "> This is a quote"
    // Output: "<blockquote>This is a quote</blockquote>"
    md = md.replace(/^\s*\>(.+)/gm, '<blockquote>$1</blockquote>');

    // Headings (h1 to h6) with #
    // Example:
    // Input: "### This is a heading"
    // Output: "<h3>This is a heading</h3>"
    md = md.replace(/^[#]{6}(.+)/gm, '<h6>$1</h6>');
    md = md.replace(/^[#]{5}(.+)/gm, '<h5>$1</h5>');
    md = md.replace(/^[#]{4}(.+)/gm, '<h4>$1</h4>');
    md = md.replace(/^[#]{3}(.+)/gm, '<h3>$1</h3>');
    md = md.replace(/^[#]{2}(.+)/gm, '<h2>$1</h2>');
    md = md.replace(/^[#]{1}(.+)/gm, '<h1>$1</h1>');

    // Alternative Headings (h1 to h6)
    md = md.replace(/^(.+)\n={2,}/gm, '<h1>$1</h1>'); // H1 with ===
    md = md.replace(/^(.+)\n-{2,}/gm, '<h2>$1</h2>'); // H2 with ---
    md = md.replace(/^(.+)\n\+{2,}/gm, '<h3>$1</h3>'); // H3 with +++
    md = md.replace(/^(.+)\n\*{2,}/gm, '<h4>$1</h4>'); // H4 with ***
    md = md.replace(/^(.+)\n_{2,}/gm, '<h5>$1</h5>'); // H5 with ___
    md = md.replace(/^(.+)\n\~{2,}/gm, '<h6>$1</h6>'); // H6 with ~~~

    // Images
    // Example:
    // Input: "![alt text](image.jpg)"
    // Output: "<img src="image.jpg" alt="alt text" />"
    md = md.replace(/\!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');

    // Links
    // Example:
    // Input: "[link text](https://example.com)"
    // Output: "<a href="https://example.com">link text</a>"
    md = md.replace(/\[([^\]]+)\]\(([^\)\"]+)(\"(.+)\")?\)/g, '<a href="$2" title="$4">$1</a>');

    // Font Styles: bold, italic, strikethrough
    md = md.replace(/\*\*([^\*]+)\*\*/g, '<b>$1</b>'); // **bold text**
    md = md.replace(/\*([^\*]+)\*/g, '<i>$1</i>'); // *italic text*
    md = md.replace(/~~([^\~]+)~~/g, '<del>$1</del>'); // ~~strikethrough~~

    // Preformatted text (pre)
    // Example:
    // Input: "```\ncode block\n```"
    // Output: "<pre class="language">code block</pre>"
    md = md.replace(/^\s*\n\`\`\`(([^\s]+))?/gm, '<pre class="$2">');
    md = md.replace(/^\`\`\`\s*\n/gm, '</pre>\n\n');
    md = md.replace(/```([^\s]*)\n([\s\S]*?)\n```/g, '<pre class="$1">$2</pre>');

    // Inline Code (code)
    // Example:
    // Input: "`inline code`"
    // Output: "<code>inline code</code>"
    md = md.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Paragraphs (p)
    md = md.replace(/^\s*(\n){2,}/gm, '\n');
    md = md.replace(/^\s*(\n)?(.+)/gm, function (m) {
        return /<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
    });

    // Remove <p> tags from <pre>
    md = md.replace(/(<pre[^>]*>)(\s*\n<p>([^<]+)<\/p>)<\/pre>/g, '$1$3</pre>');

    return md;
}