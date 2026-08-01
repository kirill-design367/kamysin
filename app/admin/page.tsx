'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import initial from '@/content/site.json';

/* ---------- утилиты ---------- */
type Any = any;
const clone = (o: Any): Any => (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));

function getPath(obj: Any, path: string): Any {
  return path.split('.').reduce((o, k) => (o == null ? o : o[/^\d+$/.test(k) ? +k : k]), obj);
}
function setPath(obj: Any, path: string, value: Any): Any {
  const keys = path.split('.');
  const root = clone(obj);
  let cur = root;
  for (let i = 0; i < keys.length - 1; i++) {
    const k: Any = /^\d+$/.test(keys[i]) ? +keys[i] : keys[i];
    cur = cur[k];
  }
  const last: Any = /^\d+$/.test(keys[keys.length - 1]) ? +keys[keys.length - 1] : keys[keys.length - 1];
  cur[last] = value;
  return root;
}
// base64 <-> utf8
const b64encode = (s: string) => btoa(unescape(encodeURIComponent(s)));
const b64decode = (s: string) => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));

/* ---------- поля (на уровне модуля — стабильные, не пересоздаются при вводе) ---------- */
type AdmApi = { data: Any; set: (path: string, value: Any) => void; onImage: (path: string, file: File) => void };
const AdmCtx = createContext<AdmApi>({ data: {}, set: () => {}, onImage: () => {} });

function T({ label, path, hint, area }: { label: string; path: string; hint?: string; area?: boolean }) {
  const { data, set } = useContext(AdmCtx);
  return (
    <label className="fld">
      <span>{label}{hint && <em>{hint}</em>}</span>
      {area
        ? <textarea value={getPath(data, path) ?? ''} onChange={(e) => set(path, e.target.value)} rows={3} />
        : <input value={getPath(data, path) ?? ''} onChange={(e) => set(path, e.target.value)} />}
    </label>
  );
}
function Img({ label, path }: { label: string; path: string }) {
  const { data, set, onImage } = useContext(AdmCtx);
  return (
    <label className="fld">
      <span>{label}<em>картинка</em></span>
      <div className="imgrow">
        <input value={getPath(data, path) ?? ''} onChange={(e) => set(path, e.target.value)} placeholder="/uploads/файл.jpg" />
        <label className="upl">Загрузить…
          <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onImage(path, e.target.files[0])} />
        </label>
      </div>
    </label>
  );
}
function StrList({ label, path }: { label: string; path: string }) {
  const { data, set } = useContext(AdmCtx);
  const arr: string[] = getPath(data, path) || [];
  return (
    <div className="fld">
      <span className="lbl">{label}</span>
      {arr.map((v, i) => (
        <div className="listrow" key={i}>
          <input value={v} onChange={(e) => set(`${path}.${i}`, e.target.value)} />
          <button type="button" className="mini del" onClick={() => set(path, arr.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="mini add" onClick={() => set(path, [...arr, ''])}>+ добавить</button>
    </div>
  );
}

/* ---------- страница ---------- */
export default function Admin() {
  const [data, setData] = useState<Any>(() => clone(initial));
  const [cfg, setCfg] = useState({ owner: 'kirill-design367', repo: 'kamysin', branch: 'main', token: '' });
  const [sha, setSha] = useState<string>('');
  const [status, setStatus] = useState<{ kind: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState<{ path: string; b64: string }[]>([]);

  useEffect(() => {
    try {
      const t = localStorage.getItem('cms_token');
      const o = localStorage.getItem('cms_cfg');
      if (o) setCfg((c) => ({ ...c, ...JSON.parse(o), token: t || '' }));
      else if (t) setCfg((c) => ({ ...c, token: t }));
    } catch {}
  }, []);

  const set = (path: string, value: Any) => setData((d: Any) => setPath(d, path, value));
  const saveCfg = (next: typeof cfg) => {
    setCfg(next);
    try {
      localStorage.setItem('cms_token', next.token);
      localStorage.setItem('cms_cfg', JSON.stringify({ owner: next.owner, repo: next.repo, branch: next.branch }));
    } catch {}
  };

  /* ----- GitHub ----- */
  const api = (path: string) => `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/${path}`;
  async function ghGet(filePath: string) {
    const r = await fetch(api(`contents/${filePath}?ref=${cfg.branch}`), {
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/vnd.github+json' },
    });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`GitHub ${r.status}: ${(await r.json()).message || r.statusText}`);
    return r.json();
  }
  async function ghPut(filePath: string, contentB64: string, message: string, prevSha?: string) {
    const r = await fetch(api(`contents/${filePath}`), {
      method: 'PUT',
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, content: contentB64, branch: cfg.branch, ...(prevSha ? { sha: prevSha } : {}) }),
    });
    if (!r.ok) throw new Error(`GitHub ${r.status}: ${(await r.json()).message || r.statusText}`);
    return r.json();
  }

  async function loadFromGitHub() {
    if (!cfg.token) return setStatus({ kind: 'err', text: 'Сначала вставьте токен GitHub в разделе «Подключение».' });
    setBusy(true); setStatus({ kind: 'info', text: 'Загружаю актуальную версию с GitHub…' });
    try {
      const j = await ghGet('content/site.json');
      if (!j) throw new Error('Файл content/site.json пока не найден в репозитории.');
      setData(JSON.parse(b64decode(j.content)));
      setSha(j.sha);
      setUploads([]);
      setStatus({ kind: 'ok', text: 'Загружено. Теперь можно редактировать и сохранять.' });
    } catch (e: Any) { setStatus({ kind: 'err', text: String(e.message || e) }); }
    finally { setBusy(false); }
  }

  async function saveToGitHub() {
    if (!cfg.token) return setStatus({ kind: 'err', text: 'Вставьте токен GitHub в разделе «Подключение».' });
    setBusy(true);
    try {
      // 1) картинки
      for (const up of uploads) {
        setStatus({ kind: 'info', text: `Загружаю картинку ${up.path}…` });
        const existing = await ghGet(up.path).catch(() => null);
        await ghPut(up.path, up.b64, `CMS: картинка ${up.path}`, existing?.sha);
      }
      // 2) контент
      setStatus({ kind: 'info', text: 'Сохраняю тексты…' });
      let curSha = sha;
      if (!curSha) { const j = await ghGet('content/site.json'); curSha = j?.sha || ''; }
      const res = await ghPut('content/site.json', b64encode(JSON.stringify(data, null, 2) + '\n'), 'CMS: обновление контента сайта', curSha || undefined);
      setSha(res.content.sha);
      setUploads([]);
      setStatus({ kind: 'ok', text: '✅ Сохранено! Сайт пересоберётся автоматически за 1–2 минуты. Обновите страницу сайта чуть позже.' });
    } catch (e: Any) { setStatus({ kind: 'err', text: String(e.message || e) }); }
    finally { setBusy(false); }
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'site.json'; a.click();
    URL.revokeObjectURL(a.href);
    setStatus({ kind: 'info', text: 'Файл site.json скачан. Загрузите его в репозиторий в папку content/ (замена файла) — сайт обновится.' });
  }

  function onImage(path: string, file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const b64 = dataUrl.split(',')[1];
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const safe = path.split('.').join('-') + '-' + Date.now() + '.' + ext;
      const repoPath = 'public/uploads/' + safe;
      setUploads((u) => [...u.filter((x) => !x.path.startsWith('public/uploads/' + path.split('.').join('-'))), { path: repoPath, b64 }]);
      set(path, '/uploads/' + safe);
      setStatus({ kind: 'info', text: 'Картинка добавлена. Нажмите «Сохранить на GitHub», чтобы применить.' });
    };
    reader.readAsDataURL(file);
  }

  const sections: [string, string, React.ReactNode][] = [
    ['brand', 'Бренд и реквизиты', <>
      <T label="Название компании" path="brand.name" hint="заглушка — заменить" />
      <T label="Подпись под названием" path="brand.tagline" />
      <T label="ИНН" path="brand.inn" />
    </>],
    ['contacts', 'Контакты', <>
      <T label="Телефон (как показывать)" path="contacts.phoneDisplay" />
      <T label="Телефон для ссылки" path="contacts.phoneHref" hint="+7900… без пробелов" />
      <T label="WhatsApp (номер)" path="contacts.whatsapp" hint="79001234567" />
      <T label="Telegram (логин)" path="contacts.telegram" hint="без @" />
      <T label="Часы работы" path="contacts.hours" />
      <T label="Обещание по звонку" path="contacts.callbackNote" />
    </>],
    ['hero', 'Блок 1 — Первый экран', <>
      <T label="Плашка города" path="hero.badge" />
      <T label="Надзаголовок" path="hero.eyebrow" />
      <T label="Заголовок, строка 1" path="hero.titleLine1" />
      <T label="Слово «царь»" path="hero.titleTsar" />
      <T label="«Сила в …»" path="hero.titleLead" />
      <T label="Зачёркнутое слово" path="hero.struck" />
      <T label="Слово поверх (акцент)" path="hero.accentWord" />
      <T label="Подзаголовок-оффер" path="hero.sub" area />
      <T label="Слоган" path="hero.slogan" />
      <T label="Текст кнопки" path="hero.ctaPrimary" />
      <Img label="Главное фото (арбуз с девочкой)" path="hero.imageMain" />
      <T label="Alt главного фото" path="hero.imageMainAlt" />
      <Img label="Медальон (Пётр на арбузе)" path="hero.imageTsar" />
      <T label="Alt медальона" path="hero.imageTsarAlt" />
      <Img label="Фон-свечение (фонтан)" path="hero.imageFountain" />
      <T label="Подпись на медальоне" path="hero.tsarTag" />
      <StrList label="Строка доверия (пункты)" path="hero.trust" />
    </>],
    ['pain', 'Блок 2 — Боль клиента', <>
      <T label="Надзаголовок" path="pain.eyebrow" />
      <T label="Заголовок" path="pain.title" area />
      <T label="Подводка" path="pain.lead" area />
      <StrList label="Вопросы-триггеры" path="pain.questions" />
      <T label="Финал (обычный текст)" path="pain.punchLead" />
      <T label="Финал (акцент)" path="pain.punchAccent" />
    </>],
    ['services', 'Блок 3 — Что делаем', <>
      <T label="Надзаголовок" path="services.eyebrow" />
      <T label="Заголовок" path="services.title" />
      <T label="Подводка" path="services.lead" area />
      {(getPath(data, 'services.items') || []).map((_: Any, i: number) => (
        <div className="subcard" key={i}>
          <b>Способ {i + 1}</b>
          <T label="Заголовок" path={`services.items.${i}.title`} />
          <T label="Глагол (— доставим)" path={`services.items.${i}.verb`} />
          <T label="Описание" path={`services.items.${i}.text`} area />
          <Img label="Фото карточки" path={`services.items.${i}.image`} />
        </div>
      ))}
      <StrList label="Форматы (чипы)" path="services.formats" />
    </>],
    ['scale', 'Блок 4 — Масштаб (цифры)', <>
      <T label="Надзаголовок" path="scale.eyebrow" />
      <T label="Заголовок" path="scale.title" />
      <T label="Большая цифра" path="scale.bigNumber" hint="напр. 1 500" />
      <T label="Подпись к цифре" path="scale.bigCaption" />
      {(getPath(data, 'scale.stats') || []).map((_: Any, i: number) => (
        <div className="listrow2" key={i}>
          <input value={getPath(data, `scale.stats.${i}.value`)} onChange={(e) => set(`scale.stats.${i}.value`, e.target.value)} placeholder="10 000+" />
          <input value={getPath(data, `scale.stats.${i}.label`)} onChange={(e) => set(`scale.stats.${i}.label`, e.target.value)} placeholder="листовок в день" />
          <button type="button" className="mini del" onClick={() => set('scale.stats', getPath(data, 'scale.stats').filter((_: Any, j: number) => j !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="mini add" onClick={() => set('scale.stats', [...getPath(data, 'scale.stats'), { value: '', label: '' }])}>+ добавить цифру</button>
      <T label="Ударная фраза" path="scale.punch" />
      <T label="Примечание внизу" path="scale.note" area />
    </>],
    ['lead', 'Блок 5 — Заявка', <>
      <T label="Надзаголовок" path="lead.eyebrow" />
      <T label="Заголовок" path="lead.title" />
      <T label="Подводка" path="lead.sub" area />
      <StrList label="Варианты в форме («что распространяем»)" path="lead.options" />
      <T label="Заголовок «спасибо»" path="lead.successTitle" />
      <T label="Текст «спасибо»" path="lead.successText" area />
      <T label="Строка согласия" path="lead.privacy" area />
    </>],
    ['form', 'Форма — куда уходят заявки', <>
      <label className="fld"><span>Способ приёма заявок</span>
        <select value={getPath(data, 'form.provider')} onChange={(e) => set('form.provider', e.target.value)}>
          <option value="whatsapp">WhatsApp (открывается на номер выше)</option>
          <option value="formspree">E-mail через Formspree</option>
          <option value="both">И e-mail, и WhatsApp</option>
        </select>
      </label>
      <T label="Formspree ID" path="form.formspreeId" hint="если выбран e-mail" />
    </>],
    ['seo', 'SEO (для поисковиков)', <>
      <T label="Title" path="seo.title" area />
      <T label="Description" path="seo.description" area />
      <T label="Ключевые слова" path="seo.keywords" area />
      <T label="Адрес сайта" path="seo.siteUrl" />
    </>],
  ];

  return (
    <AdmCtx.Provider value={{ data, set, onImage }}>
    <div className="adm">
      <style>{CSS}</style>
      <header className="adm-hd">
        <div><b>🍉 Редактор сайта</b><span>Разнесём · Камышин</span></div>
        <div className="adm-actions">
          <a href={(process.env.NEXT_PUBLIC_BASE_PATH || '') + '/'} target="_blank" rel="noopener" className="mini">Открыть сайт ↗</a>
        </div>
      </header>

      <div className="adm-wrap">
        <section className="conn">
          <h2>Подключение к GitHub</h2>
          <p className="muted">Заполните один раз. Токен хранится только в этом браузере. Нужен «fine-grained» токен с доступом
            к репозиторию <b>{cfg.owner}/{cfg.repo}</b> и правом <b>Contents: Read and write</b>.</p>
          <div className="conn-grid">
            <label className="fld"><span>Owner</span><input value={cfg.owner} onChange={(e) => saveCfg({ ...cfg, owner: e.target.value })} /></label>
            <label className="fld"><span>Репозиторий</span><input value={cfg.repo} onChange={(e) => saveCfg({ ...cfg, repo: e.target.value })} /></label>
            <label className="fld"><span>Ветка</span><input value={cfg.branch} onChange={(e) => saveCfg({ ...cfg, branch: e.target.value })} /></label>
            <label className="fld"><span>Токен (ghp_… / github_pat_…)</span><input type="password" value={cfg.token} onChange={(e) => saveCfg({ ...cfg, token: e.target.value })} placeholder="вставьте токен" /></label>
          </div>
          <div className="conn-btns">
            <button type="button" className="mini" onClick={loadFromGitHub} disabled={busy}>Загрузить актуальное с GitHub</button>
          </div>
        </section>

        {status && <div className={`status ${status.kind}`}>{status.text}</div>}

        {sections.map(([id, title, body]) => (
          <details className="sect" key={id} open={id === 'hero' || id === 'contacts'}>
            <summary>{title}</summary>
            <div className="sect-body">{body}</div>
          </details>
        ))}

        <div className="savebar">
          <button type="button" className="save gh" onClick={saveToGitHub} disabled={busy}>
            {busy ? 'Сохраняю…' : '💾 Сохранить на GitHub (сайт обновится)'}
          </button>
          <button type="button" className="save dl" onClick={downloadJson} disabled={busy}>Скачать site.json</button>
        </div>
        <p className="muted foot">После «Сохранить на GitHub» сайт автоматически пересобирается 1–2 минуты. Если что-то пошло не так — просто перезагрузите эту страницу, несохранённые правки сбросятся.</p>
      </div>
    </div>
    </AdmCtx.Provider>
  );
}

const CSS = `
.adm{min-height:100vh;background:#0f130d;color:#eef0e6;font-family:var(--font-firs),system-ui,sans-serif;padding-bottom:120px}
.adm *{box-sizing:border-box}
.adm-hd{position:sticky;top:0;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:12px;
  padding:14px 20px;background:#0b0f09;border-bottom:1px solid #26301f}
.adm-hd b{font-family:var(--font-firs);font-size:1.2rem;letter-spacing:.02em}
.adm-hd span{color:#8a977c;margin-left:10px;font-size:.85rem}
.adm-wrap{max-width:760px;margin:0 auto;padding:20px}
.conn{background:#141a11;border:1px solid #2a3420;border-radius:14px;padding:20px;margin-bottom:18px}
.conn h2{font-family:var(--font-firs);text-transform:uppercase;letter-spacing:.05em;font-size:1.1rem;margin:0 0 8px}
.conn-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.conn-btns{margin-top:12px}
.muted{color:#8a977c;font-size:.85rem;line-height:1.5}
.foot{margin-top:16px;text-align:center}
.status{padding:12px 16px;border-radius:10px;margin:14px 0;font-size:.9rem;font-weight:600}
.status.ok{background:#12351f;color:#7ee2a1;border:1px solid #1d5230}
.status.err{background:#3a1518;color:#ff9aa5;border:1px solid #5c1f26}
.status.info{background:#12233a;color:#8fc6ff;border:1px solid #1d3a5c}
.sect{background:#141a11;border:1px solid #2a3420;border-radius:14px;margin-bottom:12px;overflow:hidden}
.sect>summary{cursor:pointer;padding:16px 18px;font-family:var(--font-firs);text-transform:uppercase;letter-spacing:.04em;
  font-size:1rem;list-style:none;display:flex;justify-content:space-between;align-items:center;user-select:none}
.sect>summary::after{content:"▾";color:#5f6e50}
.sect[open]>summary::after{content:"▴"}
.sect-body{padding:4px 18px 20px;display:flex;flex-direction:column;gap:14px}
.fld{display:flex;flex-direction:column;gap:6px}
.fld>span,.lbl{font-size:.78rem;font-weight:700;color:#a9b79a;text-transform:uppercase;letter-spacing:.04em}
.fld>span em,.fld em{font-style:normal;color:#e2564a;text-transform:none;letter-spacing:0;margin-left:8px;font-size:.72rem}
.adm input,.adm textarea,.adm select{width:100%;background:#0d120a;border:1.5px solid #2f3b25;border-radius:9px;
  color:#eef0e6;padding:11px 12px;font:inherit;font-size:.95rem}
.adm textarea{resize:vertical;min-height:60px}
.adm input:focus,.adm textarea:focus,.adm select:focus{outline:none;border-color:#43b268}
.imgrow{display:flex;gap:8px}
.imgrow input{flex:1}
.upl{white-space:nowrap;display:inline-flex;align-items:center;background:#233019;border:1px solid #35492a;border-radius:9px;
  padding:0 14px;font-size:.85rem;color:#a9e6bd;cursor:pointer}
.listrow,.listrow2{display:flex;gap:8px;align-items:center}
.listrow2{display:grid;grid-template-columns:1fr 1.4fr auto}
.subcard{background:#0f150c;border:1px solid #26301f;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px}
.subcard b{font-family:var(--font-firs);color:#e2564a;font-size:.9rem}
.mini{background:#233019;border:1px solid #35492a;color:#cfe8d6;border-radius:8px;padding:8px 14px;font:inherit;
  font-size:.85rem;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block}
.mini:hover{background:#2c3d20}
.mini.del{background:#3a1518;border-color:#5c1f26;color:#ff9aa5;padding:8px 11px}
.mini.add{align-self:flex-start;margin-top:4px}
.savebar{position:fixed;left:0;right:0;bottom:0;display:flex;gap:10px;justify-content:center;padding:12px;
  background:#0b0f09ee;backdrop-filter:blur(8px);border-top:1px solid #26301f}
.save{border:none;border-radius:10px;padding:14px 20px;font:inherit;font-weight:700;font-size:.95rem;cursor:pointer}
.save.gh{background:#e2564a;color:#fff}
.save.dl{background:#233019;color:#cfe8d6;border:1px solid #35492a}
.save:disabled{opacity:.6;cursor:default}
@media(max-width:560px){.conn-grid{grid-template-columns:1fr}.savebar{flex-direction:column}.save{width:100%}}
`;
