import {Link} from 'react-router';

/**
 * CollectionVideoStrip — editorial video/image cards that redirect to collections.
 * Shown on the homepage. Cards auto-play silently; clicking navigates to the collection.
 *
 * Each entry in `items` is:
 *   { handle, title, eyebrow, href, video?: { sources, previewImage }, image?: { url, altText } }
 */
export function CollectionVideoStrip({items = []}) {
  if (!items.length) return null;

  return (
    <section className="video-strip" aria-label="Collections in motion">
      <div className="video-strip__inner">
        <div className="video-strip__header">
          <span className="video-strip__eyebrow">The collection in motion</span>
          <h2 className="video-strip__title">See it worn</h2>
        </div>

        <div className="video-strip__grid">
          {items.map((item) => (
            <Link
              key={item.handle}
              to={item.href || `/collections/${item.handle}`}
              prefetch="intent"
              className="video-strip__card"
              aria-label={`Explore ${item.title}`}
            >
              <span className="video-strip__media">
                {item.video ? (
                  /* eslint-disable-next-line jsx-a11y/media-has-caption */
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={item.video.previewImage?.url}
                    className="video-strip__video"
                  >
                    {item.video.sources?.map((s) => (
                      <source key={s.url} src={s.url} type={s.mimeType} />
                    ))}
                  </video>
                ) : item.image ? (
                  <img
                    src={item.image.url}
                    alt={item.image.altText || item.title}
                    className="video-strip__img"
                    loading="lazy"
                    width={600}
                    height={750}
                  />
                ) : (
                  <div className="video-strip__placeholder" />
                )}
                {/* gradient scrim */}
                <span className="video-strip__scrim" aria-hidden="true" />
              </span>

              <span className="video-strip__caption">
                {item.eyebrow ? (
                  <span className="video-strip__caption-eyebrow">{item.eyebrow}</span>
                ) : null}
                <span className="video-strip__caption-title">{item.title}</span>
                <span className="video-strip__cta">
                  Explore <span aria-hidden="true">→</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
