# Разнесём — лендинг распространения рекламы в Камышине

Одностраничный сайт службы распространения рекламы (листовки по почтовым ящикам,
расклейка на подъездах, реклама под дворники, адресная доставка). Арбузная тема —
локальный код Камышина, «арбузной столицы».

**Редактирование контента без программиста:** встроенная админ-панель на `/admin`.
Инструкция для владельца — в **[ИНСТРУКЦИЯ.md](./ИНСТРУКЦИЯ.md)**.

---

## Стек

- **Next.js 15** (App Router) + **React 19**, статический экспорт (`output: 'export'`)
- **TypeScript**
- Шрифты: Oswald (заголовки-афиши), Manrope (текст), Caveat (рукописный акцент) —
  через `next/font`, самохостинг, без внешних CDN
- Без тяжёлых библиотек: анимации на нативном IntersectionObserver + CSS
- Весь контент — в одном файле `content/site.json`

## Запуск локально

```bash
npm install
npm run dev        # http://localhost:3000  (сайт), /admin — редактор
```

## Сборка

```bash
npm run build      # статический экспорт в ./out
```

Для GitHub Pages базовый путь подставляется автоматически (см. деплой). Локально и на
своём домене/Vercel переменная `NEXT_PUBLIC_BASE_PATH` пустая.

## Деплой на GitHub Pages (автоматически)

1. В GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Любой `push` в ветку `main` запускает workflow `.github/workflows/deploy.yml`,
   который собирает сайт и публикует его.
3. Адрес сайта: `https://<owner>.github.io/<repo>/` (для этого репозитория —
   `https://kirill-design367.github.io/kamysin/`).

Базовый путь (`/kamysin`) workflow берёт автоматически из `actions/configure-pages`,
менять `next.config.mjs` не нужно.

> Альтернатива — **Vercel**: импортируйте репозиторий, framework определится сам,
> переменную `NEXT_PUBLIC_BASE_PATH` оставьте пустой. Тогда сайт будет на своём домене
> без подпапки.

## Структура

```
content/site.json      ← ВЕСЬ редактируемый контент (тексты, цифры, контакты, фото)
lib/site.ts            ← загрузка контента + помощники (пути, парсинг чисел)
app/layout.tsx         ← шрифты, SEO-мета, schema.org (LocalBusiness)
app/page.tsx           ← сборка страницы из 5 блоков
app/globals.css        ← дизайн-система (цвета, типографика, компоненты)
app/admin/             ← встроенная CMS (редактор /admin)
components/ClientScripts.tsx  ← анимации, счётчики, отправка формы
public/                ← изображения (girl.jpg, peter.jpg, fountain.jpg) + /uploads
.github/workflows/     ← автодеплой на GitHub Pages
```

## Форма заявок

Способ приёма настраивается в `content/site.json` → `form.provider` (или через `/admin`):

- `whatsapp` — по кнопке заявка открывается в WhatsApp на номер `contacts.whatsapp`
  с уже заполненным текстом (работает сразу, без бэкенда);
- `formspree` — заявка уходит на e-mail через [Formspree](https://formspree.io)
  (укажите `form.formspreeId`);
- `both` — и то, и другое.

Подробнее — в [ИНСТРУКЦИЯ.md](./ИНСТРУКЦИЯ.md).

## Что заменить перед запуском

Всё — через `/admin` или в `content/site.json`:

- **Название компании** (`brand.name`) — сейчас заглушка «РАЗНЕСЁМ».
- **Телефон / WhatsApp / Telegram** (`contacts.*`) — сейчас заглушки `000-00-00`.
- **ИНН** (`brand.inn`).
- **Цифры охвата** по районам (`scale.*`).
- Настройку приёма заявок (`form.*`).
