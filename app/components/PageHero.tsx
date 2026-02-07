import {ScrollReveal} from '~/components/ScrollReveal';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  /** Render children below the title/subtitle (e.g. search input, product count) */
  children?: React.ReactNode;
}

/**
 * Shared dark hero band for interior pages.
 * Provides visual consistency with the homepage's editorial dark sections —
 * gradient background, film grain texture, centered serif title with
 * rust divider accent.
 */
export function PageHero({title, subtitle, children}: PageHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-charcoal via-charcoal to-forest overflow-hidden grain">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 text-center">
        <ScrollReveal>
          {subtitle && (
            <p className="text-[10px] tracking-[0.35em] uppercase text-bone/40 mb-4">
              {subtitle}
            </p>
          )}
          <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-bone">
            {title}
          </h1>
          <div className="w-12 h-px bg-rust mx-auto mt-6" />
          {children && <div className="mt-6">{children}</div>}
        </ScrollReveal>
      </div>
    </section>
  );
}
