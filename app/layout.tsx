import type { Metadata, Viewport } from 'next';
import { Oswald, Manrope, Caveat } from 'next/font/google';
import { site } from '@/lib/site';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});
const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});
const caveat = Caveat({
  subsets: ['latin', 'cyrillic'],
  weight: ['700'],
  variable: '--font-caveat',
  display: 'swap',
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
    <html lang="ru" className={`${oswald.variable} ${manrope.variable} ${caveat.variable}`}>
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
