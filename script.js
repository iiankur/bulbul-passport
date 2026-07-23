(function () {
  var C = window.CONTENT;

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function renderRouteMap(fromLabel, toLabel) {
    var wrap = document.getElementById('route-map');
    if (!wrap) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var signal = reduced ? '' :
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

  function initAurora() {
    var canvas = document.getElementById('auroraCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      { color: 'rgba(99,193,174,.32)', amp: 16, speed: .0006, phase: 0, yBase: .3 },
      { color: 'rgba(201,162,75,.20)', amp: 22, speed: .00045, phase: 2.1, yBase: .48 },
      { color: 'rgba(243,233,214,.10)', amp: 26, speed: .0008, phase: 4.2, yBase: .62 },
    ];

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      layers.forEach(function (layer) {
        ctx.beginPath();
        var yBase = h * layer.yBase;
        for (var x = 0; x <= w; x += 6) {
          var y = yBase +
            Math.sin(x * 0.015 + t * layer.speed + layer.phase) * layer.amp +
            Math.sin(x * 0.008 - t * layer.speed * 1.4) * (layer.amp * .5);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();
      });
    }

    if (reduced) { draw(0); return; }

    var raf = null;
    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && raf === null) {
            raf = requestAnimationFrame(loop);
          } else if (!e.isIntersecting && raf !== null) {
            cancelAnimationFrame(raf); raf = null;
          }
        });
      }, { threshold: .1 });
      io.observe(canvas);
    } else {
      raf = requestAnimationFrame(loop);
    }
  }

  function render() {
    // Cover
    document.getElementById('c-eyebrow').textContent = C.cover.eyebrow;
    document.getElementById('c-names').innerHTML = C.cover.names.replace(
      /&/g, '<em>&amp;</em>'
    );
    document.getElementById('c-subtitle').textContent = C.cover.subtitle;

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
      card.addEventListener('click', function () { card.classList.toggle('open'); });
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
      p.addEventListener('click', function () { p.classList.toggle('open'); });
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

  function wireInteractions() {
    var openBtn = document.getElementById('openBtn');
    openBtn.addEventListener('click', function () {
      document.body.classList.add('opened');
      document.body.classList.remove('locked');
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) { document.documentElement.classList.add('smooth'); }
      document.getElementById('origin').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
    document.body.classList.add('locked');

    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
        });
      }, { threshold: .15 });
      reveals.forEach(function (elm) { io.observe(elm); });
    } else {
      reveals.forEach(function (elm) { elm.classList.add('in-view'); });
    }

    var dots = document.querySelectorAll('.spine-dot');
    var sections = document.querySelectorAll('main .chapter[id]');
    if ('IntersectionObserver' in window && dots.length) {
      var navIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            dots.forEach(function (d) { d.classList.remove('active'); });
            var match = document.querySelector('.spine-dot[href="#' + e.target.id + '"]');
            if (match) { match.classList.add('active'); }
          }
        });
      }, { threshold: .5 });
      sections.forEach(function (s) { navIo.observe(s); });
    }

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
  wireInteractions();
  initAurora();
})();
