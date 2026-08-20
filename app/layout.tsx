import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Гостевой дом у моря в Адлере — номера на 2–5 гостей | На Морозова',
  description: 'Гостевой дом «На Морозова» в Адлере: номера для 2–5 гостей, варианты с балконом и кухней, размещение рядом с морем. Подберите номер под свои даты и состав гостей.',
  keywords: ['гостевой дом Адлер', 'На Морозова', 'номера у моря', 'Адлер Павлик Морозов'],
  metadataBase: new URL('https://na-morozova-adler.sharikov715025.chatgpt.site'),
  openGraph: {
    title: 'Гостевой дом у моря в Адлере — номера на 2–5 гостей | На Морозова',
    description: 'Номера для 2–5 гостей, варианты с балконом и кухней. Подберите вариант под даты и состав гостей.',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Гостевой дом «На Морозова»',
    images: [{ url: '/images/property-01.webp', width: 1280, height: 854, alt: 'Фасад гостевого дома «На Морозова» в Адлере' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Гостевой дом «На Морозова» в Адлере',
    description: 'Подберите номер под даты и состав гостей.',
    images: ['/images/property-01.webp'],
  },
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
