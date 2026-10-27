import { ArrowIcon } from '@/components/ArrowIcon';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getSiteSettings, getServices } from '@/content';
import { guideSlugsForService } from '@/content/navigation';
import { Gallery } from '@/components/Gallery';
import { pageMetadata, isProduction } from '@/lib/seo';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const a = await getArticleBySlug((await params).slug);
  return a
    ? pageMetadata(a.seo, `/post/${a.slug}`, (await getSiteSettings()).seo)
    : { title: 'Page not found' };
}
export default async function ArticlePage({ params }: Props) {
  const a = await getArticleBySlug((await params).slug);
  if (!a) notFound();
  const relatedServices =
    a.kind === 'guide'
      ? (await getServices()).filter((service) =>
          guideSlugsForService(service.slug).includes(a.slug),
        )
      : [];
  return (
    <main id="main" className="section container article-page">
      <Link
        className="breadcrumb"
        href={a.kind === 'awards' ? '/' : '/client-guides'}
      >
        <ArrowIcon direction="left" />{' '}
        {a.kind === 'awards' ? 'Home' : 'Client guides'}
      </Link>
      <header className="article-heading">
        <p className="eyebrow">
          {a.kind === 'awards' ? 'A LITTLE RECOGNITION' : 'FOR MY CLIENTS'}
        </p>
        <h1>{a.title}</h1>
        <p className="page-lead">{a.summary}</p>
      </header>
      {!isProduction && a.reviewNote && (
        <aside className="review-note">Rachel’s review: {a.reviewNote}</aside>
      )}
      <div className="article-body">
        {a.blocks.map((b) => {
          const content = b.spans?.map((s, i) =>
            s.href ? (
              <a key={i} href={s.href}>
                {s.text}
              </a>
            ) : (
              s.text
            ),
          );
          return b.kind === 'gallery' ? (
            <Gallery
              key={b.id}
              gallery={{
                id: b.id,
                title: a.title,
                images: b.images || [],
                featuredImageIds: [],
              }}
            />
          ) : b.kind === 'heading' ? (
            <h2 key={b.id}>{content}</h2>
          ) : (
            <p key={b.id}>{content}</p>
          );
        })}
      </div>
      {relatedServices.length > 0 && (
        <nav
          className="article-end"
          aria-label="Photography sessions related to this guide"
        >
          <h2>Find your photo shoot</h2>
          <ul>
            {relatedServices.map((service) => (
              <li key={service.id}>
                <Link href={`/prices/${service.slug}`}>
                  {service.title} photography
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="article-end">
        <h2>Can I help with anything?</h2>
        <Link className="button" href="/#enquire">
          Get in touch <ArrowIcon direction="up-right" />
        </Link>
      </div>
    </main>
  );
}
