import {Link} from 'react-router';
import {ScrollReveal} from '~/components/ScrollReveal';

const MARQUEE_TEXT =
  'PRECISION CRAFTED  •  INTENTIONALLY DESIGNED  •  BUILT TO ENDURE  •  WEAR YOUR VISION  •  WHERE AMBITION MEETS EXECUTION  •  EST. 2024  •  '.repeat(
    4,
  );

function MarqueeBand() {
  return (
    <section className="bg-charcoal overflow-hidden py-5 border-y border-charcoal">
      <div className="animate-marquee whitespace-nowrap flex-shrink-0">
        <span className="text-bone/60 text-[11px] uppercase tracking-[0.3em] font-medium">
          {MARQUEE_TEXT}
        </span>
        <span className="text-bone/60 text-[11px] uppercase tracking-[0.3em] font-medium">
          {MARQUEE_TEXT}
        </span>
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="bg-gradient-to-br from-forest via-tobacco to-charcoal/90 relative overflow-hidden grain dark-accent-border py-28 md:py-40 px-4">
      <ScrollReveal className="max-w-2xl mx-auto text-center relative z-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-sand/60 mb-6">
          Our Philosophy
        </p>
        <h2 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-bone mb-8">
          Crafted for the Modern Urbanite
        </h2>
        <div className="divider-lux mx-auto mb-10" />
        <p className="text-bone/80 leading-relaxed text-lg">
          Every{' '}
          <span style={{letterSpacing: '0.2em'}}>
            V<span className="trigram">☰</span>RTEX
          </span>{' '}
          piece begins with intention. We source premium fabrics and work with
          skilled artisans to create streetwear that stands the test of time —
          both in durability and design. Our collections are rooted in the
          belief that contemporary style should be accessible, sustainable, and
          unapologetically bold.
        </p>
        <p className="text-bone/50 leading-relaxed mt-6">
          From the cut of each silhouette to the weight of every fabric, we
          obsess over the details so you don&apos;t have to. This is streetwear
          engineered for real life.
        </p>
        <div className="mt-12">
          <Link
            to="/collections/all"
            className="inline-block border border-sand/30 text-sand px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-sand hover:text-charcoal transition-all duration-500"
          >
            Discover More
          </Link>
        </div>
      </ScrollReveal>
    </section>
  );
}

/**
 * Below-the-fold homepage sections: Brand Story and Marquee.
 * Lazy-loaded to reduce initial JS and improve FCP/LCP.
 */
export default function HomeBelowFold() {
  return (
    <>
      <BrandStory />
      <MarqueeBand />
    </>
  );
}
