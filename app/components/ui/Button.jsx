import {Link} from 'react-router';

/**
 * Button — the one button primitive. Renders an internal <Link>, an external
 * <a>, or a <button> based on props. Variants map to the `.btn--*` classes.
 *
 * @param {{
 *   variant?: 'primary' | 'ghost' | 'on-dark',
 *   to?: string,          // internal route → react-router Link
 *   href?: string,        // external link → <a>
 *   className?: string,
 *   children?: import('react').ReactNode,
 * } & Record<string, any>} props
 */
export function Button({variant = 'primary', to, href, className, children, ...props}) {
  const classes = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} prefetch="intent" {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
