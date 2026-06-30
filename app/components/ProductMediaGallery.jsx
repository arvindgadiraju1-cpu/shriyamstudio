import {useState, useEffect} from 'react';
import {Image} from '@shopify/hydrogen';

/**
 * ProductMediaGallery — full image + video gallery for product detail pages.
 * - Main display fills the left column, thumbnails strip below.
 * - Videos autoplay muted on loop; switches automatically when thumbnail clicked.
 * - Syncs to the selected variant's image when the variant selector changes.
 */
export function ProductMediaGallery({media = [], selectedImage}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Sync to variant image when variant changes
  useEffect(() => {
    if (!selectedImage) return;
    const idx = media.findIndex(
      (m) =>
        m.__typename === 'MediaImage' &&
        m.image?.url &&
        selectedImage.url &&
        m.image.url.split('?')[0] === selectedImage.url.split('?')[0],
    );
    if (idx !== -1) setActiveIndex(idx);
  }, [selectedImage, media]);

  if (!media.length) {
    return <div className="product-gallery product-gallery--empty" />;
  }

  const active = media[activeIndex];

  return (
    <div className="product-gallery">
      {/* ── Main display ── */}
      <div className="product-gallery__main">
        <MediaMain key={activeIndex} node={active} />
      </div>

      {/* ── Thumbnail strip ── */}
      {media.length > 1 && (
        <div className="product-gallery__thumbs" role="list" aria-label="Product media">
          {media.map((node, i) => (
            <button
              key={i}
              role="listitem"
              aria-label={`${node.__typename === 'Video' ? 'Video' : 'Image'} ${i + 1}`}
              aria-current={i === activeIndex}
              className={`product-gallery__thumb${i === activeIndex ? ' product-gallery__thumb--active' : ''}`}
              onClick={() => setActiveIndex(i)}
            >
              <ThumbContent node={node} />
              {node.__typename === 'Video' && (
                <span className="product-gallery__play-badge" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="14" fill="rgba(20,58,52,0.78)" />
                    <polygon points="11,9 21,14 11,19" fill="#FAF8F5" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Main area — renders Image or Video based on media type. */
function MediaMain({node}) {
  if (!node) return null;

  if (node.__typename === 'Video') {
    const sources = node.sources ?? [];

    // Pick 480p MP4 for fastest start; fall back to any MP4
    const mp4 =
      sources.find((s) => s.mimeType === 'video/mp4' && s.url?.includes('480p')) ||
      sources.find((s) => s.mimeType === 'video/mp4') ||
      sources.find((s) => s.format === 'mp4') ||
      null;

    const poster = node.previewImage?.url ?? undefined;

    if (!mp4) return null;

    return (
      <div className="product-gallery__video-wrap">
        {/*
          Use `src` directly (not <source> children) — browsers honour `autoPlay`
          more reliably when src is an attribute rather than a child element.
          `key` forces a full DOM remount whenever the URL changes.
        */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          key={mp4.url}
          src={mp4.url}
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          onCanPlay={(e) => e.currentTarget.play().catch(() => {})}
          className="product-gallery__video"
        />
      </div>
    );
  }

  if (node.__typename === 'MediaImage' && node.image) {
    return (
      <Image
        data={node.image}
        aspectRatio="4/5"
        sizes="(min-width: 64em) 55vw, 100vw"
        loading="eager"
        alt={node.image.altText || ''}
        className="product-gallery__img"
      />
    );
  }

  return null;
}

/** Thumbnail content — preview image for videos, product image for MediaImage. */
function ThumbContent({node}) {
  if (node.__typename === 'Video') {
    const poster =
      node.previewImage?.url || node.preview?.image?.url;
    return poster ? (
      <img src={poster} alt="" width={72} height={72} loading="lazy" />
    ) : (
      <div className="product-gallery__thumb-placeholder" />
    );
  }
  if (node.__typename === 'MediaImage' && node.image) {
    return (
      <Image
        data={node.image}
        aspectRatio="1/1"
        sizes="72px"
        loading="lazy"
        alt={node.image.altText || ''}
      />
    );
  }
  return null;
}
