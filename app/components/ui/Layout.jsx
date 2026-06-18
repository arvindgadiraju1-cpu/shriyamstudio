/**
 * Layout primitives — Container, Section, Eyebrow, SectionHeading.
 * Thin wrappers over the design-system classes in app.css so pages compose from
 * named building blocks instead of repeating class strings.
 */

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/**
 * Container — centered, max-width, gutter padding.
 * @param {{size?: 'default' | 'wide' | 'narrow', as?: import('react').ElementType, className?: string, children?: import('react').ReactNode} & Record<string, any>} props
 */
export function Container({size = 'default', as: Tag = 'div', className, children, ...props}) {
  const sizeClass =
    size === 'wide' ? 'container--wide' : size === 'narrow' ? 'container--narrow' : '';
  return (
    <Tag className={cx('container', sizeClass, className)} {...props}>
      {children}
    </Tag>
  );
}

/**
 * Section — vertical rhythm + optional tone (dark / soft) and width.
 * @param {{tone?: 'default' | 'dark' | 'soft', tight?: boolean, contained?: boolean, size?: 'default' | 'wide' | 'narrow', as?: import('react').ElementType, className?: string, children?: import('react').ReactNode} & Record<string, any>} props
 */
export function Section({
  tone = 'default',
  tight = false,
  contained = true,
  size = 'default',
  as: Tag = 'section',
  className,
  children,
  ...props
}) {
  const toneClass = tone === 'dark' ? 'section--dark' : tone === 'soft' ? 'section--soft' : '';
  return (
    <Tag className={cx('section', tight && 'section--tight', toneClass, className)} {...props}>
      {contained ? <Container size={size}>{children}</Container> : children}
    </Tag>
  );
}

/**
 * Eyebrow — the small-caps editorial label above headings.
 * @param {{as?: import('react').ElementType, className?: string, children?: import('react').ReactNode}} props
 */
export function Eyebrow({as: Tag = 'p', className, children}) {
  return <Tag className={cx('eyebrow', className)}>{children}</Tag>;
}

/**
 * SectionHeading — eyebrow + title (+ optional trailing link).
 * @param {{eyebrow?: string, title?: import('react').ReactNode, link?: {to: string, label: string}, children?: import('react').ReactNode}} props
 */
export function SectionHeading({eyebrow, title, link, children}) {
  return (
    <div className="section-heading">
      <div className="section-heading__titles">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        {title ? <h2>{title}</h2> : null}
        {children}
      </div>
      {link ? (
        <a className="section-heading__link" href={link.to}>
          {link.label}
        </a>
      ) : null}
    </div>
  );
}
