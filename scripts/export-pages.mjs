import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDirectory = new URL('../dist-pages/', import.meta.url);
const basePath = process.env.SITE_BASE_PATH ?? '/';

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(new URL('../dist/client/', import.meta.url), outputDirectory, { recursive: true });

const workerModule = await import(`${new URL('../dist/server/index.js', import.meta.url).href}?pages=${Date.now()}`);
const response = await workerModule.default.fetch(
  new Request('http://localhost/'),
  { ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);

if (!response.ok) throw new Error(`Could not render the Pages entrypoint: ${response.status}`);

const html = await response.text();
const index = join(fileURLToPath(outputDirectory), 'index.html');
await writeFile(index, html, 'utf8');

// GitHub Pages needs the project path for direct asset requests and client navigation.
// The Vite base setting handles emitted assets; this guard keeps the static HTML safe
// if a future vinext version emits one root-relative path in the server response.
if (basePath !== '/') {
  const rendered = html
    .replaceAll('="/_next/', `="${basePath}_next/`)
    .replaceAll('="/images/', `="${basePath}images/`)
    .replaceAll('="/favicon.svg', `="${basePath}favicon.svg`);
  if (rendered !== html) await writeFile(index, rendered, 'utf8');
}

console.log(`Static Pages bundle written to ${index}`);
