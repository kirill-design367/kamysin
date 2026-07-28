// Base path is only needed for GitHub Pages (site lives under /kamysin).
// On a custom domain or Vercel keep NEXT_PUBLIC_BASE_PATH empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath ? basePath : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
