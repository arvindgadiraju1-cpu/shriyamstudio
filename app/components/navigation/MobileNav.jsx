import {useState} from 'react';
import {NavLink} from 'react-router';
import {useAside} from '~/components/Aside';
import {navigation} from '~/lib/storeConfig';

/**
 * MobileNav — slide-over menu with expandable subcategory sections.
 * Tapping a parent label expands/collapses its children inline.
 * Tapping a link closes the drawer.
 */
export function MobileNav() {
  const {close} = useAside();
  const [expanded, setExpanded] = useState(null); // stores the expanded nav item label

  function toggle(label) {
    setExpanded((prev) => (prev === label ? null : label));
  }

  return (
    <nav className="mobile-nav" aria-label="Mobile">
      <NavLink to="/" end prefetch="intent" onClick={close} className="mobile-nav__link">
        Home
      </NavLink>

      {navigation.map((item) => {
        const hasChildren = item.columns?.length > 0;
        const isOpen = expanded === item.label;

        if (!hasChildren) {
          return (
            <NavLink
              key={item.label}
              to={item.href}
              prefetch="intent"
              onClick={close}
              className="mobile-nav__link"
            >
              {item.label}
            </NavLink>
          );
        }

        // Collect all sub-links from columns
        const sublinks = item.columns.flatMap((col) => col.links);

        return (
          <div key={item.label} className="mobile-nav__group">
            {/* Parent row: label (navigate) + chevron (expand) */}
            <div className="mobile-nav__group-row">
              <NavLink
                to={item.href}
                prefetch="intent"
                onClick={close}
                className="mobile-nav__link mobile-nav__link--parent"
              >
                {item.label}
              </NavLink>
              <button
                className={`mobile-nav__chevron${isOpen ? ' mobile-nav__chevron--open' : ''}`}
                aria-label={isOpen ? `Collapse ${item.label}` : `Expand ${item.label}`}
                aria-expanded={isOpen}
                onClick={() => toggle(item.label)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Subcategory links, collapsible */}
            {isOpen ? (
              <div className="mobile-nav__subcategories">
                {sublinks.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    prefetch="intent"
                    onClick={close}
                    className="mobile-nav__sublink"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}

      <NavLink to="/collections" prefetch="intent" onClick={close} className="mobile-nav__link">
        All Collections
      </NavLink>

      <div className="mobile-nav__footer">
        <div className="mobile-nav__meta">
          <NavLink to="/account" prefetch="intent" onClick={close}>
            Account
          </NavLink>
          <span aria-label="Currency">INR ₹</span>
        </div>
      </div>
    </nav>
  );
}
