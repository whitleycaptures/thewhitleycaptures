'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useSyncExternalStore } from 'react';

type Choice = 'accepted' | 'declined' | 'unset';
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean;
  }
}
const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const noticeVersion = '2026-10-27';
// Change this version only when the consent scope changes, not for visual updates.
let memoryChoice: Choice = 'unset';
let storageUnavailable = false;
const consent = (): Choice => {
  if (storageUnavailable) return memoryChoice;
  try {
    const value = localStorage.getItem('analytics-consent');
    if (value === 'declined') return 'declined';
    const storedRecord = localStorage.getItem('analytics-consent-record');
    let record;
    try {
      record = JSON.parse(storedRecord || 'null');
    } catch {
      return 'unset';
    }
    return value === 'accepted' &&
      record?.version === noticeVersion &&
      record?.choice === 'accepted'
      ? 'accepted'
      : 'unset';
  } catch {
    return memoryChoice;
  }
};
const subscribe = (callback: () => void) => {
  window.addEventListener('analytics-consent', callback);
  const changed = () => {
    if (consent() !== 'accepted') disable();
    callback();
  };
  window.addEventListener('storage', changed);
  return () => {
    window.removeEventListener('analytics-consent', callback);
    window.removeEventListener('storage', changed);
  };
};
const server = (): Choice => 'unset';
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
function choose(value: Choice) {
  // Count only an explicit new button choice, never a remembered visit or
  // cross-tab update. Refusal never loads Google or sends visitor identifiers.
  const previous = consent();
  if (value !== 'unset' && previous === 'unset') {
    void fetch('/api/consent-count', {
      method: 'POST',
      body: value,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      keepalive: true,
    }).catch(() => {
      /* Counting must never prevent a privacy choice. */
    });
  }
  memoryChoice = value;
  try {
    localStorage.setItem(
      'analytics-consent-record',
      JSON.stringify({
        version: noticeVersion,
        choice: value,
        chosenAt: new Date().toISOString(),
      }),
    );
    localStorage.setItem('analytics-consent', value);
  } catch {
    storageUnavailable = true;
    // Consent still works for this visit when browser storage is unavailable.
  }
  window.dispatchEvent(new Event('analytics-consent'));
}
function disable() {
  if (id) window[`ga-disable-${id}`] = true;
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0];
    if (name !== '_ga' && !name.startsWith('_ga_')) continue;
    const domains = ['', location.hostname, 'thewhitleycaptures.com'];
    for (const domain of domains)
      document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ''}`;
  }
}
function referrer(pages: Record<string, string>) {
  try {
    const url = new URL(document.referrer);
    return url.origin === location.origin
      ? url.origin + (pages[url.pathname] ? url.pathname : '/')
      : url.origin + '/';
  } catch {
    return '';
  }
}
export function Analytics({ pages }: { pages: Record<string, string> }) {
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const choice = useSyncExternalStore(subscribe, consent, server);
  const pathname = usePathname();
  const lastPage = useRef<string | null>(null);
  const banner = useRef<HTMLElement>(null);
  const space = useRef<HTMLDivElement>(null);
  const valid = Boolean(id && /^G-[A-Z0-9]+$/.test(id));
  useEffect(() => {
    if (!valid || !banner.current || !space.current) return;
    const resize = () => {
      const height =
        Math.ceil(banner.current!.getBoundingClientRect().height) + 24;
      space.current!.style.height = `${height}px`;
      document.documentElement.style.setProperty(
        '--cookie-clearance',
        `${height}px`,
      );
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(banner.current);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--cookie-clearance');
    };
  }, [choice, valid, ready]);
  useEffect(() => {
    if (!valid || !id) return;
    if (choice !== 'accepted' || !pages[pathname]) {
      disable();
      lastPage.current = null;
      return;
    }
    window[`ga-disable-${id}`] = false;
    window.dataLayer ||= [];
    window.gtag ||= function () {
      // Google's command queue consumes the function's Arguments object.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    const previous = lastPage.current;
    const context = {
      page_location: location.origin + pathname,
      page_title: pages[pathname],
      page_referrer: previous ? location.origin + previous : referrer(pages),
    };
    if (!document.getElementById('whitley-google-analytics')) {
      window.gtag('consent', 'default', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      window.gtag('js', new Date());
      const script = document.createElement('script');
      script.id = 'whitley-google-analytics';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.append(script);
    }
    // Also disable history-based page views in the GA4 stream's enhanced measurement.
    window.gtag('config', id, {
      ...context,
      send_page_view: false,
      cookie_expires: 63072000,
      cookie_update: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    if (previous !== pathname) {
      window.gtag('event', 'page_view', context);
      lastPage.current = pathname;
    }
    const click = (event: MouseEvent) => {
      if (consent() !== 'accepted' || !(event.target instanceof Element))
        return;
      const link = event.target.closest('a');
      if (!link) return;
      const url = new URL(link.href, location.href);
      const name =
        url.protocol === 'mailto:'
          ? 'email_click'
          : url.origin === location.origin &&
              url.pathname === '/' &&
              url.hash === '#enquire'
            ? 'enquiry_click'
            : null;
      if (name) window.gtag?.('event', name, context);
    };
    document.addEventListener('click', click, true);
    return () => {
      document.removeEventListener('click', click, true);
      window[`ga-disable-${id}`] = true;
    };
  }, [choice, pathname, pages, valid]);
  if (!valid || !ready || choice !== 'unset') return null;
  return (
    <>
      <div ref={space} className="analytics-space" aria-hidden="true" />
      <aside
        ref={banner}
        className="analytics-choice analytics-banner"
        aria-label="Analytics cookie preferences"
      >
        <div className="analytics-copy">
          <h2>A little note about cookies</h2>
          <p>
            May I use Google Analytics cookies to help improve my website?
            You can browse and enquire without them. Change your choice anytime
            in Cookie preferences.
          </p>
          <a href="/privacy-policy#analytics-cookies">
            About cookies and privacy
          </a>
        </div>
        <div className="analytics-actions">
          <button disabled={!ready} onClick={() => choose('accepted')}>
            Accept analytics cookies
          </button>
          <button disabled={!ready} onClick={() => choose('declined')}>
            No thanks
          </button>
        </div>
      </aside>
    </>
  );
}

export function CookiePreferences() {
  const ready = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const choice = useSyncExternalStore(subscribe, consent, server);
  if (!ready || choice === 'unset' || !id || !/^G-[A-Z0-9]+$/.test(id))
    return null;
  return (
    <button
      className="footer-cookie-preferences"
      onClick={() => {
        disable();
        choose('unset');
        window.location.reload();
      }}
    >
      Cookie preferences
    </button>
  );
}
