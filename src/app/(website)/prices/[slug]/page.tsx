import { ArrowIcon } from '@/components/ArrowIcon';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getServiceBySlug,
  getHomepage,
  getSiteSettings,
  getArticles,
} from '@/content';
import { guideSlugsForService } from '@/content/navigation';
import { ArticleCards } from '@/components/ArticleCards';
import { Photo } from '@/components/Photo';
import { Gallery } from '@/components/Gallery';
import { Testimonials, FinalCta } from '@/components/Sections';
import { pageMetadata, jsonLd, siteUrl, isProduction } from '@/lib/seo';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  return service
    ? pageMetadata(
        service.seo,
        `/prices/${service.slug}`,
        (await getSiteSettings()).seo,
      )
    : { title: 'Page not found' };
}
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();
  const [home, settings] = await Promise.all([
    getHomepage(),
    getSiteSettings(),
  ]);
  const guides = (await getArticles()).filter((a) =>
    guideSlugsForService(slug).includes(a.slug),
  );
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.title,
            description: service.introduction,
            url: new URL(`/prices/${service.slug}`, siteUrl).href,
            provider: {
              '@type': 'ProfessionalService',
              '@id': new URL('/#business', siteUrl).href,
              name: settings.name,
            },
            areaServed: settings.areaServed,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteUrl.href,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: service.title,
                item: new URL(`/prices/${service.slug}`, siteUrl).href,
              },
            ],
          }),
        }}
      />
      <section className="service-hero">
        <div className="service-hero-copy">
          <Link href="/#photography" className="breadcrumb">
            <ArrowIcon direction="left" /> All photography
          </Link>
          <p className="eyebrow">YOUR STORY, THROUGH MY LENS</p>
          <h1>{service.title}</h1>
          <p className="service-tagline">{service.description}</p>
          {service.introduction.split(/\n\n/).map((paragraph, n) => (
            <p key={n}>{paragraph}</p>
          ))}
          {service.sections
            .flatMap((section) => section.paragraphs)
            .map((paragraph, n) => (
              <p key={n}>{paragraph}</p>
            ))}
          <nav
            className="service-shortcuts"
            aria-label="Explore this photo shoot"
          >
            <Link href="#prices">
              View prices <ArrowIcon direction="down" />
            </Link>
            <Link href="#gallery">
              View portfolio <ArrowIcon direction="up-right" />
            </Link>
          </nav>
          <Link className="button" href={service.cta.href}>
            {service.cta.label}
            <span aria-hidden="true">
              <ArrowIcon direction="up-right" />
            </span>
          </Link>
        </div>
        <div className="service-hero-photo">
          <Photo
            image={service.hero}
            priority
            sizes="(max-width: 700px) 100vw, 55vw"
          />
        </div>
      </section>
      {service.reviewNote && !isProduction && (
        <aside className="review-note container">{service.reviewNote}</aside>
      )}
      {service.packages.length > 0 && (
        <section id="prices" className="packages-section section">
          <div className="container">
            <div className="center-heading">
              <p className="eyebrow">YOUR PHOTO SHOOT</p>
              <h2>Prices &amp; packages</h2>
              <p>Choose the photo shoot that suits you.</p>
            </div>
            {!isProduction && service.pricingNote && (
              <p className="review-note">{service.pricingNote}</p>
            )}
            <div className="packages">
              {service.packages.map((p, index) => (
                <article key={p.id}>
                  <p className="eyebrow">
                    0{index + 1}
                    {p.duration ? ` / ${p.duration}` : ''}
                  </p>
                  <h3>{p.title}</h3>
                  <p className="package-price">£{p.price}</p>
                  <ul>
                    {p.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {p.note && <p className="package-note">{p.note}</p>}
                  <Link className="text-link" href="/#enquire">
                    Enquire about {p.title}
                    <span aria-hidden="true">
                      <ArrowIcon direction="up-right" />
                    </span>
                  </Link>
                </article>
              ))}
            </div>
            <div className="package-extras">
              {service.included.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}
      {service.packages.length === 0 && (
        <section id="prices" className="packages-section section">
          <div className="container">
            <h2>Prices &amp; packages</h2>
            <p>
              Please get in touch for current prices and a photo shoot tailored
              to you.
            </p>
            <Link className="button" href="/#enquire">
              Ask about prices <ArrowIcon direction="up-right" />
            </Link>
          </div>
        </section>
      )}
      {service.gallery?.images.length > 0 && (
        <section id="gallery" className="section container service-gallery">
          <div className="section-heading">
            <div>
              <h2>{service.gallery.title}</h2>
            </div>
            <span className="gallery-count">
              {String(service.gallery.images.length).padStart(2, '0')}{' '}
              PHOTOGRAPHS
            </span>
          </div>
          <Gallery
            key={service.slug}
            gallery={service.gallery}
            initialLimit={6}
          />
        </section>
      )}
      {guides.length > 0 && (
        <section className="section container">
          <p className="eyebrow">BEFORE & AFTER YOUR PHOTO SHOOT</p>
          <h2>A little useful reading.</h2>
          <ArticleCards articles={guides} />
        </section>
      )}
      {service.faqs.length > 0 && (
        <section className="faq-section section container">
          <div>
            <p className="eyebrow">BEFORE YOUR VISIT</p>
            <h2>A few little questions.</h2>
          </div>
          <div>
            {service.faqs.map((f) => (
              <details key={f.id}>
                <summary>
                  {f.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      <Testimonials
        items={service.testimonials}
        heading="Lovely words, lasting memories."
      />
      <FinalCta content={home.cta} />
    </main>
  );
}
