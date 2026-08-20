import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function render() {
  const workerUrl = new URL('../dist/server/index.js', import.meta.url);
  workerUrl.searchParams.set('test', `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request('http://localhost/', { headers: { accept: 'text/html' } }),
    { ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test('server-renders the guest house landing page', async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Гостевой дом/);
  assert.match(html, /Подбер[её]м номер в Адлере/);
  assert.match(html, /WhatsApp/);
  assert.match(html, /LodgingBusiness/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test('content keeps the editable room catalog and verified contact data', async () => {
  const content = await readFile(new URL('../app/content.ts', import.meta.url), 'utf8');
  assert.match(content, /export const rooms/);
  assert.match(content, /2-местный номер с балконом/);
  assert.match(content, /5-местная студия с кухней/);
  assert.match(content, /\+7 \(918\) 901-58-88/);
  assert.match(content, /20 августа 2026/);
});
