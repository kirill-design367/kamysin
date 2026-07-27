// Базовый путь нужен только для GitHub Pages (сайт живёт в подпапке /kamyshin-reklama).
// На своём домене или Vercel оставьте переменную пустой — тогда basePath = ''.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',            // статический экспорт → быстрый сайт, дешёвый/бесплатный хостинг
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true }, // обязательно для output: 'export'
  trailingSlash: true,           // корректные пути на GitHub Pages
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
