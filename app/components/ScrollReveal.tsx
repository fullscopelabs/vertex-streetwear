import {useMemo} from 'react';
import {useScrollReveal} from '~/hooks/useScrollReveal';

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Delay in ms before animation starts (for staggered grids) */
  delay?: number;
  /** Additional CSS classes */
  className?: string;
  /** HTML tag to render */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Wrapper component that reveals children with a fade-up animation
 * when they enter the viewport. Supports stagger delays.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: ScrollRevealProps) {
  const {ref, isVisible} = useScrollReveal();

  const style = useMemo(
    () => ({
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      willChange: isVisible ? 'auto' : ('opacity, transform' as const),
    }),
    [isVisible, delay],
  );

  return (
    // @ts-expect-error -- dynamic tag with ref
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
