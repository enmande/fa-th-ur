(function () {
  const data = window.FATHUR;
  const form = document.getElementById('controls');
  const params = new URLSearchParams(location.search);

  if (params.get('theme')) form.elements.theme.value = params.get('theme');

  function apply() {
    const theme = form.elements.theme.value;
    document.body.className = `theme-${theme}`;
    history.replaceState(null, '', `?theme=${theme}`);
  }
  form.addEventListener('change', apply);
  apply();

  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    Object.assign(node, attrs);
    for (const c of children) node.append(c);
    return node;
  };

  for (const [role, font] of Object.entries(data.fonts)) {
    document.getElementById(`credit-${role}`).append(
      el('strong', {}, font.family),
      ` (${role === 'body' ? 'body text' : 'code'}). ${font.copyright}. SIL Open Font License 1.1. ${font.form}.`,
    );
  }

  const palettes = document.getElementById('palettes');
  for (const [mode, theme] of Object.entries(data.themes)) {
    const grid = el('div', { className: 'swatches' });
    for (const [name, hex] of Object.entries(theme.swatches)) {
      const chip = el('div', { className: 'chip' });
      chip.style.background = hex;
      grid.append(el('div', { className: 'swatch' }, chip, el('div', { className: 'meta' }, `${name} `, el('code', {}, hex))));
    }
    palettes.append(el('div', { className: `palette theme-${mode}` }, el('h3', {}, mode), grid));
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
