import {NavLink} from 'react-router';
import {useAside} from '~/components/Aside';
import {navigation} from '~/lib/storeConfig';

/**
 * MobileNav — the luxury slide-over menu (rendered inside the mobile Aside).
 * Large serif links, thumb-friendly rows, account + collections entry points.
 * Tapping any link closes the slide-over.
 */
export function MobileNav() {
  const {close} = useAside();

  return (
    <nav className="mobile-nav" aria-label="Mobile">
      <NavLink to="/" end prefetch="intent" onClick={close} className="mobile-nav__link">
        Home
      </NavLink>

      {navigation.map((item) => (
        <NavLink
          key={item.label}
          to={item.href}
          prefetch="intent"
          onClick={close}
          className="mobile-nav__link"
        >
          {item.label}
        </NavLink>
      ))}

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
