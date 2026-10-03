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
let memoryChoice: Choice = 'unset';
const consent = (): Choice => {
  try {
    const value = localStorage.getItem('analytics-consent');
    return value === 'accepted' || value === 'declined' ? value : 'unset';
  } catch {
    return memoryChoice;
  }
};
const subscribe = (callback: () => void) => {
  window.addEventListener('analytics-consent', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('analytics-consent', callback);
    window.removeEventListener('storage', callback);
  };
};
const server = (): Choice => 'unset';
function choose(value: Choice) {
  memoryChoice = value;
  try {
    localStorage.setItem('analytics-consent', value);
  } catch {
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
  const choice = useSyncExternalStore(subscribe, consent, server);
  const pathname = usePathname();
  const lastPage = useRef<string | null>(null);
  const valid = Boolean(id && /^G-[A-Z0-9]+$/.test(id));
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
  if (!valid) return null;
  return (
    <aside
      className="analytics-choice"
      aria-label="Analytics cookie preferences"
    >
      {choice === 'unset' ? (
        <>
          May I use analytics cookies to understand how this website is used?{' '}
          <button onClick={() => choose('accepted')}>Accept</button>
          <button onClick={() => choose('declined')}>No thanks</button>
        </>
      ) : (
        <button
          onClick={() => {
            disable();
            choose('unset');
            window.location.reload();
          }}
        >
          Cookie preferences
        </button>
      )}
    </aside>
  );
}
