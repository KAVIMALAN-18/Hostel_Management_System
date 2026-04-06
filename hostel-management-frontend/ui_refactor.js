/* eslint-disable */
const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src", "pages");

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");

  // Aggressive typography changes
  content = content.replace(/text-\[10px\]/g, "text-xs");
  content = content.replace(/text-\[11px\]/g, "text-xs");
  content = content.replace(/text-\[9px\]/g, "text-xs");
  content = content.replace(/text-\[8px\]/g, "text-xs");
  content = content.replace(/font-black/g, "font-bold");

  // Tracking and uppercase adjustments for cleaner look
  content = content.replace(/tracking-\[0\.[0-9]+em\]/g, "tracking-wide");
  content = content.replace(/tracking-widest/g, "tracking-wider");
  content = content.replace(/tracking-tighter/g, "tracking-tight");

  // Dark mode contrast enhancements
  content = content.replace(/dark:bg-slate-950/g, "dark:bg-slate-900");
  content = content.replace(/dark:border-slate-800/g, "dark:border-slate-700");
  content = content.replace(/dark:text-slate-500/g, "dark:text-slate-400");

  fs.writeFileSync(filePath, content, "utf8");
};

const walkSync = (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkSync(fullPath);
    } else if (fullPath.endsWith(".jsx")) {
      replaceInFile(fullPath);
    }
  }
};

try {
  walkSync(srcDir);

  // Also hit main components directory
  const componentsDir = path.join(__dirname, "src", "components");
  walkSync(componentsDir);

  console.log("UI Standardization Complete.");
} catch (e) {
  console.error("Error during refactor:", e);
}
