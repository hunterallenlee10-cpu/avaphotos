import { getImageProps } from "next/image";
import { preload } from "react-dom";
import type { CSSProperties } from "react";
import { makeLoader } from "@/lib/image";
import type { Photo as PhotoT } from "@/lib/photos";

type Props = {
  photo: PhotoT;
  sizes: string;
  /** Fill the parent (parent must be positioned) and crop with the photo's focal point. */
  fill?: boolean;
  /** Only for the single LCP image on a page (adds a preload). */
  priority?: boolean;
  /** Above-the-fold image that isn't worth a preload: load now, high priority. */
  eager?: boolean;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  alt?: string;
  /** Decorative duplicates (e.g. the cursor preview) pass "" + aria-hidden. */
  ariaHidden?: boolean;
};

/**
 * Serves the pre-generated AVIF variants with WebP fallback through a
 * <picture>, built from next/image's getImageProps so srcset/sizes/lazy
 * loading follow Next's rules. The wrapper paints the dominant colour plus a
 * tiny blurred preview until the full image has decoded.
 *
 * No "use client": it renders on the server for static pages (no hydration
 * cost, no props serialised into the RSC payload) and inside client
 * components where needed. Fade-in for late images is handled globally by
 * <ImageFader/>.
 */
export function Photo({ photo, sizes, fill, priority, eager, className = "", imgClassName = "", style, alt, ariaHidden }: Props) {
  const common = {
    src: photo.src,
    alt: alt ?? photo.alt,
    sizes,
    ...(fill ? { fill: true as const } : { width: photo.width, height: photo.height }),
    ...(priority || eager ? { loading: "eager" as const, fetchPriority: "high" as const } : { loading: "lazy" as const }),
  };
  const avif = getImageProps({ ...common, loader: makeLoader("avif", photo.widths) }).props;
  const { props: img } = getImageProps({ ...common, loader: makeLoader("webp", photo.widths) });

  if (priority) {
    preload(img.src, {
      as: "image",
      type: "image/avif",
      imageSrcSet: avif.srcSet,
      imageSizes: sizes,
      fetchPriority: "high",
    });
  }


  const wrapperStyle: CSSProperties = {
    backgroundColor: photo.dominant,
    backgroundImage: `url(${photo.blur})`,
    backgroundSize: "cover",
    backgroundPosition: photo.focus,
    ...(fill ? {} : { aspectRatio: `${photo.width} / ${photo.height}` }),
    ...style,
  };

  return (
    <div
      className={`photo ${fill ? "absolute inset-0" : "relative"} overflow-hidden ${className}`}
      style={wrapperStyle}
      aria-hidden={ariaHidden || undefined}
    >
      <picture>
        <source type="image/avif" srcSet={avif.srcSet} sizes={sizes} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
        <img
          {...img}
          className={`photo-img h-full w-full object-cover ${imgClassName}`}
          data-fade={priority || eager ? undefined : ""}
          style={{ ...img.style, objectPosition: photo.focus }}
        />
      </picture>
    </div>
  );
}
