/*
  widgets/legitimacy.js: the power-grab checker on part 16 (#legitimacy).
  Needs https://idvorkin-ai-tools.github.io/assets/widgets.js and
  ../lab/legitimacy.js (the rules) loaded first. Styles are in paper.css (.lg-*).
*/
(function () {
  var H = window.AIToolsWidgets, L = window.CCLegitimacy;
  if (!H || !L) return;
  var OPTS = [
    ['process', 'Process', [['fair', 'Fair methods'], ['unfair', 'Fraud, coercion or deception']]],
    ['accountability', 'Accountability', [['answerable', 'Answers to real checks'], ['escapes', 'Escapes them']]],
    ['transparency', 'Transparency', [['open', 'Done in the open'], ['concealed', 'Relies on concealment']]],
    ['scale', 'Scale', [['small', 'Small'], ['large', 'Large']]],
    ['reversibility', 'Reversibility', [['reversible', 'Reversible'], ['entrenching', 'Near-permanent']]],
    ['benefit', 'Benefit', [['positive', 'Broadly beneficial'], ['narrow', 'Narrow, not endorsed']]]
  ];
  var LAMP = ['process', 'checks', 'openness', 'scale', 'permanence', 'benefit'];
  var WORSE = { reversibility: 'near-permanent entrenchment', benefit: 'narrow benefit' };
  function text(list) { return list.length < 2 ? list.join('') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1]; }

  H.register('legitimacy', function (el) {
    var p = 'lg' + H.uid();
    el.innerHTML = H.presets(Object.keys(L.PRESETS).map(function (k) { return [k, L.PRESETS[k].label]; })) +
      '<div class="lg-grid">' + OPTS.map(function (o) {
        return '<fieldset class="lg-f"><legend>' + o[1] + '</legend>' + o[2].map(function (c) {
          return '<label><input type="radio" name="' + p + '-' + o[0] + '" value="' + c[0] + '"> ' + c[1] + '</label>';
        }).join('') + '</fieldset>';
      }).join('') + '</div>' +
      '<label class="lg-chk"><input type="checkbox" id="' + p + '-pers"> Claude finds itself persuaded that helping this actor gain outsized power would be good</label>' +
      '<svg class="lg-svg" viewBox="0 0 360 70" aria-hidden="true" id="' + p + '-svg"></svg>' +
      '<p class="lg-verdict" id="' + p + '-v"></p><p class="lg-note" id="' + p + '-hc" hidden>The page: the most flagrant of these sit under hard constraint six, which nothing unlocks; everything else is judgment.</p><ul class="lg-flags" id="' + p + '-fl"></ul>' + H.sum(p + '-sum');
    var pers = H.$(el, p + '-pers');

    function state() {
      var s = { persuaded: pers.checked };
      OPTS.forEach(function (o) { var c = el.querySelector('input[name="' + p + '-' + o[0] + '"]:checked'); s[o[0]] = c ? c.value : o[2][0][0]; });
      return s;
    }
    function draw() {
      var s = state(), r = L.assess(s);
      var svg = '<line x1="180" y1="8" x2="180" y2="44" class="lg-sep"/>' +
        H.t(90, 8, 'THE THREE TESTS', 'lg-h', 'text-anchor="middle"') + H.t(270, 8, 'WEIGHED ALONGSIDE', 'lg-h', 'text-anchor="middle"');
      OPTS.forEach(function (o, i) {
        var bad = r.core.indexOf(o[0]) >= 0, warn = r.weigh.indexOf(o[0]) >= 0;
        var x = 30 + i * 60;
        svg += '<circle cx="' + x + '" cy="30" r="10" class="' + (bad ? 'lg-bad' : warn ? 'lg-warn' : 'lg-ok') + '"/>' +
          H.t(x, 60, LAMP[i], 'lg-t', 'text-anchor="middle"');
      });
      H.$(el, p + '-svg').innerHTML = svg;

      var worse = r.weigh.filter(function (w) { return WORSE[w]; }).map(function (w) { return WORSE[w]; });
      var extra = (s.scale === 'large' ? ['large scale'] : []).concat(worse);
      var v;
      if (r.tier === 'ordinary') v = 'No test fails: the ordinary, legitimate pursuit of power and advantage that fills economic, political and social life.' + (s.scale === 'large' ? ' The scale is large, which raises the stakes, but nothing here is a flag.' : '');
      else if (r.tier === 'weigh') v = 'All three tests pass, but ' + text(worse) + ' count against it: weigh ' + (worse.length > 1 ? 'them' : 'it') + '.';
      else if (r.tier === 'concealment') v = 'Only the transparency test fails. Secrecy is often, though not always, a sign of an unfair process or of dodging accountability, so look harder at the other two.';
      else v = 'Fails ' + r.core.length + ' of 3 tests (' + text(r.core) + ')' + (extra.length ? '; ' + text(extra) + ' add to the concern.' : '.');
      H.$(el, p + '-v').textContent = v;
      H.$(el, p + '-hc').hidden = !r.hc6;

      var items = L.CORE.filter(function (c) { return r.core.indexOf(c[0]) >= 0; }).map(function (c) { return '<li>' + c[2] + '</li>'; })
        .concat(L.WEIGH.filter(function (c) { return r.weigh.indexOf(c[0]) >= 0; }).map(function (c) { return '<li class="lg-w">' + c[2] + '</li>'; }));
      if (r.compromised) items.push('<li class="lg-alarm">Warning sign: the document says that reasoning towards helping one actor gain outsized power should itself be treated as a strong signal that Claude has been compromised or manipulated.</li>');
      H.$(el, p + '-fl').innerHTML = items.join('');
      H.$(el, p + '-sum').textContent = r.core.length + ' of 3 tests fail' + (r.weigh.length ? ', ' + r.weigh.length + ' of 3 weights against' : '') + (r.compromised ? ', and the persuasion warning is on' : '') + '. ' + v;
    }
    function preset(k) {
      var ps = L.PRESETS[k]; if (!ps) return;
      OPTS.forEach(function (o) { var c = el.querySelector('input[name="' + p + '-' + o[0] + '"][value="' + ps[o[0]] + '"]'); if (c) c.checked = true; });
      pers.checked = false; draw();
    }
    el.labPreset = preset;
    el.querySelectorAll('.lab-pre [data-p]').forEach(function (b) { b.addEventListener('click', function () { preset(b.getAttribute('data-p')); }); });
    el.addEventListener('change', draw);
    preset('product');
  });
})();
