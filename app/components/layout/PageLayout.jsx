import {Suspense} from 'react';
import {Await, useLocation} from 'react-router';
import {Aside} from '~/components/Aside';
import {CartMain} from '~/components/CartMain';
import {SiteHeader} from '~/components/navigation/SiteHeader';
import {MobileNav} from '~/components/navigation/MobileNav';
import {SiteFooter} from '~/components/layout/SiteFooter';
import {SearchOverlay} from '~/components/layout/SearchOverlay';
import {announcement} from '~/lib/storeConfig';

/**
 * PageLayout — the app shell: cart + mobile asides, search overlay, fixed
 * header, the routed <main>, and the footer.
 *
 * Hero pages (the homepage) set `data-hero` on <main> so the hero slides under
 * the transparent chrome; all other pages pad to clear the fixed header.
 *
 * @param {{
 *   cart: Promise<import('storefrontapi.generated').CartApiQueryFragment | null>,
 *   children?: import('react').ReactNode,
 *   footer: Promise<import('storefrontapi.generated').FooterQuery | null>,
 *   header: import('storefrontapi.generated').HeaderQuery,
 *   isLoggedIn: Promise<boolean>,
 *   publicStoreDomain: string,
 * }} props
 */
export function PageLayout({cart, children = null, header, isLoggedIn}) {
  const {pathname} = useLocation();
  const isHero = pathname === '/';

  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <MobileMenuAside />
      <SearchOverlay />

      {header && (
        <SiteHeader header={header} cart={cart} isLoggedIn={isLoggedIn} />
      )}

      {/* SiteHeader zeroes --announcement-height on the chrome when there's no
          announcement, but main is a sibling — it must zero it too, or every
          page reserves 40px of phantom space below the header. */}
      <main
        data-hero={isHero ? '' : undefined}
        style={!announcement ? {'--announcement-height': '0px'} : undefined}
      >
        {children}
      </main>

      <SiteFooter />
    </Aside.Provider>
  );
}

/** @param {{cart: PageLayout['cart']}} props */
function CartAside({cart}) {
  return (
    <Aside type="cart" heading="Cart">
      <Suspense fallback={<p>Loading cart…</p>}>
        <Await resolve={cart}>
          {(resolved) => <CartMain cart={resolved} layout="aside" />}
        </Await>
      </Suspense>
    </Aside>
  );
}

function MobileMenuAside() {
  return (
    <Aside type="mobile" heading="Menu">
      <MobileNav />
    </Aside>
  );
}
