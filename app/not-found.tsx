import type { Metadata } from "next";
import Link from "next/link";
import { NOT_FOUND } from "@/content/site";

export const metadata: Metadata = {
  title: "Out of bounds",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-(--gutter) pb-16 pt-28">
      {/* sideline markings */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-y-0 left-[12%] w-px bg-line" />
        <div className="absolute inset-y-0 right-[12%] w-px border-l border-dashed border-paper/25" />
        <p className="label absolute right-[12%] top-1/3 origin-bottom-left translate-x-3 rotate-90 text-mute">End line</p>
      </div>
      <p className="scoreboard scoreboard-dots text-[clamp(8rem,34vw,30rem)] leading-[0.8]" aria-hidden="true">
        {NOT_FOUND.code}
      </p>
      <h1 className="display mt-6 text-[clamp(3.4rem,10vw,9rem)]">{NOT_FOUND.title}</h1>
      <p className="serif mt-4 max-w-[30ch] text-[clamp(1.4rem,2.4vw,2.2rem)] leading-[1.1]">{NOT_FOUND.body}</p>
      <div className="mt-10">
        <Link href="/" className="group inline-flex min-h-14 items-center gap-3 bg-amber px-6 font-semibold text-ink transition-colors duration-500 hover:bg-paper">
          {NOT_FOUND.cta}
          <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
}
