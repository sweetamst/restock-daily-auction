/*
  restock buyer portal: clickable prototype.
  All data below is sample data. There is no backend yet.
*/
(function () {
  'use strict';

  /* ---------- Sample data ---------- */

  const STATES = ['1A', '1B', '1C', '2'];

  // Yesterday's best price per device state
  const PRODUCTS = [
    { id: 'i15pm256', name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', best: { '1A': 742, '1B': 705, '1C': 651, '2': 610 } },
    { id: 'i15p256', name: 'iPhone 15 Pro 256GB', brand: 'Apple', best: { '1A': 612, '1B': 580, '1C': 538, '2': 499 } },
    { id: 'i15p128', name: 'iPhone 15 Pro 128GB', brand: 'Apple', best: { '1A': 548, '1B': 517, '1C': 470, '2': 436 } },
    { id: 'i14128', name: 'iPhone 14 128GB', brand: 'Apple', best: { '1A': 352, '1B': 331, '1C': 298, '2': 270 } },
    { id: 's24256', name: 'Galaxy S24 256GB', brand: 'Samsung', best: { '1A': 395, '1B': 370, '1C': 331, '2': 300 } },
    { id: 'gw540', name: 'Galaxy Watch5 40mm', brand: 'Samsung', best: { '1A': 58, '1B': 51, '1C': 42, '2': 36 } }
  ];

  // Prices this buyer already entered, keyed "productId|state"
  const START_PRICES = {
    'i15pm256|1A': '735', 'i15pm256|1B': '710', 'i15p256|1A': '615', 'i15p256|1B': '570',
    'i15p128|1A': '540', 'i14128|1A': '355', 's24256|1B': '360'
  };

  const TRADES = [
    { id: '2245038', date: '17 Oct 15:50', model: 'iPhone 15 Pro 256GB', state: '1', price: '€ 515', vat: 'Margin', status: 'To ship', center: 'Assessment North' },
    { id: '2209328', date: '17 Oct 15:35', model: 'iPhone 15 Pro 128GB', state: '1', price: '€ 450', vat: 'Margin', status: 'To ship', center: 'Assessment North' },
    { id: '2209286', date: '17 Oct 15:29', model: 'iPhone 15 Pro 256GB', state: '1B', price: '€ 570', vat: 'Margin', status: 'In transit', center: 'Assessment South' },
    { id: '2209201', date: '17 Oct 15:14', model: 'iPhone 15 Pro Max 256GB', state: '1A', price: '€ 735', vat: 'Margin', status: 'Assessed', center: 'Assessment North' },
    { id: '2209095', date: '17 Oct 14:59', model: 'Galaxy S24 256GB', state: '1B', price: '€ 360', vat: 'Standard', status: 'Discrepancy', center: 'Assessment South' },
    { id: '2208871', date: '16 Oct 11:02', model: 'iPhone 14 128GB', state: '1A', price: '€ 355', vat: 'Margin', status: 'Invoiced', center: 'Assessment North' }
  ];

  // Badge colour per purchase status (the .pill-- classes in styles.css)
  const STATUS_TONE = { 'To ship': 'warn', 'In transit': 'info', 'Assessed': 'good', 'Discrepancy': 'bad', 'Invoiced': 'done' };

  const TITLES = { dash: 'Dashboard', prices: 'Price manager', trade: 'Purchases', ship: 'Shipments', inv: 'Invoices', guide: 'Guide' };

  const ROUND_CLOSES_AT = 16; // hour, local time

  /* ---------- State ---------- */

  const state = {
    screen: 'dash',
    prices: Object.assign({}, START_PRICES),
    query: '',
    saved: false,
    tradeFilter: 'all'
  };

  /* ---------- Helpers ---------- */

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const esc = (value) => String(value).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));

  const eur = (n) => '€ ' + Math.round(n).toLocaleString('en-GB');
  const priceKey = (productId, deviceState) => productId + '|' + deviceState;

  // How a bid compares with yesterday's best price for the same model and state
  function compare(value, best) {
    if (!value) return { text: 'No bid', tone: '' };
    const gap = best - parseFloat(value);
    if (gap < 0) return { text: "Above yesterday's best", tone: 'is-up' };
    return { text: gap === 0 ? 'Equal to best' : '€ ' + gap + ' below best', tone: 'is-down' };
  }

  /* ---------- Round deadline ---------- */

  function renderDeadline() {
    const now = new Date();
    const close = new Date(now);
    close.setHours(ROUND_CLOSES_AT, 0, 0, 0);
    const open = now < close;
    const mins = Math.max(0, Math.round((close - now) / 60000));
    $('#deadline-label').textContent = open ? 'Round closes at ' + ROUND_CLOSES_AT + ':00' : 'Round closed';
    $('#deadline-time').textContent = open ? Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm left' : 'results pending';
    $('#deadline').classList.toggle('is-urgent', open && mins <= 60);
  }

  /* ---------- Dashboard ---------- */

  function renderDashboard() {
    let total = 0;
    let priced = 0;
    let goodChance = 0;
    const rows = [];

    PRODUCTS.forEach((p) => {
      STATES.forEach((st) => {
        total += 1;
        const value = state.prices[priceKey(p.id, st)];
        if (!value) return;
        const yours = parseFloat(value);
        const best = p.best[st];
        const diff = yours - best;
        const up = diff > 0;
        priced += 1;
        if (up) goodChance += 1;
        rows.push(`<tr>
          <td class="strong">${esc(p.name)}</td>
          <td>${esc(st)}</td>
          <td class="num">${esc(eur(yours))}</td>
          <td class="num">${esc(eur(best))}</td>
          <td class="num diff ${up ? 'is-up' : 'is-down'}">${esc((up ? '+' : '') + diff + ' €')}</td>
          <td><span class="pill ${up ? 'pill--good' : 'pill--warn'}">${up ? 'Good chance' : 'Too low'}</span></td>
        </tr>`);
      });
    });

    $('#kpi-priced').textContent = priced + ' / ' + total;
    $('#kpi-good').textContent = String(goodChance);
    $('#position-rows').innerHTML = rows.join('');
  }

  /* ---------- Price manager ---------- */

  function priceCell(p, st) {
    const key = priceKey(p.id, st);
    const value = state.prices[key] || '';
    const best = p.best[st];
    const hint = compare(value, best);
    return `<td>
      <div class="price-cell">
        <div class="price-input">
          <span class="currency">€</span>
          <input class="pin" inputmode="numeric" value="${esc(value)}" data-key="${esc(key)}" data-best="${best}" aria-label="Price ${esc(p.name)} state ${esc(st)}">
        </div>
        <span class="num best-label">yesterday: ${esc(eur(best))}</span>
        <span class="${('hint ' + hint.tone).trim()}">${esc(hint.text)}</span>
      </div>
    </td>`;
  }

  function renderPriceRows() {
    const q = state.query.trim().toLowerCase();
    $('#price-rows').innerHTML = PRODUCTS
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .map((p) => `<tr>
        <td class="product">
          <div class="product-name">${esc(p.name)}</div>
          <div class="subtle">${esc(p.brand)} · margin VAT</div>
        </td>
        ${STATES.map((st) => priceCell(p, st)).join('')}
      </tr>`)
      .join('');
  }

  function setSaved(saved) {
    state.saved = saved;
    $('#saved-notice').hidden = !saved;
  }

  /* ---------- Purchases ---------- */

  function renderTrades() {
    $$('.chip').forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.filter === state.tradeFilter));
    });
    $('#trade-rows').innerHTML = TRADES
      .filter((t) => state.tradeFilter === 'all' || t.status === state.tradeFilter)
      .map((t) => `<tr>
        <td class="num">${esc(t.id)}</td>
        <td class="num nowrap">${esc(t.date)}</td>
        <td class="strong">${esc(t.model)}</td>
        <td>${esc(t.state)}</td>
        <td class="num">${esc(t.price)}</td>
        <td>${esc(t.vat)}</td>
        <td><span class="pill pill--${STATUS_TONE[t.status]}">${esc(t.status)}</span></td>
        <td>${esc(t.center)}</td>
      </tr>`)
      .join('');
  }

  /* ---------- Screens ---------- */

  function showScreen(screen) {
    state.screen = screen;
    $('#screen-title').textContent = TITLES[screen];
    $$('.nav-item').forEach((button) => {
      if (button.dataset.screen === screen) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    $$('[data-view]').forEach((view) => {
      view.hidden = !view.dataset.view.split(' ').includes(screen);
    });
    setSaved(false);
    if (screen === 'dash') renderDashboard();
    if (screen === 'prices') renderPriceRows();
    if (screen === 'trade') renderTrades();
  }

  /* ---------- Events ---------- */

  $$('.nav-item').forEach((button) => {
    button.addEventListener('click', () => showScreen(button.dataset.screen));
  });

  $('#search').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderPriceRows();
  });

  // Typing a price: keep digits only, store it and update that cell's hint
  $('#price-rows').addEventListener('input', (e) => {
    const input = e.target;
    if (!input.classList.contains('pin')) return;
    const clean = input.value.replace(/[^0-9]/g, '');
    if (clean !== input.value) input.value = clean;
    state.prices[input.dataset.key] = clean;
    setSaved(false);
    const hint = compare(clean, Number(input.dataset.best));
    const hintEl = input.closest('.price-cell').querySelector('.hint');
    hintEl.textContent = hint.text;
    hintEl.className = ('hint ' + hint.tone).trim();
  });

  $('#match-best').addEventListener('click', () => {
    PRODUCTS.forEach((p) => STATES.forEach((st) => {
      state.prices[priceKey(p.id, st)] = String(p.best[st] + 1);
    }));
    setSaved(false);
    renderPriceRows();
  });

  $('#save-prices').addEventListener('click', () => setSaved(true));

  $$('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.tradeFilter = chip.dataset.filter;
      renderTrades();
    });
  });

  /* ---------- Start ---------- */

  showScreen('dash');
  renderDeadline();
  setInterval(renderDeadline, 30000);
})();
