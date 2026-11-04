// Fails when the initial JavaScript of a page exceeds its gzip budget.
// "Initial" = every <script src> and <link rel="modulepreload"> in the built HTML,
// plus the static imports they pull in, plus inline scripts. Dynamic imports are excluded.
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';

const DIST = 'dist';
const BUDGET_KB = 40;
const PAGES = ['index.html', 'en/index.html'];

function staticImports(code) {
  const found = new Set();
  const patterns = [
    /\bimport\s*(?:[\w*{}\s,$]+from\s*)?["']([^"']+)["']/g,
    /\bexport\s*[\w*{}\s,$]*from\s*["']([^"']+)["']/g,
  ];
  for (const pattern of patterns) for (const match of code.matchAll(pattern)) found.add(match[1]);
  return [...found];
}

function collect(file, seen) {
  if (seen.has(file) || !existsSync(file)) return;
  seen.add(file);
  const code = readFileSync(file, 'utf8');
  for (const spec of staticImports(code)) {
    if (!spec.startsWith('.') && !spec.startsWith('/')) continue;
    collect(spec.startsWith('/') ? join(DIST, spec) : join(dirname(file), spec), seen);
  }
}

let failed = false;
for (const page of PAGES) {
  const html = readFileSync(join(DIST, page), 'utf8');
  const files = new Set();
  for (const [, src] of html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g))
    collect(join(DIST, src), files);
  for (const [, href] of html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g))
    collect(join(DIST, href), files);
  const inlines = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) => m[1],
  );
  for (const inline of inlines) {
    for (const spec of staticImports(inline))
      if (spec.startsWith('/')) collect(join(DIST, spec), files);
  }
  let bytes = 0;
  for (const file of files) bytes += gzipSync(readFileSync(file)).length;
  for (const inline of inlines) bytes += gzipSync(inline).length;
  const kb = bytes / 1024;
  const ok = kb <= BUDGET_KB;
  failed ||= !ok;
  console.log(
    `${ok ? '✓' : '✗'} /${page.replace('index.html', '')}  ${kb.toFixed(1)} KB gzip (budget ${BUDGET_KB} KB, ${files.size} files)`,
  );
}
process.exit(failed ? 1 : 0);
