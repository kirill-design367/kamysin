'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

export default function ClientScripts() {
  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const fine = matchMedia('(pointer:fine)').matches; // мышь = десктоп
    const hdr = document.getElementById('hdr');
    const mbar = document.getElementById('mbar');
    const hero = document.getElementById('hero');

    // ---- Lenis только на десктопе (мышь). На тач — нативный скролл: плавнее и легче ----
    let lenis: Lenis | null = null;
    let rafId = 0;
    const anchors: HTMLAnchorElement[] = [];
    const onAnchor = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const href = a.getAttribute('href') || '';
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (target && lenis) { e.preventDefault(); lenis.scrollTo(target as HTMLElement, { offset: -70 }); }
    };
    if (!rm && fine) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      const raf = (t: number) => { lenis!.raf(t); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', onAnchor); anchors.push(a);
      });
    }

    // ---- заголовки h2: маска по словам (одноразово, дёшево) ----
    if (!rm) {
      document.querySelectorAll<HTMLElement>('.split').forEach((el) => {
        if (el.dataset.split === 'done') return;
        el.dataset.split = 'done';
        const text = el.textContent || '';
        el.textContent = '';
        let idx = 0;
        text.split(/(\s+)/).forEach((w) => {
          if (w === '') return;
          if (/^\s+$/.test(w)) { el.appendChild(document.createTextNode(w)); return; }
          const outer = document.createElement('span'); outer.className = 'rw';
          const inner = document.createElement('span'); inner.className = 'rw-i';
          inner.textContent = w; inner.style.transitionDelay = (idx * 0.045).toFixed(3) + 's';
          outer.appendChild(inner); el.appendChild(outer); idx++;
        });
      });
    }

    // ---- Параллакс: только десктоп. Позиции кэшируются => НИ ОДНОГО чтения layout в скролле ----
    let paraCleanup = () => {};
    if (!rm && fine) {
      const els = Array.from(document.querySelectorAll<HTMLElement>('.melon-d[data-speed]'));
      let cache: { el: HTMLElement; speed: number; docCenter: number }[] = [];
      const measure = () => {
        const sy = scrollY;
        cache = els.map((el) => {
          const r = el.getBoundingClientRect();
          return { el, speed: parseFloat(el.getAttribute('data-speed') || '0'), docCenter: r.top + sy + r.height / 2 };
        });
      };
      let ticking = false, moving = false, idle = 0;
      const frame = () => {
        const mid = scrollY + innerHeight / 2, lim = innerHeight * 1.6;
        for (const c of cache) {
          const d = c.docCenter - mid;
          if (Math.abs(d) < lim) c.el.style.transform = 'translate3d(0,' + (d * c.speed).toFixed(1) + 'px,0)';
        }
        ticking = false;
      };
      const onScroll = () => {
        if (!moving) { moving = true; els.forEach((el) => el.classList.add('moving')); }
        clearTimeout(idle);
        idle = window.setTimeout(() => { moving = false; els.forEach((el) => el.classList.remove('moving')); }, 150);
        if (!ticking) { ticking = true; requestAnimationFrame(frame); }
      };
      const onResize = () => { measure(); frame(); };
      measure(); frame();
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onResize);
      paraCleanup = () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onResize); clearTimeout(idle); };
    }

    // ---- шапка + мобильная панель (без layout-чтения: кэшируем низ hero) ----
    let heroBottom = 600;
    const measureHero = () => { if (hero) heroBottom = hero.getBoundingClientRect().bottom + scrollY; };
    measureHero();
    addEventListener('load', measureHero);
    addEventListener('resize', measureHero);
    function onScrollUI() {
      if (hdr) hdr.classList.toggle('stuck', scrollY > 20);
      if (mbar) mbar.classList.toggle('show', scrollY > heroBottom - 80);
    }
    addEventListener('scroll', onScrollUI, { passive: true });
    onScrollUI();

    const t = setTimeout(() => document.body.classList.add('ready'), 80);

    // ---- семечки в блоке «Масштаб» (меньше узлов) ----
    const sr = document.getElementById('seedrow');
    if (sr && !sr.childElementCount) {
      for (let i = 0; i < 14; i++) {
        const s = document.createElement('span');
        s.className = 'seed';
        s.style.left = (i * 37 % 100) + '%';
        s.style.top = (i * 53 % 100) + '%';
        s.style.transform = 'rotate(' + (i * 47 % 360) + 'deg)';
        s.style.background = '#5c0f18';
        s.style.opacity = String(0.25 + (i % 5) * 0.08);
        sr.appendChild(s);
      }
    }

    // ---- счётчики ----
    const fmt = (n: number) => n.toLocaleString('ru-RU');
    function count(el: Element) {
      const e = el as HTMLElement;
      if (e.dataset.done) return; e.dataset.done = '1';
      const target = parseInt(e.getAttribute('data-count') || '', 10);
      if (isNaN(target)) return;
      if (rm) { e.textContent = fmt(target); return; }
      const dur = 1200; let t0: number | null = null;
      function step(ts: number) {
        if (t0 === null) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        e.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // ---- reveal при скролле (анимируется только то, что вошло в вид) ----
    const io = new IntersectionObserver((es) => {
      es.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          entry.target.querySelectorAll('[data-count]').forEach(count);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    const numObs = new IntersectionObserver((es) => {
      es.forEach((entry) => { if (entry.isIntersecting) { count(entry.target); numObs.unobserve(entry.target); } });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach((el) => numObs.observe(el));

    // ---- форма ----
    const form = document.getElementById('leadForm') as HTMLFormElement | null;
    const ok = document.getElementById('formOk');
    function onSubmit(ev: Event) {
      ev.preventDefault();
      if (!form) return;
      const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
      const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();
      const what = (form.elements.namedItem('what') as HTMLSelectElement).value;
      const note = (form.elements.namedItem('note') as HTMLTextAreaElement).value.trim();
      if (!name) { (form.elements.namedItem('name') as HTMLInputElement).focus(); return; }
      if (phone.replace(/\D/g, '').length < 7) { (form.elements.namedItem('phone') as HTMLInputElement).focus(); return; }
      const provider = form.dataset.provider || 'whatsapp';
      const waNum = form.dataset.wa || '';
      const tgUser = form.dataset.tg || '';
      const formspree = form.dataset.formspree || '';
      const text = `Заявка с сайта:\nИмя: ${name}\nТелефон: ${phone}\nУслуга: ${what}` + (note ? `\nКомментарий: ${note}` : '');
      const enc = encodeURIComponent(text);
      const okWa = document.getElementById('okWa') as HTMLAnchorElement | null;
      const okTg = document.getElementById('okTg') as HTMLAnchorElement | null;
      if (okWa) okWa.href = `https://wa.me/${waNum}?text=${enc}`;
      if (okTg) okTg.href = `https://t.me/${tgUser}`;
      if ((provider === 'formspree' || provider === 'both') && formspree) {
        fetch(`https://formspree.io/f/${formspree}`, {
          method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, what, note, _subject: 'Заявка с сайта (Камышин)' }),
        }).catch(() => {});
      }
      form.style.display = 'none';
      if (ok) { ok.classList.add('show'); if (lenis) lenis.scrollTo(ok, { offset: -100 }); else ok.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'center' }); }
    }
    form?.addEventListener('submit', onSubmit);

    return () => {
      removeEventListener('scroll', onScrollUI);
      removeEventListener('load', measureHero);
      removeEventListener('resize', measureHero);
      paraCleanup();
      io.disconnect(); numObs.disconnect();
      clearTimeout(t);
      form?.removeEventListener('submit', onSubmit);
      anchors.forEach((a) => a.removeEventListener('click', onAnchor));
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);
  return null;
}
