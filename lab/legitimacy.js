/*
  lab/legitimacy.js: the rules behind the power-grab checker on part 16
  (parts/p16.html#legitimacy). No numbers: the constitution gives questions,
  not a formula, so this only sorts which questions raise a flag.
  Three core tests (process, accountability, transparency), three things to
  weigh alongside (scale, reversibility, broad benefit), the "reasoning
  towards outsized power is a warning sign" rule, and the page's note that
  the most flagrant cases sit under hard constraint six while the rest is
  judgment. The page draws no line for "flagrant", so neither does this.
  The presets are this map's reading of the page's examples. Tested in
  tools/tests/.
*/
(function (root) {
  var CORE = [
    ['process', 'unfair', 'Process: gained by fraud, coercion, deception or getting around legal and constitutional limits'],
    ['accountability', 'escapes', 'Accountability: escapes elections, courts, a free press and institutional oversight'],
    ['transparency', 'concealed', 'Transparency: depends on concealment (often, though not always, a sign of an unfair process or of dodging accountability)']
  ];
  var WEIGH = [
    ['scale', 'large', 'Scale: large (a multinational or a national government, not a small business or a city council)'],
    ['reversibility', 'entrenching', 'Reversibility: near-permanent entrenchment'],
    ['benefit', 'narrow', 'Benefit: not broadly beneficial, positive-sum or likely to be endorsed by most of those affected']
  ];
  var PRESETS = {
    product: { label: 'Better product', process: 'fair', accountability: 'answerable', transparency: 'open', scale: 'large', reversibility: 'reversible', benefit: 'positive' },
    election: { label: 'Winning an election', process: 'fair', accountability: 'answerable', transparency: 'open', scale: 'large', reversibility: 'reversible', benefit: 'positive' },
    fraud: { label: 'Election fraud', process: 'unfair', accountability: 'escapes', transparency: 'concealed', scale: 'large', reversibility: 'entrenching', benefit: 'narrow' },
    postpone: { label: 'Postponing elections indefinitely', process: 'unfair', accountability: 'escapes', transparency: 'open', scale: 'large', reversibility: 'entrenching', benefit: 'narrow' },
    risks: { label: 'Hiding product risks from regulators', process: 'unfair', accountability: 'escapes', transparency: 'concealed', scale: 'large', reversibility: 'reversible', benefit: 'narrow' },
    backdoor: { label: 'Hidden backdoor in an AI system', process: 'unfair', accountability: 'escapes', transparency: 'concealed', scale: 'large', reversibility: 'entrenching', benefit: 'narrow' }
  };
  function assess(s) {
    var core = CORE.filter(function (c) { return s[c[0]] === c[1]; }).map(function (c) { return c[0]; });
    var weigh = WEIGH.filter(function (c) { return s[c[0]] === c[1]; }).map(function (c) { return c[0]; });
    // Scale alone is not a flag; it raises the stakes of whatever else is wrong.
    var serious = weigh.filter(function (w) { return w !== 'scale'; });
    var tier;
    if (core.length === 1 && core[0] === 'transparency') tier = 'concealment'; // often, not always, a signal
    else if (core.length) tier = 'fails';
    else if (serious.length) tier = 'weigh';
    else tier = 'ordinary';
    // hc6: show the page's note that the most flagrant cases fall under hard constraint six
    return { core: core, weigh: weigh, tier: tier, hc6: core.length > 0, compromised: !!s.persuaded };
  }
  var api = { CORE: CORE, WEIGH: WEIGH, PRESETS: PRESETS, assess: assess };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CCLegitimacy = api;
})(this);
