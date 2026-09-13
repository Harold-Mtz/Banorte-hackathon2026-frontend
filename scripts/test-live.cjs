const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
async function main() {
  const email = process.env.BOREAS_DEMO_EMAIL;
  const password = process.env.BOREAS_DEMO_PASSWORD;
  assert.ok(email && password, 'Set BOREAS_DEMO_EMAIL and BOREAS_DEMO_PASSWORD');
  const { rolldown } = await import('rolldown');
  const filename = path.resolve('src/adaptive-contract.ts');
  const bundle = await rolldown({ input: filename, external: ['zod'] });
  let normalize;
  try {
    const result = await bundle.generate({ format: 'cjs' });
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    mod._compile(result.output.find(item => item.type === 'chunk').code, filename);
    normalize = mod.exports.normalize;
  } finally { await bundle.close(); }
  const base = process.env.BOREAS_API_URL || 'http://127.0.0.1:3000/api';
  const login = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  assert.equal(login.status, 200, 'Demo login');
  const auth = await login.json();
  const result = await fetch(base + '/agent/message', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + auth.data.token }, body: JSON.stringify({ message: 'Quiero ver mi dashboard financiero' }) });
  assert.equal(result.status, 200, 'Authenticated dashboard');
  const response = normalize(await result.json());
  assert.ok(response.components.some(item => item.type === 'financial-dashboard'));
  console.log('PASS real demo login, Bearer API request and frontend response validation');
  console.log('Rendered component catalog: ' + response.components.map(item => item.type).join(', '));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
