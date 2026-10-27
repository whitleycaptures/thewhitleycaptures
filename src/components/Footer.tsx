import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
import { reviewLinks } from '@/content/navigation';
import { Photo } from './Photo';
import type { SiteSettings } from '@/content/types';
import { CookiePreferences } from './Analytics';
export function Footer({
  settings,
  showCookiePreferences = false,
}: {
  settings: SiteSettings;
  showCookiePreferences?: boolean;
}) {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <Link href="/" aria-label="The Whitley Captures home">
          <Photo image={settings.logo} sizes="160px" className="footer-logo" />
        </Link>
        <div>
          <p className="eyebrow">A LITTLE STUDIO. A LOT OF HEART.</p>
          <p>
            {settings.location}
            <br />
            {settings.areaServed}
          </p>
          <a href={`mailto:${settings.email}`} className="footer-email">
            {settings.email}
          </a>
        </div>
        <div className="footer-socials">
          {reviewLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          {settings.socials.map((s) => (
            <a href={s.href} key={s.href}>
              {s.label}{' '}
              <span aria-hidden="true">
                <ArrowIcon direction="up-right" />
              </span>
            </a>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {settings.name}
        </span>
        <span>Photography by Rachel Whitley</span>
        <a href="/privacy-policy">Privacy policy</a>
        {showCookiePreferences && <CookiePreferences />}
      </div>
    </footer>
  );
}
