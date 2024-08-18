function escapeHtml(text) {
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Example:
// Input: "<script>alert('Hello!')</script>"
// Output: "&lt;script&gt;alert(&#039;Hello!&#039;)&lt;/script&gt;"
// This function replaces dangerous HTML characters with their safe equivalents.
export function parseMd(md) {
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

    // Headers (h1 to h6) with #
    // Example:
    // Input: "### This is a heading"
    // Output: "<h3>This is a heading</h3>"
    md = md.replace(/[\#]{6}(.+)/g, '<h6>$1</h6>');
    md = md.replace(/[\#]{5}(.+)/g, '<h5>$1</h5>');
    md = md.replace(/[\#]{4}(.+)/g, '<h4>$1</h4>');
    md = md.replace(/[\#]{3}(.+)/g, '<h3>$1</h3>');
    md = md.replace(/[\#]{2}(.+)/g, '<h2>$1</h2>');
    md = md.replace(/[\#]{1}(.+)/g, '<h1>$1</h1>');

    // Alternative Headers (h1 to h6)
    // Example for H1:
    // Input: "Heading 1\n====="
    // Output: "<h1>Heading 1</h1>"
    md = md.replace(/^(.+)\n={2,}/gm, '<h1>$1</h1>'); // H1 with ===
    // Example for H2:
    // Input: "Heading 2\n-----"
    // Output: "<h2>Heading 2</h2>"
    md = md.replace(/^(.+)\n-{2,}/gm, '<h2>$1</h2>'); // H2 with ---
    // Example for H3:
    // Input: "Heading 3\n+++"
    // Output: "<h3>Heading 3</h3>"
    md = md.replace(/^(.+)\n\+{2,}/gm, '<h3>$1</h3>'); // H3 with +++
    // Example for H4:
    // Input: "Heading 4\n***"
    // Output: "<h4>Heading 4</h4>"
    md = md.replace(/^(.+)\n\*{2,}/gm, '<h4>$1</h4>'); // H4 with ***
    // Example for H5:
    // Input: "Heading 5\n___"
    // Output: "<h5>Heading 5</h5>"
    md = md.replace(/^(.+)\n_{2,}/gm, '<h5>$1</h5>'); // H5 with ___
    // Example for H6:
    // Input: "Heading 6\n~~~"
    // Output: "<h6>Heading 6</h6>"
    md = md.replace(/^(.+)\n\~{2,}/gm, '<h6>$1</h6>'); // H6 with ~~~

    // Images (img)
    // Example:
    // Input: "![alt text](image.jpg)"
    // Output: "<img src="image.jpg" alt="alt text" />"
    md = md.replace(/\!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');

    // Links (a)
    // Example:
    // Input: "[link text](https://example.com)"
    // Output: "<a href="https://example.com">link text</a>"
    md = md.replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a href="$2" title="$4">$1</a>');

    // Text Styles: bold, italic, strikethrough
    // Example for bold:
    // Input: "**bold text**"
    // Output: "<b>bold text</b>"
    md = md.replace(/[\*\_]{2}([^\*\_]+)[\*\_]{2}/g, '<b>$1</b>');
    // Example for italic:
    // Input: "*italic text*"
    // Output: "<i>italic text</i>"
    md = md.replace(/[\*\_]{1}([^\*\_]+)[\*\_]{1}/g, '<i>$1</i>');
    // Example for strikethrough:
    // Input: "~~strikethrough~~"
    // Output: "<del>strikethrough</del>"
    md = md.replace(/[\~]{2}([^\~]+)[\~]{2}/g, '<del>$1</del>');

    // Preformatted Text (pre)
    // Example:
    // Input: "```\ncode block\n```"
    // Output: "<pre class="language">code block</pre>"
    md = md.replace(/^\s*\n\`\`\`(([^\s]+))?/gm, '<pre class="$2">');
    md = md.replace(/^\`\`\`\s*\n/gm, '</pre>\n\n');

    // Inline Code (code)
    // Example:
    // Input: "`inline code`"
    // Output: "<code>inline code</code>"
    md = md.replace(/[\`]{1}([^\`]+)[\`]{1}/g, '<code>$1</code>');

    // Paragraph (p)
    // Example:
    // Input: "This is a paragraph."
    // Output: "<p>This is a paragraph.</p>"
    md = md.replace(/^\s*(\n){2,}/gm, '\n');
    md = md.replace(/^\s*(\n)?(.+)/gm, function (m) {
        return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
    });

    // Remove <p> from <pre>
    // Example:
    // Input: "<pre>...\n<p>Text</p>...</pre>"
    // Output: "<pre>...Text...</pre>"
    md = md.replace(/(\<pre.+\>)\s*\n\<p\>(.+)\<\/p\>/gm, '$1$2');

    return md;
}