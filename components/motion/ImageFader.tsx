"use client";

import { useEffect } from "react";

/**
 * One observer for every <Photo>: images that haven't finished loading when
 * they enter the DOM are hidden and faded in on load. Images that are already
 * decoded (including the LCP frame) are never touched, so first paint never
 * waits on JavaScript.
 */
export function ImageFader() {
  useEffect(() => {
    const arm = (img: HTMLImageElement) => {
      if (img.dataset.armed !== undefined) return;
      img.dataset.armed = "";
      if (img.complete) return;
      img.dataset.pending = "";
      const done = () => delete img.dataset.pending;
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    };
    const scan = (root: ParentNode) => root.querySelectorAll<HTMLImageElement>("img[data-fade]").forEach(arm);
    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records)
        r.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement && n.hasAttribute("data-fade")) arm(n);
          else if (n instanceof Element) scan(n);
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
  return null;
}
