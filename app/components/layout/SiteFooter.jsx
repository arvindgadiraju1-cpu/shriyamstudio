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
          <a
            className="site-footer__credit"
            href="https://wa.me/917997083849"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message Arvind on WhatsApp for website development help"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.5.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.3-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 3.9 3.5.5.2 1 .4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
              <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.3C8.6 21.5 10.3 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3C4 14.9 3.6 13.5 3.6 12c0-4.6 3.8-8.4 8.4-8.4s8.4 3.8 8.4 8.4-3.8 8.2-8.4 8.2Z" />
            </svg>
            <span>Need a website like this? Contact Arvind</span>
          </a>
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
