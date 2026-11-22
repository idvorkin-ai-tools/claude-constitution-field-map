// node --test tools/tests/legitimacy.test.js
// Checks the rules in lab/legitimacy.js against parts/p16.html#legitimacy
// (three tests, three weights, the compromise signal, the hard-constraint-six
// note). The preset answers are this map's reading of the page's examples,
// so these tests check consistency with that reading, not page numbers.
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

test('any failed test brings up the hard-constraint-six note; the page draws no flagrant line', () => {
  for (const k of ['fraud', 'postpone', 'risks', 'backdoor']) {
    const r = L.assess(L.PRESETS[k]);
    assert.strictEqual(r.tier, 'fails', k);
    assert.strictEqual(r.hc6, true, k);
  }
  assert.strictEqual(L.assess(L.PRESETS.product).hc6, false);
});

test('concealment alone is a warning sign, not a verdict', () => {
  const r = L.assess({ ...L.PRESETS.product, transparency: 'concealed' });
  assert.deepStrictEqual(r.core, ['transparency']);
  assert.strictEqual(r.tier, 'concealment');
});

test('being persuaded that outsized power would help is flagged whatever the case', () => {
  assert.strictEqual(L.assess({ ...L.PRESETS.product, persuaded: true }).compromised, true);
  assert.strictEqual(L.assess(L.PRESETS.product).compromised, false);
});
