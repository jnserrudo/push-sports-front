const fs = require('fs');
const path = require('path');

function findMissingImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findMissingImports(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Extract all component tags: <ComponentName ... or <ComponentName>
            const tagRegex = /<([A-Z][a-zA-Z0-props]+)/g;
            let match;
            const usedComponents = new Set();
            while ((match = tagRegex.exec(content)) !== null) {
                usedComponents.add(match[1]);
            }

            // Extract all explicitly imported components
            const importRegex = /import\s+.*?{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
            const defaultImportRegex = /import\s+([A-Z][a-zA-Z0-9]+)\s+from\s+['"]([^'"]+)['"]/g;
            const importedComponents = new Set();
            
            while ((match = importRegex.exec(content)) !== null) {
                const imports = match[1].split(',').map(s => {
                    const parts = s.trim().split(/\s+as\s+/);
                    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
                });
                imports.forEach(i => importedComponents.add(i));
            }
            while ((match = defaultImportRegex.exec(content)) !== null) {
                importedComponents.add(match[1]);
            }

            // Also check for known React standard tag names or objects that shouldn't be imported (like Modal.Header)
            const missing = Array.from(usedComponents).filter(c => {
               if (c.includes('.')) return false; // nested components like Context.Provider
               if (importedComponents.has(c)) return false;
               if (['MapPicker', 'Fragment', 'Outlet', 'Link', 'Navigate'].includes(c)) return false; // Common ones handled differently or locally defined
               
               // Check if locally defined in the file
               const localDefRegex = new RegExp(`(?:const|let|var|function|class)\\s+${c}\\s*(?:=|\\()`, 'g');
               if (localDefRegex.test(content)) return false;
               
               return true;
            });

            if (missing.length > 0) {
                console.log(`\nFile: ${fullPath}`);
                console.log(`Missing or undefined components: ${missing.join(', ')}`);
            }
        }
    }
}

console.log("Starting audit...");
findMissingImports(path.join(__dirname, 'src/pages'));
findMissingImports(path.join(__dirname, 'src/components'));
console.log("Audit complete.");
