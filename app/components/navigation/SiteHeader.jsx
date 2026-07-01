import {Suspense} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from '~/components/Aside';
import {useScrolled} from '~/hooks/useScrolled';
import {navigation, announcement, brand} from '~/lib/storeConfig';
import {SearchIcon, AccountIcon, BagIcon, MenuIcon} from '~/components/ui/Icon';

/**
 * SiteHeader — the fixed chrome: announcement bar + header. Transparent over the
 * homepage hero, solidifying on scroll (see `.chrome[data-*]` in app.css).
 * Navigation is curated in lib/storeConfig.js (BUSINESS CONFIG).
 *
 * @param {{
 *   header: import('storefrontapi.generated').HeaderQuery,
 *   cart: Promise<import('storefrontapi.generated').CartApiQueryFragment | null>,
 *   isLoggedIn: Promise<boolean>,
 * }} props
 */
export function SiteHeader({header, cart, isLoggedIn}) {
  const {pathname} = useLocation();
  const scrolled = useScrolled(24);
  const isHero = pathname === '/'; // hero pages get the transparent treatment
  const brandName = brand.name || header?.shop?.name || 'Shriyam';

  return (
    <div
      className="chrome"
      data-transparent={isHero ? 'true' : 'false'}
      data-scrolled={scrolled ? 'true' : 'false'}
      style={!announcement ? {'--announcement-height': '0px'} : undefined}
    >
      {announcement && <p className="announcement">{announcement}</p>}

      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__left">
            <MenuToggle />
            <DesktopNav />
          </div>

          <NavLink to="/" end prefetch="intent" className="site-brand">
            {brandName}
          </NavLink>

          <HeaderActions isLoggedIn={isLoggedIn} cart={cart} />
        </div>
      </header>
    </div>
  );
}

function DesktopNav() {
  return (
    <nav className="site-nav" aria-label="Primary">
      <ul className="site-nav__list">
        {navigation.map((item) => (
          <li className="site-nav__item" key={item.label}>
            <NavLink
              to={item.href}
              prefetch="intent"
              className="site-nav__link"
            >
              {item.label}
            </NavLink>
            {item.columns ? <NavPanel item={item} /> : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Editorial mega-menu panel. Opens on hover/focus-within (CSS), keyboard-safe. */
function NavPanel({item}) {
  return (
    <div className="nav-panel">
      {item.columns.map((col) => (
        <div className="nav-panel__col" key={col.heading}>
          <p className="nav-panel__heading">{col.heading}</p>
          {col.links.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              prefetch="intent"
              className="nav-panel__link"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ))}

      {item.feature ? (
        <Link
          to={item.feature.href}
          prefetch="intent"
          className="nav-panel__feature"
        >
          <span className="nav-panel__feature-eyebrow">
            {item.feature.eyebrow}
          </span>
          <span className="nav-panel__feature-title">{item.feature.title}</span>
          <span className="nav-panel__feature-cta">Discover →</span>
        </Link>
      ) : null}
    </div>
  );
}

function MenuToggle() {
  const {open} = useAside();
  return (
    <button
      className="icon-btn menu-toggle"
      aria-label="Open menu"
      onClick={() => open('mobile')}
    >
      <MenuIcon />
    </button>
  );
}

/**
 * @param {{
 *   isLoggedIn: Promise<boolean>,
 *   cart: Promise<import('storefrontapi.generated').CartApiQueryFragment | null>,
 * }} props
 */
function HeaderActions({isLoggedIn, cart}) {
  const {open} = useAside();
  return (
    <div className="site-actions">
      <button
        className="icon-btn"
        aria-label="Search"
        onClick={() => open('search')}
      >
        <SearchIcon />
      </button>

      <NavLink
        to="/account"
        prefetch="intent"
        className="icon-btn account-link"
        aria-label="Account"
      >
        <Suspense fallback={<AccountIcon />}>
          <Await resolve={isLoggedIn} errorElement={<AccountIcon />}>
            {() => <AccountIcon />}
          </Await>
        </Suspense>
      </NavLink>

      <CartToggle cart={cart} />
    </div>
  );
}

/** @param {{cart: Promise<import('storefrontapi.generated').CartApiQueryFragment | null>}} props */
function CartToggle({cart}) {
  return (
    <Suspense fallback={<CartButton count={0} />}>
      <Await resolve={cart}>
        <CartButtonResolved />
      </Await>
    </Suspense>
  );
}

function CartButtonResolved() {
  const originalCart = useAsyncValue();
  const cart = useOptimisticCart(originalCart);
  return <CartButton count={cart?.totalQuantity ?? 0} />;
}

/** @param {{count: number}} props */
function CartButton({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <button
      className="icon-btn"
      aria-label={`Cart, ${count} items`}
      onClick={() => {
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: typeof window !== 'undefined' ? window.location.href : '',
        });
      }}
    >
      <BagIcon />
      {count > 0 ? <span className="cart-count">{count}</span> : null}
    </button>
  );
}
