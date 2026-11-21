(function () {
  const data = window.FATHUR;
  const form = document.getElementById('controls');
  const params = new URLSearchParams(location.search);

  const CODE_ROLES = [
    ['--code-normal', 'normal text'],
    ['--code-keyword', 'keyword if return'],
    ['--code-function', 'function call()'],
    ['--code-string', 'string "text"'],
    ['--code-value', 'value 937 true'],
    ['--code-property', 'property .name'],
    ['--code-operator', 'operator = =>'],
    ['--code-punctuation', 'punctuation {};'],
    ['--code-tag', 'tag <section>'],
    ['--code-important', 'important !important'],
    ['--code-comment', 'comment // note'],
    ['--code-inserted', 'inserted + line'],
    ['--code-deleted', 'deleted - line'],
  ];
  const VISIONS = [
    ['theme', 'Theme', ''],
    ['protan', 'Protanopia', 'url(#cvd-protan)'],
    ['deutan', 'Deuteranopia', 'url(#cvd-deutan)'],
    ['tritan', 'Tritanopia', 'url(#cvd-tritan)'],
  ];
  const MATRICES = {
    theme: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
    tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
  };

  if (params.get('theme')) form.elements.theme.value = params.get('theme');

  const codeColors = () => data.editor[form.elements.theme.value];

  function applyEditor() {
    const { label, ...colors } = codeColors();
    const section = document.getElementById('code-screen');
    for (const [role, hex] of Object.entries(colors)) section.style.setProperty(role, hex);
    document.getElementById('editor-theme').textContent = label;
    renderDistance();
  }

  function apply() {
    const theme = form.elements.theme.value;
    document.body.className = `theme-${theme}`;
    history.replaceState(null, '', `?theme=${theme}`);
    applyEditor();
  }

  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    Object.assign(node, attrs);
    for (const c of children) node.append(c);
    return node;
  };

  const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const fromLinear = (c) => {
    const v = Math.min(1, Math.max(0, c));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  };
  const linearRgb = (hex) => [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  function simulate(hex, vision) {
    const l = linearRgb(hex);
    return MATRICES[vision].map((r) => toLinear(Math.round(255 * fromLinear(r[0] * l[0] + r[1] * l[1] + r[2] * l[2])) / 255));
  }
  function oklab([r, g, b]) {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [
      0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ];
  }
  const distance = (a, b, vision) => {
    const [x, y] = [oklab(simulate(a, vision)), oklab(simulate(b, vision))];
    return 100 * Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
  };
  const grade = (d) => (d < 5 ? 'low' : d < 10 ? 'mid' : 'high');

  function renderDistance() {
    const colors = codeColors();
    const pairs = [
      ...CODE_ROLES.filter(([role]) => role !== '--code-keyword').map(([role]) => ['--code-keyword', role]),
      ['--code-deleted', '--code-inserted'],
      ['--code-deleted', '--code-normal'],
      ['--code-string', '--code-normal'],
      ['--code-property', '--code-normal'],
      ['--code-function', '--code-normal'],
      ['--code-value', '--code-normal'],
      ['--code-value', '--code-tag'],
      ['--code-value', '--code-operator'],
      ['--code-value', '--code-important'],
      ['--code-comment', '--code-punctuation'],
    ];
    const tbody = el('tbody');
    for (const [a, b] of pairs) {
      const chip = (role) => {
        const span = el('span', { className: 'chip-dot' });
        span.style.background = colors[role];
        return el('code', { className: 'var' }, span, role.replace(/^--code-/, ''));
      };
      tbody.append(el('tr', {},
        el('td', {}, chip(a), ' vs ', chip(b)),
        ...VISIONS.map(([vision]) => {
          const d = distance(colors[a], colors[b], vision);
          return el('td', { className: `num ${grade(d)}` }, d.toFixed(1));
        }),
      ));
    }
    const head = el('thead', {}, el('tr', {}, el('th', {}, 'Pair'), ...VISIONS.map(([, label]) => el('th', { className: 'num' }, label))));
    document.getElementById('cvd-distance').replaceChildren(el('table', {}, head, tbody));
  }

  function legendSource() {
    const code = el('code');
    CODE_ROLES.forEach(([role, label], i) => {
      const span = el('span', {}, label);
      span.style.color = `var(${role})`;
      if (role === '--code-keyword') span.style.fontWeight = '600';
      if (role === '--code-comment') span.style.fontStyle = 'italic';
      code.append(span, i < CODE_ROLES.length - 1 ? '\n' : '');
    });
    const pre = el('pre', {}, code);
    pre.dataset.title = 'Token roles';
    return pre;
  }

  const samples = document.getElementById('code-samples');
  const sources = [legendSource(), ...document.getElementById('code-sources').content.querySelectorAll('pre')];
  for (const source of sources) {
    const code = source.querySelector('code');
    if (code.className && window.Prism) Prism.highlightElement(code);
    const grid = el('div', { className: 'vision-grid' });
    for (const [, label, filter] of VISIONS) {
      const pre = el('pre', { className: 'screen' }, code.cloneNode(true));
      pre.style.filter = filter;
      grid.append(el('figure', {}, el('figcaption', {}, label), pre));
    }
    samples.append(el('div', { className: 'code-sample' }, el('h3', {}, source.dataset.title), grid));
  }

  form.addEventListener('change', apply);
  apply();

  for (const [role, font] of Object.entries(data.fonts)) {
    document.getElementById(`credit-${role}`).append(
      el('strong', {}, font.family),
      ` (${role === 'body' ? 'body text' : 'code'}). ${font.copyright}. SIL Open Font License 1.1. ${font.form}.`,
    );
  }

  const palettes = document.getElementById('palettes');
  const groups = [
    ...Object.entries(data.themes).map(([mode, theme]) => [mode, mode, theme.swatches]),
    ['light', 'light paper code', data.paperSwatches],
  ];
  for (const [mode, title, swatches] of groups) {
    const grid = el('div', { className: 'swatches' });
    for (const [name, hex] of Object.entries(swatches)) {
      const chip = el('div', { className: 'chip' });
      chip.style.background = hex;
      grid.append(el('div', { className: 'swatch' }, chip, el('div', { className: 'meta' }, `${name} `, el('code', {}, hex))));
    }
    palettes.append(el('div', { className: `palette theme-${mode}` }, el('h3', {}, title), grid));
  }

  const contrast = document.getElementById('contrast');
  for (const mode of Object.keys(data.themes)) {
    const rows = data.contrast.filter((r) => r.mode === mode);
    const tbody = el('tbody');
    for (const r of rows) {
      const sample = el('td', { className: 'sample' }, 'Aa');
      sample.style.color = r.fgHex;
      sample.style.background = r.bgHex;
      tbody.append(el('tr', {},
        sample,
        el('td', {}, el('code', { className: 'var' }, r.fg.replace(/^--/, ''))),
        el('td', {}, el('code', { className: 'var' }, r.bg.replace(/^--/, ''))),
        el('td', { className: r.pass ? '' : 'fail' }, `${r.ratio.toFixed(2)} / ${r.min}`),
      ));
    }
    const head = el('thead', {}, el('tr', {}, el('th', {}, ''), el('th', {}, 'Foreground'), el('th', {}, 'Background'), el('th', {}, 'Ratio / min')));
    contrast.append(el('div', { className: `palette theme-${mode}` }, el('h3', {}, mode), el('table', {}, head, tbody)));
  }
})();
