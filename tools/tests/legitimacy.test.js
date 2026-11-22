// node --test tools/tests/legitimacy.test.js
// Rules from parts/p16.html#legitimacy: three tests, three weights, the
// compromise signal, and hard constraint six for the most flagrant cases.
const test = require('node:test');
const assert = require('node:assert');
const L = require('../../lab/legitimacy.js');

test('the page lists three core tests and three things to weigh', () => {
  assert.deepStrictEqual(L.CORE.map((c) => c[0]), ['process', 'accountability', 'transparency']);
  assert.deepStrictEqual(L.WEIGH.map((c) => c[0]), ['scale', 'reversibility', 'benefit']);
});

test('fair methods the page names (better products, winning elections) raise no flag', () => {
  for (const k of ['product', 'election']) {
    const r = L.assess(L.PRESETS[k]);
    assert.strictEqual(r.core.length, 0, k);
    assert.strictEqual(r.tier, 'ordinary', k);
  }
});

test("the page's illegitimate examples fail at least one core test", () => {
  for (const k of ['fraud', 'postpone', 'risks', 'backdoor']) {
    assert.ok(L.assess(L.PRESETS[k]).core.length >= 1, k);
  }
});

test('scale alone raises the stakes but is not a flag', () => {
  assert.deepStrictEqual(L.assess(L.PRESETS.election).weigh, ['scale']);
  assert.strictEqual(L.assess(L.PRESETS.election).tier, 'ordinary');
});

test('passing all three tests but entrenching or narrow means weigh, not clear', () => {
  const s = { process: 'fair', accountability: 'answerable', transparency: 'open', scale: 'large', reversibility: 'entrenching', benefit: 'positive' };
  assert.strictEqual(L.assess(s).tier, 'weigh');
  assert.deepStrictEqual(L.assess(s).weigh, ['scale', 'reversibility']);
});

test('all three failing, at large scale and near-permanent, reaches the hard-constraint-six zone', () => {
  assert.strictEqual(L.assess(L.PRESETS.backdoor).tier, 'flagrant');
  assert.strictEqual(L.assess(L.PRESETS.fraud).tier, 'flagrant');
  assert.strictEqual(L.assess(L.PRESETS.risks).tier, 'illegitimate'); // reversible
  assert.strictEqual(L.assess({ ...L.PRESETS.backdoor, scale: 'small' }).tier, 'illegitimate');
});

test('concealment alone is a flag, not a verdict of flagrancy', () => {
  const r = L.assess({ ...L.PRESETS.product, transparency: 'concealed' });
  assert.deepStrictEqual(r.core, ['transparency']);
  assert.strictEqual(r.tier, 'illegitimate');
});

test('being persuaded that outsized power would help is flagged whatever the case', () => {
  assert.strictEqual(L.assess({ ...L.PRESETS.product, persuaded: true }).compromised, true);
  assert.strictEqual(L.assess(L.PRESETS.product).compromised, false);
});
