function escapeHtml(text) {
    return text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Beispiel:
// Eingabe: "<script>alert('Hello!')</script>"
// Ausgabe: "&lt;script&gt;alert(&#039;Hello!&#039;)&lt;/script&gt;"
// Diese Funktion ersetzt gefährliche HTML-Zeichen durch ihre sicheren Entsprechungen.
export function parseMd(md) {
    md = escapeHtml(md);

    // Ungeordnete Liste (ul)
    // Beispiel:
    // Eingabe: "* Item 1\n* Item 2"
    // Ausgabe: "<ul>\n<li>Item 1</li><li>Item 2</li></ul>"
    md = md.replace(/^\s*\n\*/gm, '<ul>\n*');
    md = md.replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n\n$2');
    md = md.replace(/^\*(.+)/gm, '<li>$1</li>');
    md = md.replace(/<\/ul>\s*$/, '</ul>\n');

    // Geordnete Liste (ol)
    // Beispiel:
    // Eingabe: "1. First item\n2. Second item"
    // Ausgabe: "<ol>\n<li>First item</li><li>Second item</li></ol>"
    md = md.replace(/^\s*\n\d\./gm, '<ol>\n1.');
    md = md.replace(/^(\d\..+)\s*\n([^\d\.])/gm, '$1\n</ol>\n\n$2');
    md = md.replace(/^\d\.(.+)/gm, '<li>$1</li>');
    md = md.replace(/<\/ol>\s*$/, '</ol>\n');

    // Blockzitat (blockquote)
    // Beispiel:
    // Eingabe: "> This is a quote"
    // Ausgabe: "<blockquote>This is a quote</blockquote>"
    md = md.replace(/^\s*\>(.+)/gm, '<blockquote>$1</blockquote>');

    // Überschriften (h1 bis h6) mit #
    // Beispiel:
    // Eingabe: "### This is a heading"
    // Ausgabe: "<h3>This is a heading</h3>"
    md = md.replace(/[\#]{6}(.+)/g, '<h6>$1</h6>');
    md = md.replace(/[\#]{5}(.+)/g, '<h5>$1</h5>');
    md = md.replace(/[\#]{4}(.+)/g, '<h4>$1</h4>');
    md = md.replace(/[\#]{3}(.+)/g, '<h3>$1</h3>');
    md = md.replace(/[\#]{2}(.+)/g, '<h2>$1</h2>');
    md = md.replace(/[\#]{1}(.+)/g, '<h1>$1</h1>');

    // Alternative Überschriften (h1 bis h6)
    // Beispiel für H1:
    // Eingabe: "Heading 1\n====="
    // Ausgabe: "<h1>Heading 1</h1>"
    md = md.replace(/^(.+)\n={2,}/gm, '<h1>$1</h1>'); // H1 mit ===
    // Beispiel für H2:
    // Eingabe: "Heading 2\n-----"
    // Ausgabe: "<h2>Heading 2</h2>"
    md = md.replace(/^(.+)\n-{2,}/gm, '<h2>$1</h2>'); // H2 mit ---
    // Beispiel für H3:
    // Eingabe: "Heading 3\n+++"
    // Ausgabe: "<h3>Heading 3</h3>"
    md = md.replace(/^(.+)\n\+{2,}/gm, '<h3>$1</h3>'); // H3 mit +++
    // Beispiel für H4:
    // Eingabe: "Heading 4\n***"
    // Ausgabe: "<h4>Heading 4</h4>"
    md = md.replace(/^(.+)\n\*{2,}/gm, '<h4>$1</h4>'); // H4 mit ***
    // Beispiel für H5:
    // Eingabe: "Heading 5\n___"
    // Ausgabe: "<h5>Heading 5</h5>"
    md = md.replace(/^(.+)\n_{2,}/gm, '<h5>$1</h5>'); // H5 mit ___
    // Beispiel für H6:
    // Eingabe: "Heading 6\n~~~"
    // Ausgabe: "<h6>Heading 6</h6>"
    md = md.replace(/^(.+)\n\~{2,}/gm, '<h6>$1</h6>'); // H6 mit ~~~

    // Bilder (img)
    // Beispiel:
    // Eingabe: "![alt text](image.jpg)"
    // Ausgabe: "<img src="image.jpg" alt="alt text" />"
    md = md.replace(/\!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');

    // Links (a)
    // Beispiel:
    // Eingabe: "[link text](https://example.com)"
    // Ausgabe: "<a href="https://example.com">link text</a>"
    md = md.replace(/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a href="$2" title="$4">$1</a>');

    // Textstile: fett, kursiv, durchgestrichen
    // Beispiel für fett:
    // Eingabe: "**bold text**"
    // Ausgabe: "<b>bold text</b>"
    md = md.replace(/[\*\_]{2}([^\*\_]+)[\*\_]{2}/g, '<b>$1</b>');
    // Beispiel für kursiv:
    // Eingabe: "*italic text*"
    // Ausgabe: "<i>italic text</i>"
    md = md.replace(/[\*\_]{1}([^\*\_]+)[\*\_]{1}/g, '<i>$1</i>');
    // Beispiel für durchgestrichen:
    // Eingabe: "~~strikethrough~~"
    // Ausgabe: "<del>strikethrough</del>"
    md = md.replace(/[\~]{2}([^\~]+)[\~]{2}/g, '<del>$1</del>');

    // Vorformatierter Text (pre)
    // Beispiel:
    // Eingabe: "```\ncode block\n```"
    // Ausgabe: "<pre class="language">code block</pre>"
    md = md.replace(/^\s*\n\`\`\`(([^\s]+))?/gm, '<pre class="$2">');
    md = md.replace(/^\`\`\`\s*\n/gm, '</pre>\n\n');

    // Inline-Code (code)
    // Beispiel:
    // Eingabe: "`inline code`"
    // Ausgabe: "<code>inline code</code>"
    md = md.replace(/[\`]{1}([^\`]+)[\`]{1}/g, '<code>$1</code>');

    // Absatz (p)
    // Beispiel:
    // Eingabe: "This is a paragraph."
    // Ausgabe: "<p>This is a paragraph.</p>"
    md = md.replace(/^\s*(\n){2,}/gm, '\n');
    md = md.replace(/^\s*(\n)?(.+)/gm, function (m) {
        return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
    });

    // Entfernen von <p> aus <pre>
    // Beispiel:
    // Eingabe: "<pre>...\n<p>Text</p>...</pre>"
    // Ausgabe: "<pre>...Text...</pre>"
    md = md.replace(/(\<pre.+\>)\s*\n\<p\>(.+)\<\/p\>/gm, '$1$2');

    return md;
}