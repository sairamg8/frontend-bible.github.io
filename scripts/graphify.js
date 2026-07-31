import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve(process.cwd(), 'docs');
const OUTPUT_DIR = path.resolve(process.cwd(), 'graphify-out');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function scanDocsDirectory(dir) {
  const nodes = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      // EXCLUDE VENDOR & TEMP NOISE EXPLICITLY
      if (entry.isDirectory()) {
        if (['node_modules', '.yarn', '.docusaurus', 'build', 'dist', '.git', 'graphify-out'].includes(entry.name)) {
          continue;
        }
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const relativePath = path.relative(DOCS_DIR, fullPath);
        const parts = relativePath.split(path.sep);
        const bible = parts.length > 1 ? parts[0] : 'general';
        
        const content = fs.readFileSync(fullPath, 'utf-8');
        const words = content.trim().split(/\s+/).length;

        const headings = content
          .split('\n')
          .filter((line) => line.startsWith('#'))
          .map((line) => line.replace(/^#+\s*/, '').trim());

        const title = headings[0] || entry.name;

        nodes.push({
          id: relativePath,
          bible,
          filename: entry.name,
          title,
          sections: headings.slice(1),
          wordCount: words,
        });
      }
    }
  }

  traverse(dir);
  return nodes;
}

console.log('🚀 Running Graphify Engine for Frontend Master Bibles (Excluding Vendor Noise)...');
const nodes = scanDocsDirectory(DOCS_DIR);

const graphData = {
  project: 'Frontend Engineering Master Bibles',
  generatedAt: new Date().toISOString(),
  totalBibles: new Set(nodes.map((n) => n.bible)).size,
  totalFiles: nodes.length,
  totalWordCount: nodes.reduce((sum, n) => sum + n.wordCount, 0),
  nodes,
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'knowledge_graph.json'),
  JSON.stringify(graphData, null, 2),
  'utf-8'
);

let mdSummary = `# 🕸️ Frontend Master Bibles Knowledge Graph\n\n`;
mdSummary += `**Generated At**: ${graphData.generatedAt}\n`;
mdSummary += `**Total Bibles**: ${graphData.totalBibles}\n`;
mdSummary += `**Total Documentation Files**: ${graphData.totalFiles}\n`;
mdSummary += `**Total Word Count**: ${graphData.totalWordCount.toLocaleString()} words\n\n`;
mdSummary += `---\n\n## 📚 Bibles Index & Content Depth\n\n`;

const grouped = nodes.reduce((acc, node) => {
  acc[node.bible] = acc[node.bible] || [];
  acc[node.bible].push(node);
  return acc;
}, {});

for (const [bible, bNodes] of Object.entries(grouped)) {
  const bibleWords = bNodes.reduce((sum, n) => sum + n.wordCount, 0);
  mdSummary += `### 📖 \`${bible}\` (${bNodes.length} files, ${bibleWords.toLocaleString()} words)\n`;
  for (const node of bNodes) {
    mdSummary += `- **[${node.filename}](file://${path.join(DOCS_DIR, node.id)})**: ${node.title} _(${node.wordCount} words)_\n`;
  }
  mdSummary += `\n`;
}

fs.writeFileSync(path.join(OUTPUT_DIR, 'GRAPH_SUMMARY.md'), mdSummary, 'utf-8');

console.log(`✅ Graphify completed successfully!`);
console.log(`📊 Output written to graphify-out/knowledge_graph.json & graphify-out/GRAPH_SUMMARY.md`);
