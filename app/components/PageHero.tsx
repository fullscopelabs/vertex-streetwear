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
    <section className="relative bg-gradient-to-br from-charcoal via-tobacco to-forest overflow-hidden grain dark-accent-border">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 md:py-20 text-center">
        <ScrollReveal>
          {subtitle && (
            <p className="text-[10px] tracking-[0.35em] uppercase text-sand/50 mb-4">
              {subtitle}
            </p>
          )}
          <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-bone">
            {title}
          </h1>
          <div className="divider-lux mx-auto mt-6" />
          {children && <div className="mt-6">{children}</div>}
        </ScrollReveal>
      </div>
    </section>
  );
}
