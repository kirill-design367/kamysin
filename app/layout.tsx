import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { site } from '@/lib/site';
import './globals.css';

// TT Firs Neue — единый шрифт сайта (сабсет latin+cyrillic, self-host woff2).
// Иерархия по весам: 400 текст · 600 подписи/кнопки · 800 заголовки · 900 hero/цифры.
const firs = localFont({
  src: [
    { path: './fonts/firs-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/firs-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/firs-800.woff2', weight: '800', style: 'normal' },
    { path: './fonts/firs-900.woff2', weight: '900', style: 'normal' },
    { path: './fonts/firs-900i.woff2', weight: '900', style: 'italic' },
  ],
  variable: '--font-firs',
  display: 'swap',
  preload: true,
});

const { seo } = site;
const ogImage = `${seo.siteUrl}${seo.ogImage}`;

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords,
  alternates: { canonical: seo.siteUrl },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: seo.siteUrl,
    title: seo.title,
    description: seo.description,
    siteName: site.brand.name,
    images: [{ url: ogImage, width: 1180, height: 786, alt: seo.title }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
    images: [ogImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F5EA' },
    { media: '(prefers-color-scheme: dark)', color: '#0B110B' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.brand.name,
  description: seo.description,
  url: seo.siteUrl,
  image: ogImage,
  telephone: site.contacts.phoneHref,
  areaServed: { '@type': 'City', name: 'Камышин' },
  address: { '@type': 'PostalAddress', addressLocality: 'Камышин', addressRegion: 'Волгоградская область', addressCountry: 'RU' },
  openingHours: 'Mo-Sa 09:00-19:00',
  makesOffer: site.services.items.map((s) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: `${s.title} ${s.verb}`.replace(/—\s*/, '').trim() },
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={firs.variable}>
      <body className="barpad">
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','1')" }} />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
