import {useState} from 'react';
import {Link} from 'react-router';
import {brand, footerColumns} from '~/lib/storeConfig';

/**
 * SiteFooter — premium footer: brand + newsletter on the left, curated link
 * columns on the right, a quiet legal bar beneath. Content is curated in
 * lib/storeConfig.js (BUSINESS CONFIG).
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <h2>{brand.name}</h2>
          <p>{brand.tagline}</p>
          <Newsletter />
        </div>

        <div className="site-footer__cols">
          {footerColumns.map((col) => (
            <div className="site-footer__col" key={col.heading}>
              <h3>{col.heading}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.href} prefetch="intent">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="site-footer__bottom-inner">
          <span>
            © {year} {brand.name}. All rights reserved.
          </span>
          <span>Made to order · Crafted in India</span>
        </div>
      </div>
    </footer>
  );
}

/**
 * Newsletter — controlled form with a graceful client-side confirmation.
 * BUSINESS CONFIG / TODO: wire `onSubmit` to your ESP (Klaviyo) or the Shopify
 * customer API. Until then it confirms locally so the footer stays premium.
 */
function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      className="newsletter"
      onSubmit={(event) => {
        event.preventDefault();
        if (email.trim()) setSubmitted(true);
      }}
    >
      <label htmlFor="newsletter-email">Join the list</label>

      {submitted ? (
        <p className="newsletter__note">
          Thank you — we’ll share new arrivals and atelier notes with you.
        </p>
      ) : (
        <>
          <div className="newsletter__field">
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit">Subscribe</button>
          </div>
          <p className="newsletter__note">
            First access to new arrivals and the wedding edit.
          </p>
        </>
      )}
    </form>
  );
}
