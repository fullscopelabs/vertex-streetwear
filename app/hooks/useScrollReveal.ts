import {startTransition, useEffect, useRef, useState} from 'react';

/**
 * IntersectionObserver hook for scroll-triggered reveal animations.
 * Returns a ref to attach to the element and a boolean for visibility.
 * Once visible, the element stays visible (no re-hiding on scroll out).
 * Uses startTransition so visibility updates do not interrupt Suspense hydration (React #421).
 */
export function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTransition(() => setIsVisible(true));
          observer.unobserve(el);
        }
      },
      {threshold: 0.12, ...options},
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return {ref, isVisible};
}
