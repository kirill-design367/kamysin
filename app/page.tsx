import { site, asset, parseNum } from '@/lib/site';
import ClientScripts from '@/components/ClientScripts';
import MelonLogo from '@/components/MelonLogo';

const { brand, contacts, hero, pain, services, scale, lead } = site;

const serviceIcons = [
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l9-5 9 5v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M3 8l9 6 9-6" /></svg>,
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13l2-5a2 2 0 0 1 1.9-1.4h10.2A2 2 0 0 1 19 8l2 5" /><path d="M5 13h14v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H11a2 2 0 0 1-4 0H6a1 1 0 0 1-1-1z" /></svg>,
];

function Num({ value }: { value: string }) {
  const { count, suffix } = parseNum(value);
  if (count === null) return <>{value}</>;
  return (
    <>
      <span data-count={count}>{count.toLocaleString('ru-RU')}</span>
      {suffix}
    </>
  );
}

export default function Page() {
  const tel = `tel:${contacts.phoneHref}`;
  const wa = `https://wa.me/${contacts.whatsapp}`;
  const tg = `https://t.me/${contacts.telegram}`;

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className="hdr" id="hdr">
        <div className="wrap">
          <a className="brand" href="#top" aria-label="На главную">
            <MelonLogo k="h" />
            <span>{brand.name}<small>{brand.tagline}</small></span>
          </a>
          <div className="hdr-right">
            <a className="hdr-phone" href={tel}><span>Звоните</span>{contacts.phoneDisplay}</a>
            <a className="btn btn-primary btn-sm" href="#zayavka">{hero.ctaPrimary}</a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ===== HERO ===== */}
        <section className="hero" id="hero">
          <div className="hero-glow" aria-hidden="true" />
          <img className="hero-fountain" src={asset(hero.imageFountain)} alt="" aria-hidden="true" />
          <div className="wrap hero-inner">
            <span className="badge-city reveal">🍉 {hero.badge}</span>
            <span className="eyebrow reveal d1">{hero.eyebrow}</span>
            <h1 className="hero-title display reveal d2">
              <span className="line">{hero.titleLine1}</span>
              <span className="line"><span className="tsar">{hero.titleTsar}</span><span className="q">?</span></span>
              <span className="line">{hero.titleLead}{' '}
                <span className="correct">
                  <span className="struck">{hero.struck}</span>
                  <span className="reklame">{hero.accentWord}</span>
                </span>
              </span>
            </h1>
            <p className="hero-sub reveal d3">{hero.sub}</p>
            <p className="hero-slogan reveal d4">«{hero.slogan}»</p>
            <div className="hero-cta reveal d5">
              <a className="btn btn-primary" href="#zayavka">{hero.ctaPrimary}</a>
              <a className="btn btn-ghost" href={tel}>📞 {contacts.phoneDisplay}</a>
            </div>

            <div className="hero-media reveal d6">
              <div className="hero-photo">
                <img src={asset(hero.imageMain)} alt={hero.imageMainAlt} />
              </div>
              <div className="hero-tsar">
                <img src={asset(hero.imageTsar)} alt={hero.imageTsarAlt} />
              </div>
              <span className="tsar-tag">{hero.tsarTag}</span>
            </div>

            <div className="trust reveal d7">
              {hero.trust.map((t, i) => (
                <span key={i} style={{ display: 'contents' }}>
                  <span>{t}</span>
                  {i < hero.trust.length - 1 && <span className="dot" />}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PAIN ===== */}
        <section className="section pain" id="pain">
          <div className="wrap">
            <span className="eyebrow reveal">{pain.eyebrow}</span>
            <h2 className="reveal">{pain.title}</h2>
            <p className="pain-lead reveal">{pain.lead}</p>
            <div className="pain-list">
              {pain.questions.map((q, i) => (
                <p className={`pain-q reveal${i ? ` d${i}` : ''}`} key={i}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span><span>{q}</span>
                </p>
              ))}
            </div>
            <p className="pain-punch reveal">{pain.punchLead} <b>{pain.punchAccent}</b></p>
          </div>
        </section>

        {/* ===== WHAT WE DO ===== */}
        <section className="section do" id="uslugi">
          <div className="wrap">
            <span className="eyebrow reveal">{services.eyebrow}</span>
            <h2 className="reveal">{services.title}</h2>
            <p className="do-lead reveal">{services.lead}</p>
            <div className="cards">
              {services.items.map((s, i) => (
                <article className={`card reveal${i ? ` d${i}` : ''}`} key={i}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ico" aria-hidden="true">{serviceIcons[i]}</span>
                  <h3>{s.title}<em>{s.verb}</em></h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
            <div className="formats">
              {services.formats.map((f, i) => (
                <span className="chip" key={i}><b>#</b> {f}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SCALE ===== */}
        <section className="section scale" id="masshtab">
          <div className="seedrow" id="seedrow" aria-hidden="true" />
          <div className="wrap">
            <span className="eyebrow reveal">{scale.eyebrow}</span>
            <h2 className="reveal">{scale.title}</h2>
            <div className="bignum reveal">
              <span className="val"><Num value={scale.bigNumber} /></span>
              <span className="cap">{scale.bigCaption}</span>
            </div>
            <div className="stats">
              {scale.stats.map((st, i) => (
                <div className={`stat reveal${i ? ` d${i}` : ''}`} key={i}>
                  <div className="v"><Num value={st.value} /></div>
                  <div className="l">{st.label}</div>
                </div>
              ))}
            </div>
            <p className="scale-punch bignum">
              <span className="cap">О вас узнает <b>{scale.punch.replace(/^О вас узнает\s*/i, '').replace(/\.$/, '')}</b>.</span>
            </p>
            <p className="scale-note reveal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
              {scale.note}
            </p>
          </div>
        </section>

        {/* ===== LEAD / FORM ===== */}
        <section className="section lead-sec" id="zayavka">
          <div className="wrap lead-grid">
            <div>
              <span className="eyebrow reveal">{lead.eyebrow}</span>
              <h2 className="reveal">{lead.title}</h2>
              <p className="sub reveal">{lead.sub}</p>
              <div className="contacts reveal d1" style={{ marginTop: 22 }}>
                <a className="phone-big" href={tel}>
                  <span className="k">Позвонить — так быстрее</span>
                  <span className="v">{contacts.phoneDisplay}</span>
                </a>
                <div className="msg-row">
                  <a className="msg wa" href={wa} target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.5-5.9c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.6 6.6 0 0 1-1.9-1.2 7.3 7.3 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4.2-.4a.5.5 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3A2.8 2.8 0 0 0 6 9.3a4.9 4.9 0 0 0 1 2.6 11 11 0 0 0 4.3 3.8c2.4 1 2.4.7 2.9.6a2.5 2.5 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.4-.3z" /></svg>
                    WhatsApp</a>
                  <a className="msg tg" href={tg} target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.9 4.3 18.7 19.5c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 9-8.1c.4-.4-.1-.6-.6-.2L6.4 13.1l-4.8-1.5c-1-.3-1-1 .2-1.5l18.7-7.2c.9-.3 1.6.2 1.4 1.4z" /></svg>
                    Telegram</a>
                </div>
                <div className="hours"><span className="dot" /> {contacts.callbackNote} ({contacts.hours})</div>
              </div>
            </div>

            <div className="reveal d1">
              <form
                className="form"
                id="leadForm"
                noValidate
                data-provider={site.form.provider}
                data-wa={contacts.whatsapp}
                data-tg={contacts.telegram}
                data-formspree={site.form.formspreeId}
              >
                <div className="field">
                  <label htmlFor="f-name">Как вас зовут</label>
                  <input id="f-name" name="name" type="text" placeholder="Иван" autoComplete="name" required />
                </div>
                <div className="field">
                  <label htmlFor="f-phone">Телефон</label>
                  <input id="f-phone" name="phone" type="tel" placeholder="+7 900 000-00-00" autoComplete="tel" required />
                </div>
                <div className="field">
                  <label htmlFor="f-what">Что распространяем</label>
                  <select id="f-what" name="what" defaultValue={lead.options[0]}>
                    {lead.options.map((o, i) => <option key={i}>{o}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="f-note">Комментарий (необязательно)</label>
                  <textarea id="f-note" name="note" placeholder="Тираж, район, сроки, что рекламируем…" />
                </div>
                <button className="btn btn-primary" type="submit">Отправить заявку</button>
                <p className="form-note">{lead.privacy}</p>
              </form>
              <div className="form-ok" id="formOk">
                <div style={{ fontSize: '2.6rem', lineHeight: 1 }}>🍉</div>
                <div className="big">{lead.successTitle}</div>
                <p style={{ color: 'var(--ink-soft)', margin: '.5em 0 1em' }}>{lead.successText}</p>
                <div className="msg-row" style={{ maxWidth: 340, margin: '0 auto' }}>
                  <a className="msg wa" id="okWa" href="#" target="_blank" rel="noopener">WhatsApp</a>
                  <a className="msg tg" id="okTg" href="#" target="_blank" rel="noopener">Telegram</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="ftr">
        <div className="wrap">
          <a className="brand" href="#top"><MelonLogo k="f" />
            <span>{brand.name}<small>{brand.tagline}</small></span></a>
          <small>{site.seo.description.split('.')[0]}.<br />
            © {new Date().getFullYear()} · ИНН {brand.inn} · рабочее название бренда</small>
          <a className="up" href="#top">Наверх ↑</a>
        </div>
      </footer>

      {/* ===== MOBILE STICKY BAR ===== */}
      <div className="mbar" id="mbar">
        <a className="btn btn-call" href={tel}>📞 Позвонить</a>
        <a className="btn btn-primary" href="#zayavka">{hero.ctaPrimary}</a>
      </div>

      <ClientScripts />
    </>
  );
}
