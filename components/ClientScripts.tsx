'use client';
import { useEffect } from 'react';

export default function ClientScripts() {
  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const hdr = document.getElementById('hdr');
    const mbar = document.getElementById('mbar');
    const hero = document.getElementById('hero');

    function onScroll() {
      if (hdr) hdr.classList.toggle('stuck', scrollY > 20);
      if (mbar && hero) mbar.classList.toggle('show', hero.getBoundingClientRect().bottom < 80);
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // hero load reveal + strike draw
    const t = setTimeout(() => document.body.classList.add('ready'), 80);

    // seeds in scale block
    const sr = document.getElementById('seedrow');
    if (sr && !sr.childElementCount) {
      for (let i = 0; i < 26; i++) {
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

    // count up
    function fmt(n: number) { return n.toLocaleString('ru-RU'); }
    function count(el: Element) {
      const e = el as HTMLElement;
      if (e.dataset.done) return; e.dataset.done = '1';
      const target = parseInt(e.getAttribute('data-count') || '', 10);
      if (isNaN(target)) return;
      if (rm) { e.textContent = fmt(target); return; }
      const dur = 1100; let t0: number | null = null;
      function step(ts: number) {
        if (t0 === null) t0 = ts;
        const p = Math.min((ts - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        e.textContent = fmt(Math.round(target * ease));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    // reveal on scroll
    const io = new IntersectionObserver((es) => {
      es.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          entry.target.querySelectorAll('[data-count]').forEach(count);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    // count-up for bignum/stat values that may sit inside revealed blocks
    const numObs = new IntersectionObserver((es) => {
      es.forEach((entry) => { if (entry.isIntersecting) { count(entry.target); numObs.unobserve(entry.target); } });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach((el) => numObs.observe(el));

    // form
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

      // real e-mail delivery via Formspree, if configured
      if ((provider === 'formspree' || provider === 'both') && formspree) {
        fetch(`https://formspree.io/f/${formspree}`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, what, note, _subject: 'Заявка с сайта (Камышин)' }),
        }).catch(() => {});
      }

      form.style.display = 'none';
      if (ok) { ok.classList.add('show'); ok.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'center' }); }
    }
    form?.addEventListener('submit', onSubmit);

    return () => {
      removeEventListener('scroll', onScroll);
      io.disconnect(); numObs.disconnect();
      clearTimeout(t);
      form?.removeEventListener('submit', onSubmit);
    };
  }, []);
  return null;
}
