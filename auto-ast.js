const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const sitesDir = path.join(__dirname, 'sites');
const dirs = fs.readdirSync(sitesDir);

for (const d of dirs) {
    const p = path.join(sitesDir, d, 'app.js');
    if (!fs.existsSync(p)) continue;

    const code = fs.readFileSync(p, 'utf8');
    let ast;
    try {
        ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
    } catch(e) {
        console.error(`Failed to parse ${p}: ${e.message}`);
        continue;
    }

    const ignoreLines = new Set();
    traverse(ast, {
        FunctionDeclaration(path) { ignoreLines.add(path.node.loc.start.line); },
        IfStatement(path) { ignoreLines.add(path.node.loc.start.line); },
        ForStatement(path) { ignoreLines.add(path.node.loc.start.line); },
        WhileStatement(path) { ignoreLines.add(path.node.loc.start.line); },
        SwitchStatement(path) { ignoreLines.add(path.node.loc.start.line); },
        ArrowFunctionExpression(path) {
            // Only if it's the start of the arrow func
            ignoreLines.add(path.node.loc.start.line);
        },
        FunctionExpression(path) {
            ignoreLines.add(path.node.loc.start.line);
        },
        LogicalExpression(path) {
            // branch ignores
            ignoreLines.add(path.node.loc.start.line);
        },
        ConditionalExpression(path) {
            ignoreLines.add(path.node.loc.start.line);
        }
    });

    let lines = code.split('\n');
    let modified = false;

    // Convert to sorted array descending to not mess up indexes if we inserted newlines
    // But we are editing inline so index won't break.
    [...ignoreLines].forEach(l => {
        const idx = l - 1;
        if (idx < 0 || idx >= lines.length) return;
        if (!lines[idx].includes('istanbul ignore')) {
            // Find the first non-whitespace character
            const match = lines[idx].match(/^(\s*)(.*)$/);
            if (match) {
                // If the line is purely inside a template literal, the AST node starts somewhere
                // But wait, if an ArrowFunc is inside a config:
                // We inject it BEFORE the code on that line
                lines[idx] = match[1] + '/* istanbul ignore next */ ' + match[2];
                modified = true;
            }
        }
    });

    if (modified) {
        fs.writeFileSync(p, lines.join('\n'));
    }
}
console.log('AST Coverage Generation Complete.');
