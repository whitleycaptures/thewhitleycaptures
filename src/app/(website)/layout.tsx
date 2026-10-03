import { DraftBanner } from '@/components/DraftBanner';
import { Analytics } from '@/components/Analytics';
import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import './globals.css';
import { getSiteSettings, getServices, getArticles } from '@/content';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { siteUrl, isProduction } from '@/lib/seo';
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: siteUrl,
    title: { default: settings.seo.title, template: `%s | ${settings.name}` },
    description: settings.seo.description,
    robots: { index: isProduction, follow: isProduction },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, services, articles, draft] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getArticles(),
    draftMode(),
  ]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header
        logo={settings.logo}
        navigation={settings.navigation}
        services={services.map((s) => ({
          label: s.title,
          href: `/prices/${s.slug}`,
        }))}
      />
      <DraftBanner />
      {children}
      {isProduction && !draft.isEnabled && (
        <Analytics
          pages={Object.fromEntries([
            ['/', 'Home'],
            ['/about-me', 'About Rachel'],
            ['/client-guides', 'Client guides'],
            ['/portfolio', 'Portfolio'],
            ['/privacy-policy', 'Privacy policy'],
            ...services.map((s) => [`/prices/${s.slug}`, s.title]),
            ...articles.map((a) => [`/post/${a.slug}`, a.title]),
          ])}
        />
      )}
      <Footer settings={settings} />
    </>
  );
}
