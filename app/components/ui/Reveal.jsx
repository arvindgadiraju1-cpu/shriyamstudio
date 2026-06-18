import {useReveal} from '~/hooks/useReveal';

/**
 * Reveal — wraps children in a scroll-triggered entrance (fade / up / rise),
 * defined entirely by the `[data-reveal]` rules in app.css. Reduced-motion is
 * respected automatically.
 *
 * The only inline style is `--reveal-delay`, a *data* value (per-item stagger),
 * not a design decision — the duration/easing/distance all live in the design
 * system. Pass `delay` (ms) to stagger items in a group.
 *
 * @param {{
 *   as?: import('react').ElementType,
 *   variant?: 'up' | 'fade' | 'rise',
 *   delay?: number,
 *   className?: string,
 *   children?: import('react').ReactNode,
 * } & Record<string, any>} props
 */
export function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className,
  children,
  ...props
}) {
  const {ref, revealed} = useReveal();

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={variant}
      data-revealed={revealed ? 'true' : 'false'}
      style={delay ? {'--reveal-delay': `${delay}ms`} : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}
