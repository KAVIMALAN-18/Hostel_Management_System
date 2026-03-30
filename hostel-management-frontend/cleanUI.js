import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, 'src', 'pages');
const componentsDir = path.join(__dirname, 'src', 'components');

const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix Typography sizes
    content = content.replace(/text-\[8px\]/g, 'text-xs');
    content = content.replace(/text-\[9px\]/g, 'text-xs');
    content = content.replace(/text-\[10px\]/g, 'text-xs');
    content = content.replace(/text-\[11px\]/g, 'text-sm');
    content = content.replace(/text-\[12px\]/g, 'text-sm');

    // Fix Fonts
    content = content.replace(/font-black/g, 'font-bold');

    // Fix Tracking (Letter spacing)
    content = content.replace(/tracking-\[0\.\d+em\]/g, 'tracking-wide');
    content = content.replace(/tracking-widest/g, 'tracking-wider');
    content = content.replace(/tracking-tighter/g, 'tracking-tight');
    
    // Fix Dark Mode Contrast & Borders
    content = content.replace(/dark:bg-slate-950/g, 'dark:bg-slate-900');
    content = content.replace(/dark:border-slate-800/g, 'dark:border-slate-700');
    content = content.replace(/dark:text-slate-500/g, 'dark:text-slate-400');
    content = content.replace(/dark:text-slate-400/g, 'dark:text-slate-300');
    content = content.replace(/border-slate-100/g, 'border-slate-200');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
};

const walkSync = (dir) => {
    if(!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkSync(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            replaceInFile(fullPath);
        }
    }
};

try {
    console.log('Starting UI Standardization...');
    walkSync(pagesDir);
    walkSync(componentsDir);
    console.log('UI Standardization Complete.');
} catch (e) {
    console.error('Error during refactor:', e);
}
