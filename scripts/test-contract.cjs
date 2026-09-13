const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const Module = require('node:module');
let normalize, adaptiveResponseSchema, percent, money, AdaptiveRenderer;
// Bundle production TypeScript in memory with Vite's existing bundler.
async function load(name) {
  const { rolldown } = await import('rolldown');
  const filename = path.resolve('src', name.includes('.') ? name : name + '.ts');
  const bundle = await rolldown({ input: filename, external: ['zod','react','react/jsx-runtime'], transform: { jsx: 'react-jsx' } });
  try {
    const output = await bundle.generate({ format: 'cjs' });
    const mod = new Module(filename, module);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    mod._compile(output.output.find(item => item.type === 'chunk').code, filename);
    return mod.exports;
  } finally { await bundle.close(); }
}
before(async () => {
  ({ normalize } = await load('adaptive-contract'));
  ({ adaptiveResponseSchema } = await load('types'));
  ({ percent, money } = await load('format'));
  ({ AdaptiveRenderer } = await load('AdaptiveRenderer.tsx'));
});
const dashboard = { id: 'dashboard', type: 'financial-dashboard', data: { monthlyIncome: 30000, monthlyExpenses: 10000, monthlyDebtPayments: 2000, availableMonthlyCash: 18000, currentSavings: 50000, creditScore: null, goals: [], movements: [] } };
const direct = { sessionId: 'session', message: 'Updated', components: [dashboard] };
test('accepts direct adaptive response and success/data envelope', () => {
  assert.deepEqual(normalize(direct), direct);
  assert.deepEqual(normalize({ success: true, data: direct }), direct);
});
test('normalizes backend ui.components.props envelope', () => {
  const { data, ...rest } = dashboard;
  assert.deepEqual(normalize({ success: true, data: { sessionId: 'session', message: 'Updated', ui: { components: [{ ...rest, props: data }] } } }), direct);
});
test('rejects missing, malformed and non-finite financial data', () => {
  for (const value of [null, {}, { ...direct, components: [{ ...dashboard, data: {} }] }, { ...direct, components: [{ ...dashboard, data: { ...dashboard.data, monthlyIncome: NaN } }] }]) assert.throws(() => normalize(value));
});
test('unknown components remain inert and can reach the safe renderer fallback', () => {
  const result = normalize({ ...direct, components: [{ id: 'unknown', type: 'unrecognized', data: { html: '<script>bad()</script>' } }, dashboard] });
  assert.equal(result.components.length, 2);
  assert.equal(result.components[0].type, 'unrecognized');
});
test('rejects actions outside the closed catalog', () => {
  assert.equal(adaptiveResponseSchema.safeParse({ ...direct, components: [{ id: 'confirm', type: 'confirmation', data: { message: 'Confirm', action: 'EXECUTE_ARBITRARY_CODE' } }] }).success, false);
});
test('renders catalog percentage points without multiplying the rate', () => {
  assert.equal(percent(10.5), '10.5%');
  assert.equal(percent(null), 'Sin dato');
  assert.equal(money(undefined), 'Sin dato');
});

test('renderer escapes model text and uses a safe unknown-component fallback', () => {
  const response = { ...direct, components: [{ id: 'unknown', type: 'unknown', data: { html: '<script>bad()</script>' } }, { id: 'confirm', type: 'confirmation', data: { message: '<script>bad()</script>', action: 'CONFIRM_CREATE_SAVINGS_GOAL' } }] };
  const html = renderToStaticMarkup(React.createElement(AdaptiveRenderer, { response, onInteract() {} }));
  assert.ok(html.includes('continuar con el resto del tablero'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});
const fixturesFile = process.env.BOREAS_CONTRACT_FIXTURES || path.resolve('../../Back/Banorte-hackathon-backend/artifacts/contract-fixtures.json');
test('actual PostgreSQL/API responses validate and render with the frontend registry', { skip: !fs.existsSync(fixturesFile) }, () => {
  const fixtures = JSON.parse(fs.readFileSync(fixturesFile, 'utf8'));
  assert.ok(fixtures.length > 10);
  for (const raw of fixtures) {
    const response = normalize(raw);
    const html = renderToStaticMarkup(React.createElement(AdaptiveRenderer, { response, onInteract() {} }));
    assert.ok(html.includes('Tu tablero financiero'));
    assert.ok(!html.includes('NaN') && !html.includes('Invalid Date'));
  }
});
