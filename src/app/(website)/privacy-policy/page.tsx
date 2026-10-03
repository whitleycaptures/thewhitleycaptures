import policy from '@/content/local/privacy.json';
import { getSiteSettings } from '@/content';
import { pageMetadata } from '@/lib/seo';
export async function generateMetadata() {
  const settings = await getSiteSettings();
  return pageMetadata(
    {
      ...settings.seo,
      title: 'Privacy policy',
      description:
        'How The Whitley Captures handles your personal information.',
    },
    '/privacy-policy',
    settings.seo,
  );
}
export default function PrivacyPolicy() {
  return (
    <main id="main" className="section container privacy-page">
      <h1>Privacy policy</h1>
      {policy.blocks.map((b, i) =>
        b.kind === 'heading' ? (
          <h2 key={i}>{b.text}</h2>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
      <h2>Services used by this website</h2>
      <p>
        This website uses Cloudflare for hosting and delivery, Sanity for
        website content and photographs, and Session for the enquiry form.
        Information entered into the enquiry form is processed through Session
        so Rachel can respond.
      </p>
      <p>
        With your permission, we use Google Analytics to understand visits,
        popular pages and clicks towards making an enquiry. Analytics cookies
        are optional: no Google Analytics script loads until you select Accept.
        Choose No thanks to browse without analytics, or use Cookie preferences
        to withdraw permission and remove this site’s analytics cookies. We do
        not send enquiry contents, names or email addresses to Analytics.
        Website statistics are processed by Google and viewed by Rachel and her
        authorised website administrator. Enquiry clicks do not mean an enquiry
        or booking was completed. See{' '}
        <a href="https://policies.google.com/privacy">
          Google’s privacy policy
        </a>{' '}
        for information about Google’s processing.
      </p>
      <p>
        For privacy enquiries, contact{' '}
        <a href="mailto:thewhitleycaptures@gmail.com">
          thewhitleycaptures@gmail.com
        </a>
        .
      </p>
    </main>
  );
}
