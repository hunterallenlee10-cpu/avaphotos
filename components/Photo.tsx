"use client";

import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { makeLoader } from "@/lib/image";
import type { Photo as PhotoT } from "@/lib/photos";

type Props = {
  photo: PhotoT;
  sizes: string;
  /** Fill the parent (parent must be positioned) and crop with the photo's focal point. */
  fill?: boolean;
  /** Only for the single LCP image on a page. */
  priority?: boolean;
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
 */
export function Photo({ photo, sizes, fill, priority, className = "", imgClassName = "", style, alt, ariaHidden }: Props) {
  const common = {
    src: photo.src,
    alt: alt ?? photo.alt,
    sizes,
    ...(fill ? { fill: true as const } : { width: photo.width, height: photo.height }),
    ...(priority ? { loading: "eager" as const, fetchPriority: "high" as const } : { loading: "lazy" as const }),
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

  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // The image may finish before hydration, in which case onLoad never fires.
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);

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
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          {...img}
          ref={ref}
          onLoad={() => setLoaded(true)}
          data-loaded={loaded || undefined}
          className={`photo-img h-full w-full object-cover ${imgClassName}`}
          style={{ ...img.style, objectPosition: photo.focus }}
        />
      </picture>
    </div>
  );
}
