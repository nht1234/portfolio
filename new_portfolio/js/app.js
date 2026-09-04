/* =========================================================
   노현태 포트폴리오 — 모바일 스크립트 (Vanilla JS, 의존성 없음)
   원본의 jQuery / jQuery UI / bxSlider 스택을 제거해
   모바일 초기 로딩 비용을 줄이고 터치 동작을 네이티브로 처리한다.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. 히어로 타이핑
     --------------------------------------------------------- */
  (function typing() {
    var target = document.getElementById('typeTarget');
    var source = document.getElementById('typeSource');
    if (!target || !source) return;

    var text = source.textContent.trim();
    if (reduceMotion) { target.textContent = text; return; }

    var chars = Array.from(text);   // 이모지/서로게이트 페어 안전 분해
    var i = 0;
    var timer = setInterval(function () {
      if (i >= chars.length) { clearInterval(timer); return; }
      target.textContent += chars[i++];
    }, 90);
  })();

  /* ---------------------------------------------------------
     2. 드로어 메뉴
     --------------------------------------------------------- */
  (function drawer() {
    var toggle = document.getElementById('navToggle');
    var panel  = document.getElementById('drawer');
    var scrim  = document.getElementById('scrim');
    if (!toggle || !panel || !scrim) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      panel.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);

      if (open) {
        panel.removeAttribute('inert');
        scrim.hidden = false;
        requestAnimationFrame(function () { scrim.classList.add('is-open'); });
      } else {
        panel.setAttribute('inert', '');
        scrim.classList.remove('is-open');
        setTimeout(function () { if (!panel.classList.contains('is-open')) scrim.hidden = true; }, 300);
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    scrim.addEventListener('click', function () { setOpen(false); });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);   // 메뉴 이동 시 자동 닫기
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  })();

  /* ---------------------------------------------------------
     3. 스크롤 상태 — 상단바 배경 / 맨 위로 버튼
     --------------------------------------------------------- */
  (function scrollState() {
    var bar   = document.getElementById('appbar');
    var toTop = document.getElementById('toTop');
    var ticking = false;

    function update() {
      var y = window.pageYOffset;
      if (bar) bar.classList.toggle('is-solid', y > 40);
      if (toTop) {
        var show = y > window.innerHeight * 0.8;
        if (show) { toTop.hidden = false; requestAnimationFrame(function () { toTop.classList.add('is-show'); }); }
        else { toTop.classList.remove('is-show'); }
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
      toTop.addEventListener('transitionend', function () {
        if (!toTop.classList.contains('is-show')) toTop.hidden = true;
      });
    }
  })();

  /* ---------------------------------------------------------
     4. 스크롤 등장 효과
     --------------------------------------------------------- */
  (function reveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el, idx) {
      el.style.transitionDelay = (Math.min(idx, 4) * 70) + 'ms';
      io.observe(el);
    });
  })();

  /* ---------------------------------------------------------
     5. 포트폴리오 슬라이더
        스와이프는 CSS scroll-snap(네이티브)이 담당하고,
        JS는 도트/화살표/자동재생만 얹는다.
     --------------------------------------------------------- */
  (function slider() {
    var track = document.getElementById('track');
    var dots  = document.getElementById('dots');
    var prev  = document.getElementById('prev');
    var next  = document.getElementById('next');
    if (!track || !dots) return;

    var slides = Array.prototype.slice.call(track.children);
    if (!slides.length) return;

    var index = 0;
    var autoTimer = null;
    var AUTO_MS = 6000;

    /* 도트 생성 */
    slides.forEach(function (slide, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', (i + 1) + '번째 작업물 보기');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () { stopAuto(); go(i); });
      dots.appendChild(b);
    });
    var dotList = Array.prototype.slice.call(dots.children);

    function paint(i) {
      index = i;
      dotList.forEach(function (d, n) { d.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
    }

    function go(i) {
      i = (i + slides.length) % slides.length;
      var target = slides[i];
      // 페이지 세로 스크롤을 건드리지 않도록 scrollLeft를 직접 계산한다.
      var left = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
      track.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? 'auto' : 'smooth' });
      paint(i);
    }

    /* 손가락 스와이프 후 현재 위치 되읽기 */
    var settle;
    track.addEventListener('scroll', function () {
      clearTimeout(settle);
      settle = setTimeout(function () {
        var center = track.scrollLeft + track.clientWidth / 2;
        var nearest = 0, best = Infinity;
        slides.forEach(function (s, i) {
          var d = Math.abs(s.offsetLeft + s.clientWidth / 2 - center);
          if (d < best) { best = d; nearest = i; }
        });
        paint(nearest);
      }, 90);
    }, { passive: true });

    if (prev) prev.addEventListener('click', function () { stopAuto(); go(index - 1); });
    if (next) next.addEventListener('click', function () { stopAuto(); go(index + 1); });

    /* 자동 재생 — 사용자가 만지면 즉시 중단 */
    function startAuto() {
      if (reduceMotion || autoTimer) return;
      autoTimer = setInterval(function () { go(index + 1); }, AUTO_MS);
    }
    function stopAuto() { clearInterval(autoTimer); autoTimer = null; }

    ['pointerdown', 'touchstart', 'wheel'].forEach(function (evt) {
      track.addEventListener(evt, stopAuto, { passive: true });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAuto(); else startAuto();
    });

    /* 화면에 보일 때만 자동 재생 */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? startAuto() : stopAuto();
      }, { threshold: 0.4 }).observe(track);
    } else {
      startAuto();
    }

    /* 폴드 접기/펼치기 등 화면 크기 변화 시 위치 보정 */
    var resizeT;
    window.addEventListener('resize', function () {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () {
        var cur = index;
        var left = slides[cur].offsetLeft - (track.clientWidth - slides[cur].clientWidth) / 2;
        track.scrollLeft = Math.max(0, left);
      }, 150);
    });
  })();
})();
