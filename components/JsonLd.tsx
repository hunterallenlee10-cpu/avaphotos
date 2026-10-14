import { BRAND, SEO, SITE_URL } from "@/content/site";
import { featured } from "@/lib/photos";

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const hasArea = !BRAND.serviceArea.startsWith("[[");

export const personLd = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#ava`,
  name: BRAND.person,
  jobTitle: "Sports & Portrait Photographer",
  url: SITE_URL,
  email: `mailto:${BRAND.email}`,
  sameAs: [BRAND.instagram.url],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Stevenson University" },
  knowsAbout: ["Sports photography", "Lacrosse", "Portrait photography", "Athletic training"],
});

export const businessLd = () => ({
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  "@id": `${SITE_URL}/#business`,
  name: BRAND.name,
  description: SEO.description,
  url: SITE_URL,
  email: BRAND.email,
  image: featured.slice(0, 3).map((p) => `${SITE_URL}${p.src}-1600.webp`),
  founder: { "@id": `${SITE_URL}/#ava` },
  sameAs: [BRAND.instagram.url],
  ...(hasArea ? { areaServed: BRAND.serviceArea } : {}),
  makesOffer: [
    "Game Day Coverage",
    "Team & Media Day",
    "Athlete Individual Shoots",
    "Senior & Graduation Portraits",
  ].map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
});
