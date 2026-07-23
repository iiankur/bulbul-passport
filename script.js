(function () {
  var C = window.CONTENT;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function renderRouteMap(fromLabel, toLabel) {
    var wrap = document.getElementById('route-map');
    if (!wrap) return;
    var signal = reducedMotion ? '' :
      '<circle r="4" class="route-signal">' +
        '<animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto">' +
          '<mpath href="#routePath"></mpath>' +
        '</animateMotion>' +
      '</circle>';
    wrap.innerHTML =
      '<svg class="route-svg" viewBox="0 0 600 170" role="img" aria-label="Route from ' + fromLabel + ' to ' + toLabel + '">' +
        '<line x1="0" y1="150" x2="600" y2="150" class="route-grid"></line>' +
        '<line x1="0" y1="110" x2="600" y2="110" class="route-grid"></line>' +
        '<line x1="0" y1="70" x2="600" y2="70" class="route-grid"></line>' +
        '<path id="routePath" d="M90,125 Q300,10 510,80" class="route-path"></path>' +
        '<circle cx="90" cy="125" r="5" class="route-pin"></circle>' +
        '<circle cx="510" cy="80" r="5" class="route-pin"></circle>' +
        '<text x="90" y="148" text-anchor="middle" class="route-label">' + fromLabel + '</text>' +
        '<text x="510" y="103" text-anchor="middle" class="route-label">' + toLabel + '</text>' +
        signal +
      '</svg>';
  }

  var auroraCtl = { start: function () {}, stop: function () {} };
  function initAurora() {
    var canvas = document.getElementById('auroraCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h;

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var layers = [
      { color: 'rgba(99,193,174,.55)', amp: 20, speed: .0006, phase: 0, yBase: .32, thickness: 30 },
      { color: 'rgba(99,193,174,.30)', amp: 26, speed: .00038, phase: 1.4, yBase: .45, thickness: 46 },
      { color: 'rgba(201,162,75,.32)', amp: 16, speed: .00052, phase: 2.6, yBase: .55, thickness: 22 },
      { color: 'rgba(243,233,214,.18)', amp: 22, speed: .0008, phase: 4.2, yBase: .68, thickness: 18 },
    ];

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.filter = 'blur(16px)';
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      layers.forEach(function (layer) {
        ctx.beginPath();
        var yBase = h * layer.yBase;
        for (var x = 0; x <= w; x += 8) {
          var y = yBase +
            Math.sin(x * 0.015 + t * layer.speed + layer.phase) * layer.amp +
            Math.sin(x * 0.008 - t * layer.speed * 1.4) * (layer.amp * .5);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineWidth = layer.thickness;
        ctx.strokeStyle = layer.color;
        ctx.stroke();
      });
      ctx.restore();
    }

    if (reducedMotion) { draw(0); return; }

    var raf = null;
    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    auroraCtl.start = function () { if (raf === null) raf = requestAnimationFrame(loop); };
    auroraCtl.stop = function () { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };
  }

  function render() {
    // Cover
    document.getElementById('c-eyebrow').textContent = C.cover.eyebrow;
    document.getElementById('c-names').innerHTML = C.cover.names.replace(
      /&/g, '<em>&amp;</em>'
    );
    document.getElementById('c-subtitle').textContent = C.cover.subtitle;

    // Bio data
    document.getElementById('bio-name').textContent = C.bioData.givenNames;
    document.getElementById('bio-passportno').textContent = C.bioData.passportNo;
    var bioFieldsWrap = document.getElementById('bio-fields');
    C.bioData.fields.forEach(function (f) {
      var row = el('div', 'bio-field');
      row.appendChild(el('div', 'label bio-field-label', f.label));
      row.appendChild(el('div', 'bio-field-value', f.value));
      bioFieldsWrap.appendChild(row);
    });
    document.getElementById('bio-sig-name').textContent = C.bioData.signatureName;
    document.getElementById('bio-sig-label').textContent = C.bioData.signatureLabel;
    document.getElementById('bio-mrz1').textContent = C.bioData.mrz[0] || '';
    document.getElementById('bio-mrz2').textContent = C.bioData.mrz[1] || '';
    if (C.bioData.photoDataUri) {
      document.getElementById('bio-photo').innerHTML =
        '<img src="' + C.bioData.photoDataUri + '" alt="" />';
    }

    // Origin
    document.getElementById('origin-title').textContent = C.origin.title;
    document.getElementById('origin-body').textContent = C.origin.body;
    var statsWrap = document.getElementById('origin-stats');
    C.origin.stats.forEach(function (s) {
      var stat = el('div', 'stat');
      stat.appendChild(el('b', null, s.value));
      stat.appendChild(el('span', null, s.label));
      statsWrap.appendChild(stat);
    });

    // Distance
    document.getElementById('distance-stamp').innerHTML = C.distance.stampText.replace(/ /g, '<br/>');
    document.getElementById('distance-title').textContent = C.distance.title;
    document.getElementById('distance-coords').innerHTML =
      '<b>' + C.distance.you.city + '</b> ' + C.distance.you.lat + ' ' + C.distance.you.lon +
      ' &nbsp;—&nbsp; <b>' + C.distance.her.city + '</b> ' + C.distance.her.lat + ' ' + C.distance.her.lon +
      '<br/>≈ ' + C.distance.distanceKm + ' KM APART · 0 KM IN WHAT MATTERED';
    document.getElementById('distance-intro').textContent = C.distance.intro;
    renderRouteMap(C.distance.you.city, C.distance.her.city);
    var postcardsWrap = document.getElementById('postcards');
    C.distance.postcards.forEach(function (p) {
      var card = el('button', 'postcard');
      card.type = 'button';
      var top = el('span', 'postcard-top');
      top.appendChild(el('span', 'postcard-week', p.week));
      top.appendChild(el('span', 'postcard-mark'));
      card.appendChild(top);
      card.appendChild(el('span', 'postcard-caption', p.caption));
      card.appendChild(el('span', 'postcard-hint', 'tap to read'));
      card.addEventListener('click', function (ev) { ev.stopPropagation(); card.classList.toggle('open'); });
      postcardsWrap.appendChild(card);
    });

    // Union
    document.getElementById('union-stamp').innerHTML = C.union.stampText.replace(/ /g, '<br/>');
    document.getElementById('union-title').textContent = C.union.title;
    var unionRow = document.getElementById('union-row');
    [C.union.engagement, C.union.wedding].forEach(function (v) {
      var visa = el('div', 'visa');
      visa.appendChild(el('div', 'visa-stamp', v.stamp));
      visa.appendChild(el('div', 'label visa-label', v.label));
      visa.appendChild(el('div', 'visa-date', v.date));
      unionRow.appendChild(visa);
    });

    // Home
    document.getElementById('home-title').textContent = C.home.title;
    document.getElementById('tv-label').textContent = C.home.tvLabel;
    var platesWrap = document.getElementById('plates');
    C.home.plates.forEach(function (row) {
      platesWrap.appendChild(el('div', null, '<b>' + row.label + '</b> — ' + row.value));
    });
    document.getElementById('home-body').textContent = C.home.body;

    // Her
    document.getElementById('her-title').textContent = C.her.title;
    var herGrid = document.getElementById('her-grid');
    C.her.cards.forEach(function (card) {
      var c = el('div', 'her-card');
      c.appendChild(el('div', 'her-mark', card.mark));
      c.appendChild(el('div', 'her-title', card.title));
      c.appendChild(el('div', 'her-desc', card.desc));
      herGrid.appendChild(c);
    });

    // Future
    document.getElementById('future-title').textContent = C.future.title;
    document.getElementById('future-quote').textContent = C.future.quote;
    document.getElementById('future-status').textContent = C.future.status;

    // Promises
    document.getElementById('promises-title').textContent = C.promises.title;
    var promiseGrid = document.getElementById('promise-grid');
    C.promises.list.forEach(function (item, i) {
      var p = el('button', 'promise');
      p.type = 'button';
      p.appendChild(el('span', 'promise-check', String(i + 1).padStart(2, '0')));
      var text = el('span', 'promise-text');
      text.appendChild(el('span', 'promise-teaser', item.teaser));
      text.appendChild(el('span', 'promise-body', item.body));
      p.appendChild(text);
      p.addEventListener('click', function (ev) { ev.stopPropagation(); p.classList.toggle('open'); });
      promiseGrid.appendChild(p);
    });

    // Letter
    document.getElementById('letter-title').textContent = C.letter.title;
    var letterBody = document.getElementById('letter-body');
    var signEl = letterBody.querySelector('.letter-sign');
    C.letter.paragraphs.forEach(function (para) {
      letterBody.insertBefore(el('p', null, para), signEl);
    });
    document.getElementById('letter-signoff-label').textContent = C.letter.signoffLabel;
    document.getElementById('letter-signoff-name').textContent = C.letter.signoffName;
    document.getElementById('letter-monogram').textContent = C.letter.monogram;

    // Finale
    document.getElementById('finale-stamp').textContent = C.finale.stampText;
    document.getElementById('finale-title').innerHTML =
      C.finale.title + '<br/><em>' + C.finale.titleEm + '</em>';
    document.getElementById('finale-km').textContent = C.finale.distanceKm;
    document.getElementById('finale-footer').textContent = C.finale.footer;
  }

  // ============================================================
  // PAGE DECK — swipe/tap/keyboard navigation with a real page-flip
  // ============================================================
  function initPager() {
    var pagesEl = document.getElementById('pages');
    var pages = Array.prototype.slice.call(pagesEl.querySelectorAll('.page'));
    var dotsWrap = document.getElementById('pdDots');
    var prevBtn = document.getElementById('prevPage');
    var nextBtn = document.getElementById('nextPage');
    var pageLabel = document.getElementById('pageLabel');
    var current = -1;
    var animating = false;

    var dots = pages.map(function (p, i) {
      var d = el('button', 'pd-dot');
      d.type = 'button';
      d.setAttribute('aria-label', p.dataset.title || ('Page ' + (i + 1)));
      d.addEventListener('click', function () { goToPage(i); });
      dotsWrap.appendChild(d);
      return d;
    });

    function activateContent(pageEl) {
      pageEl.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('in-view'); });
      if (pageEl.id === 'future') auroraCtl.start();
    }

    function updateChrome(index) {
      dots.forEach(function (d, i) { d.classList.toggle('active', i === index); });
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === pages.length - 1;
      pageLabel.textContent = pages[index].dataset.title || '';
    }

    function goToPage(newIndex) {
      if (animating || newIndex === current || newIndex < 0 || newIndex >= pages.length) return;
      animating = true;
      var dir = newIndex > current ? 1 : -1;
      var entering = pages[newIndex];
      var leaving = current >= 0 ? pages[current] : null;

      if (leaving && leaving.id === 'future') auroraCtl.stop();

      entering.style.visibility = 'visible';
      entering.style.zIndex = '1';
      entering.style.transition = 'none';
      entering.style.transform = reducedMotion ? 'none' : 'rotateY(' + (dir > 0 ? 100 : -100) + 'deg)';
      entering.scrollTop = 0;
      // force reflow so the transition re-enables cleanly
      entering.getBoundingClientRect();
      entering.style.transition = '';

      requestAnimationFrame(function () {
        // leaving stays visually on top (higher z-index) while its front
        // face is still rendering; entering only takes over once its own
        // class-driven z-index (2) applies and leaving is cleaned up below.
        if (leaving) {
          leaving.style.zIndex = '3';
          leaving.style.transform = reducedMotion ? 'none' : 'rotateY(' + (dir > 0 ? -100 : 100) + 'deg)';
        }
        entering.classList.add('page-active');
        entering.style.transform = 'none';
        entering.style.zIndex = '2';
      });

      function finish() {
        if (leaving) {
          leaving.classList.remove('page-active');
          leaving.style.visibility = 'hidden';
          leaving.style.transform = '';
          leaving.style.zIndex = '';
        }
        entering.removeEventListener('transitionend', finish);
        current = newIndex;
        animating = false;
        updateChrome(current);
      }
      if (reducedMotion) { finish(); } else {
        entering.addEventListener('transitionend', finish);
        setTimeout(function () { if (animating) finish(); }, 900);
      }

      activateContent(entering);
    }

    prevBtn.addEventListener('click', function () { goToPage(current - 1); });
    nextBtn.addEventListener('click', function () { goToPage(current + 1); });

    document.addEventListener('keydown', function (e) {
      if (!document.body.classList.contains('opened')) return;
      if (e.key === 'ArrowRight') goToPage(current + 1);
      if (e.key === 'ArrowLeft') goToPage(current - 1);
    });

    var touchStartX = 0, touchStartY = 0, touching = false;
    pagesEl.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      touchStartX = t.clientX; touchStartY = t.clientY; touching = true;
    }, { passive: true });
    pagesEl.addEventListener('touchend', function (e) {
      if (!touching) return;
      touching = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - touchStartX;
      var dy = t.clientY - touchStartY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx < 0) goToPage(current + 1); else goToPage(current - 1);
      }
    }, { passive: true });

    window.__goToPage = goToPage;
    window.__pageCount = pages.length;
  }

  function wireInteractions() {
    var openBtn = document.getElementById('openBtn');
    openBtn.addEventListener('click', function () {
      document.body.classList.add('opened');
      window.__goToPage(0);
    });
  }

  function computeCounters() {
    function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var wedding = new Date(C.dates.weddingISO);
    var dm = daysBetween(wedding, today);
    document.getElementById('daysMarried').textContent = dm > 0 ? dm : 0;

    var bday = new Date(today.getFullYear(), C.dates.birthdayMonth - 1, C.dates.birthdayDay);
    var bdayEl = document.getElementById('bdayCount');
    var bdayLabel = document.getElementById('bdayLabel');
    if (today.getMonth() === C.dates.birthdayMonth - 1 && today.getDate() === C.dates.birthdayDay) {
      bdayEl.textContent = '🎂';
      bdayLabel.textContent = 'today is the day';
    } else if (today < bday) {
      bdayEl.textContent = daysBetween(today, bday);
      bdayLabel.textContent = 'days to birthday';
    } else {
      bdayEl.textContent = '🎉';
      bdayLabel.textContent = 'happy birthday';
    }
  }

  render();
  initAurora();
  initPager();
  wireInteractions();
  computeCounters();
})();
