/**
 * Every word on the site lives here, so copy can change without touching
 * components. Strings wrapped in [[DOUBLE BRACKETS]] are placeholders that
 * must be confirmed with Ava before launch — see TODO.md.
 */

/** Working brand. Confirm the final name with Hunter/Ava before launch. */
export const BRAND = {
  name: "Ava Michelle Photography",
  person: "Ava Treakle",
  firstName: "Ava",
  lastName: "Treakle",
  email: "avamichellephotography10@gmail.com",
  instagram: { handle: "@avatreakle", url: "https://www.instagram.com/avatreakle/" },
  serviceArea: "[[SERVICE AREA]]",
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const NAV = [
  { href: "/work", label: "Work", n: "01" },
  { href: "/about", label: "About", n: "02" },
  { href: "/services", label: "Services", n: "03" },
  { href: "/contact", label: "Book", n: "04" },
] as const;

export const SEO = {
  title: "Ava Treakle — Sports & Portrait Photographer",
  description:
    "Ava Treakle is a sports and portrait photographer and former Stevenson University lacrosse player. Game day coverage, athlete shoots, team media days, and senior & graduation portraits.",
  keywords: [
    "sports photographer",
    "lacrosse photographer",
    "senior portraits",
    "graduation portraits",
    "athlete photography",
    "game day photography",
    "Stevenson University",
  ],
};

export const HOME = {
  /** Set under her name in the hero. */
  heroLine: "I’ve played under these lights. I know where the moment lands.",
  heroKicker: "Sports & portrait photographer",
  intro:
    "I shoot athletes the way athletes see the game: from the inside, a half-second early.",
  featuredTitle: "Selected frames",
  story: {
    eyebrow: "An athlete who shoots athletes",
    headline: ["I’ve worn", "the jersey."],
    paragraphs: [
      "I played women’s lacrosse at Stevenson, and I spent most of my free time on someone else’s sideline with a camera. Playing taught me what no lens manual can: where the ball is about to go, the beat before a celebration, the look a teammate gives when they know they just made the play.",
      "Now I’m in King’s athletic training program, which means I spend my days learning how athletes move. Watching bodies at full speed is, quite literally, my homework.",
      "So when I shoot your game, I’m not guessing. I’m reading it.",
    ],
    stats: [
      { value: "2021", label: "First season behind the camera" },
      { value: "Mustang", label: "Stevenson women’s lacrosse alum" },
      { value: "MSAT", label: "Athletic training, King’s" },
    ],
  },
  servicesTitle: "Book the day",
  ctaTitle: ["Got a game", "coming up?"],
  ctaBody: "Tell me the sport, the date, and what you want to remember. I’ll take it from there.",
  ctaButton: "Book a shoot",
};

export type SportMeta = {
  slug: string;
  name: string;
  /** Short line in Ava's voice shown on the gallery page. */
  blurb: string;
  /** Gallery accent, hand-sampled from something in the frames themselves. */
  accent: string;
};

/** Order here is the order on the Work index. New sports from the Instagram
 *  export (field hockey, track & field, …) get added here + in curation.json. */
export const SPORTS: SportMeta[] = [
  {
    slug: "soccer",
    accent: "#F2B33D", // scoreboard amber
    name: "Soccer",
    blurb: "Night matches, glowing scoreboards, and the split second after the ball hits the net.",
  },
  {
    slug: "lacrosse",
    accent: "#7FD1A3", // Stevenson green under the lights
    name: "Lacrosse",
    blurb: "My sport. I know what a dodge looks like before it happens.",
  },
  {
    slug: "football",
    accent: "#A9D46E", // turf
    name: "Football",
    blurb: "Friday nights in Virginia got me started. Saturdays at Stevenson kept me going.",
  },
  {
    slug: "baseball",
    accent: "#E39463", // infield clay
    name: "Baseball",
    blurb: "Long innings, short moments. Half the story happens in the dugout.",
  },
  {
    slug: "beach-volleyball",
    accent: "#72BBEA", // clear sky over the sand
    name: "Beach Volleyball",
    blurb: "Hard sun, bright sand, and athletes hanging in the air.",
  },
  {
    slug: "portraits",
    accent: "#EFA04A", // fall leaves
    name: "Portraits & Grads",
    blurb: "Senior and grad portraits in the places that mattered: the stadium, the walk to class, the crew you came up with.",
  },
];

export const WORK = {
  title: "The work",
  intro: "Every sport I shoot, sorted by season. Pick a field.",
};

export const ABOUT = {
  title: ["Athlete.", "Photographer.", "Future AT."],
  lede:
    "I’m Ava. I grew up in Virginia, played college lacrosse in Maryland, and I’ve had a camera on a sideline since 2021.",
  body: [
    "I started shooting my high school’s games because I wanted to see them the way I felt them. Friday night football turned into field hockey, soccer, track and field at states, wrestling, baseball, marching band, cross country, then senior and graduation portraits. A lot of my favorite work from those years was one-on-one: following a single athlete through a whole game.",
    "At Stevenson I played women’s lacrosse for the Mustangs and kept shooting between my own practices: football, men’s and women’s soccer, men’s lacrosse at the Mustang Classic, men’s volleyball, baseball, and USA Volleyball beach events. I took a college photo course along the way.",
    "Today I’m in the Master of Science in Athletic Training program at King’s. Learning how athletes move, get hurt, and come back has made me a better photographer. I know what effort looks like up close.",
  ],
  headshotAlt: "Portrait of Ava Treakle",
  timelineTitle: "2021 → now",
  timeline: [
    {
      when: "2021",
      title: "High school sidelines",
      body: "Friday night lights, field hockey, soccer, track and field states, wrestling, baseball, marching band, cross country, senior portraits. If it happened at my school, I was there with a camera.",
      photo: null as string | null,
      placeholder: "[[INSTAGRAM — 2021 high school sidelines photo, Ava to approve]]",
    },
    {
      when: "Commit",
      title: "Stevenson Mustangs",
      body: "I committed to play women’s lacrosse at Stevenson University in Maryland. The camera came with me.",
      photo: "lacrosse-huddle-lights" as string | null,
      placeholder: "",
    },
    {
      when: "Game days",
      title: "Playing it. Shooting it.",
      body: "Between my own practices: football, soccer, men’s lacrosse at the Mustang Classic, volleyball, baseball, and USA Volleyball beach events. Plus a college photo course.",
      photo: "soccer-strike-3-06" as string | null,
      placeholder: "",
    },
    {
      when: "Alum",
      title: "Caps in the air",
      body: "I graduated a Mustang, and grad portraits at Mustang Stadium became part of the work: the field, the boardwalk, the statue.",
      photo: "portraits-cap-toss" as string | null,
      placeholder: "",
    },
    {
      when: "Now",
      title: "King’s MSAT",
      body: "Training to be an athletic trainer, still on the sideline every chance I get. The two jobs have more in common than you’d think: both are about watching athletes closely.",
      photo: "bvb-jump-serve" as string | null,
      placeholder: "",
    },
  ],
  testimonial: "[[TESTIMONIAL — get from Ava]]",
};

export const SERVICES = {
  title: ["Ways to", "work together"],
  intro:
    "Every shoot starts with a conversation about what you want to remember. These are the four I do most.",
  list: [
    {
      n: "01",
      name: "Game Day Coverage",
      body: "Warmups, the action, the bench, the handshake line. The whole story of the day, not just the highlight reel.",
      includes: ["Full-game sideline coverage", "Action, bench & crowd moments", "Edited online gallery"],
      price: "[[PRICE]]",
      photo: "soccer-arms-raised",
    },
    {
      n: "02",
      name: "Team & Media Day",
      body: "Roster headshots, team photos, and hype shots for your socials, organized so your coach or SID can find what they need.",
      includes: ["Individual & team portraits", "Social-ready hype frames", "Organized by roster"],
      price: "[[PRICE]]",
      photo: "baseball-helmet-stare",
    },
    {
      n: "03",
      name: "Athlete Individual Shoots",
      body: "One athlete, one game, start to finish. Built for recruiting profiles and the posts you actually want to put up.",
      includes: ["Follow-cam game coverage", "Recruiting-ready selects", "Social crops"],
      price: "[[PRICE]]",
      photo: "bvb-spike-net",
    },
    {
      n: "04",
      name: "Senior & Graduation Portraits",
      body: "Caps in the air at midfield, your crew on the walk you took every day. Portraits that look like you, in the places that mattered.",
      includes: ["Location planning", "Solo + group portraits", "Edited online gallery"],
      price: "[[PRICE]]",
      photo: "portraits-fall-walk",
    },
  ],
  process: [
    { n: "01", title: "Reach out", body: "Send the sport or occasion, the date, and the team or school." },
    { n: "02", title: "Game plan", body: "We talk through the shots that matter to you and who needs to be in them." },
    { n: "03", title: "Game day", body: "I show up early, learn the field, and stay late for the handshake line." },
    { n: "04", title: "Gallery", body: "You get an edited online gallery in [[TURNAROUND]]." },
  ],
};

export const CONTACT = {
  title: ["Let’s get", "you in frame."],
  intro: "Tell me about the game, the team, or the grad.",
  occasions: [
    "Game day coverage",
    "Team & media day",
    "Athlete individual shoot",
    "Senior / graduation portraits",
    "Something else",
  ],
  success: {
    title: "Got it.",
    body: "Your message is in. I’ll get back to you within [[RESPONSE TIME]]. Until then, go win something.",
  },
  error: {
    title: "That one got away.",
    body: "Something went wrong sending your message. Try again, or email me directly at",
  },
};

export const NOT_FOUND = {
  code: "404",
  title: "Out of bounds.",
  body: "That pass sailed over the end line. This page doesn’t exist, but the rest of the field does.",
  cta: "Back in play",
};

export const FOOTER = {
  line: "Shot from the sideline by someone who’s played on the field.",
};
