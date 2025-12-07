import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Mail, Phone, Download, Github, Linkedin, Sparkles, Image as ImageIcon, Brush, Code2, CircleUser } from "lucide-react";

/**
 * One-file animated portfolio site
 * - Tech: React + TailwindCSS + Framer Motion + Lucide Icons
 * - Fancy bits: magnetic buttons, parallax hero, cursor glow, scroll-reveal, gooey blobs
 * How to use: Drop into a React app (e.g., create-react-app, Next.js) and ensure Tailwind + framer-motion are installed.
 * Replace placeholders (name, links, images) inside the DATA section.
 */

// ==========================
// ======  DATA  ===========
// ==========================
const DATA = {
  name: "Manuja Rathnayake",
  role: "Graphic Designer · Software Engineering HND",
  tagline:
    "Graphic designer blending clean visuals with smart, code-aware thinking. NVQ 4 (Technical College, Matara) + HND in Software Engineering (Achievers International Campus).",
  email: "manujarathnayake2004@gmail.com",
  phone: "+94 75 500 4526",
  location: "Matara, Sri Lanka",
  socials: {
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/in/manuja-thushara-086bb4317",
  },
  heroImage: "/portfolio/portrait.jpg", // replace with your image path or external URL
  resumeUrl: "/portfolio/Manuja-Rathnayake-CV.pdf", // replace with your CV path
  projects: [
    {
      title: "Brand Identity – TechTrend",
      desc: "Logo system, palette, and UI kit for an e‑commerce electronics brand.",
      tags: ["Branding", "UI Kit", "Guidelines"],
      img: "https://images.unsplash.com/photo-1545235617-9465d2a55698?q=80&w=1600&auto=format&fit=crop",
      link: "#",
    },
    {
      title: "Portfolio Website",
      desc: "Animated personal portfolio with Framer Motion and responsive design.",
      tags: ["Web", "Animation", "React"],
      img: "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1600&auto=format&fit=crop",
      link: "#",
    },
    {
      title: "Poster Series – Code & Color",
      desc: "Typographic poster set exploring code syntax as visual art.",
      tags: ["Poster", "Typography"],
      img: "https://images.unsplash.com/photo-1551281044-8e317aa2ed54?q=80&w=1600&auto=format&fit=crop",
      link: "#",
    },
    {
      title: "Mobile UI – Manu Baker Hub",
      desc: "Clean food ordering UI focusing on simplicity and conversion.",
      tags: ["Mobile", "UI/UX"],
      img: "https://images.unsplash.com/photo-1541976076758-347942db1970?q=80&w=1600&auto=format&fit=crop",
      link: "#",
    },
  ],
  services: [
    {
      icon: Brush,
      title: "Brand & Identity",
      body: "Logos, style guides, social kits, and campaign assets with consistent visual systems.",
    },
    {
      icon: ImageIcon,
      title: "UI/UX & Web",
      body: "Responsive websites and dashboards with smooth motion and crisp layout.",
    },
    {
      icon: Code2,
      title: "Design + Code",
      body: "Bridging design and development—handoffs, components, and front‑end polish.",
    },
  ],
};

// Utility: classnames
const cx = (...c) => c.filter(Boolean).join(" ");

// Magnetic button hook
function useMagnet(ref, strength = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => (el.style.transform = "translate(0,0)");
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref, strength]);
}

// Cursor glow
function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 20 });
  const springY = useSpring(y, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed -z-10 h-[40vmax] w-[40vmax] rounded-full opacity-40 blur-3xl"
      style={{
        left: useTransform(springX, (v) => v - window.innerWidth * 0.2),
        top: useTransform(springY, (v) => v - window.innerHeight * 0.2),
        background:
          "radial-gradient(circle at center, rgba(59,130,246,0.35), rgba(37,99,235,0.15) 40%, rgba(12,74,110,0.05) 70%, transparent 80%)",
      }}
    />
  );
}

// Gooey blobs
function Blobs() {
  return (
    <svg className="absolute inset-0 -z-20 h-full w-full" aria-hidden>
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -6"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
      <g filter="url(#goo)">
        {[...Array(6)].map((_, i) => (
          <motion.circle
            key={i}
            cx={[10, 80, 20, 70, 30, 60][i] + "%"}
            cy={[15, 25, 60, 70, 40, 85][i] + "%"}
            r={[120, 150, 110, 130, 90, 100][i]}
            fill={`hsl(${200 + i * 8}, 80%, 55%)`}
            opacity={0.06}
            animate={{
              r: [100, 130, 100],
              cx: ["+=3%", "-=2%", "+=1%"],
              cy: ["+=2%", "-=3%", "+=1%"],
            }}
            transition={{ duration: 12 + i * 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </g>
    </svg>
  );
}

// Reveal on scroll wrapper
const Reveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ y: 24, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true, amount: 0.25 }}
    transition={{ duration: 0.7, delay }}
  >
    {children}
  </motion.div>
);

function NavBar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-slate-900/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#home" className="text-xl font-semibold tracking-tight text-white">
          Manuja<span className="text-sky-400">.</span>
        </a>
        <button
          className="md:hidden rounded-lg border border-white/10 px-3 py-2 text-white"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
        <ul className={cx("hidden gap-8 md:flex", open && "!flex") + " text-sm text-slate-200"}>
          {[
            ["Home", "#home"],
            ["About", "#about"],
            ["Services", "#services"],
            ["Portfolio", "#work"],
            ["Contact", "#contact"],
          ].map(([label, href]) => (
            <li key={href}>
              <a href={href} className="hover:text-white transition-colors">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Hero() {
  // parallax headline
  const y = useMotionValue(0);
  const parallax = useSpring(y, { stiffness: 80, damping: 20 });
  useEffect(() => {
    const onScroll = () => y.set(window.scrollY * -0.2);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [y]);

  const hireRef = useRef(null);
  const talkRef = useRef(null);
  useMagnet(hireRef, 0.25);
  useMagnet(talkRef, 0.25);

  return (
    <section id="home" className="relative isolate flex min-h-[92vh] items-center overflow-hidden bg-slate-950 pt-24 text-white">
      <CursorGlow />
      <Blobs />
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 md:grid-cols-2">
        <div>
          <motion.h1
            style={{ y: parallax }}
            className="text-4xl font-black leading-tight md:text-6xl"
          >
            Hi, I'm <span className="text-sky-400">{DATA.name}</span>
          </motion.h1>
          <Reveal>
            <p className="mt-3 text-sky-300 font-semibold">{DATA.role}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 max-w-xl text-slate-300">{DATA.tagline}</p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                ref={hireRef}
                href="#contact"
                className="relative inline-flex items-center gap-2 rounded-2xl border border-sky-500/50 bg-sky-500/10 px-6 py-3 font-semibold text-sky-200 shadow-[0_0_40px_-12px_theme(colors.sky.500/60%)] hover:bg-sky-500/20"
              >
                <Sparkles className="h-5 w-5" /> Hire Me
              </a>
              <a
                ref={talkRef}
                href={DATA.resumeUrl}
                className="relative inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-slate-200 hover:bg-white/10"
              >
                <Download className="h-5 w-5" /> Download CV
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex items-center gap-4 text-slate-300">
              <a href={DATA.socials.github} className="hover:text-white" aria-label="GitHub">
                <Github />
              </a>
              <a href={DATA.socials.linkedin} className="hover:text-white" aria-label="LinkedIn">
                <Linkedin />
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal>
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto aspect-square w-72 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/10 to-fuchsia-500/10 p-2 shadow-2xl md:w-96"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,211,252,0.25),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(232,121,249,0.18),transparent_40%)]" />
              <div className="relative h-full w-full overflow-hidden rounded-2xl">
                {/* Replace with your own portrait */}
                <div
                  className="h-full w-full bg-[url('https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent" />
              </div>
            </motion.div>
            <motion.div
              className="absolute -left-6 -top-6 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white backdrop-blur"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="inline-flex items-center gap-2"><CircleUser className="h-4 w-4"/> Available for freelance</span>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SectionTitle({ kicker, title }) {
  return (
    <Reveal>
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">{kicker}</p>
        <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">{title}</h2>
      </div>
    </Reveal>
  );
}

function About() {
  return (
    <section id="about" className="relative bg-slate-950 py-24 text-slate-300">
      <SectionTitle kicker="About" title="Design with clarity. Ship with confidence." />
      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
        <Reveal>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-white">Who</h3>
            <p className="mt-2 text-sm">Graphic Designer with NVQ Level 4 (Technical College, Matara) and HND in Software Engineering (Achievers International Campus). Comfortable across branding, UI, and motion.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-white">How</h3>
            <p className="mt-2 text-sm">Systems thinking + clean visual language. Figma, Illustrator, Photoshop, and modern front‑end workflows ensure designs that build beautifully.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-white">Value</h3>
            <p className="mt-2 text-sm">Reliable delivery, smart hand‑offs, and animations that guide—not distract. Your brand stays consistent across every touchpoint.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="relative bg-gradient-to-b from-slate-950 to-slate-900 py-24 text-slate-300">
      <SectionTitle kicker="Services" title="What I can do for you" />
      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
        {DATA.services.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.05}>
            <motion.div
              whileHover={{ y: -6 }}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg"
            >
              <s.icon className="h-10 w-10 text-sky-400" />
              <h3 className="mt-4 text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm">{s.body}</p>
              <div className="mt-6 h-1 w-0 bg-sky-400 transition-all duration-300 group-hover:w-full" />
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Portfolio() {
  return (
    <section id="work" className="relative bg-slate-900 py-24 text-slate-300">
      <SectionTitle kicker="Portfolio" title="Selected work" />
      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-2">
        {DATA.projects.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.05}>
            <motion.a
              href={p.link}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            >
              <div className="aspect-[16/10] w-full bg-slate-800">
                <img src={p.img} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-80" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-1 text-sm opacity-90">{p.desc}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs text-sky-300 ring-1 ring-sky-500/20">{t}</span>
                  ))}
                </div>
              </div>
            </motion.a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative bg-slate-950 py-24 text-slate-300">
      <SectionTitle kicker="Contact" title="Let’s build something great" />
      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
        <Reveal>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-white">Details</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-sky-400"/> {DATA.email}</li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-sky-400"/> {DATA.phone}</li>
            </ul>
            <p className="mt-6 text-xs text-slate-400">Based in {DATA.location}</p>
            <div className="mt-6 flex items-center gap-4">
              <a href={DATA.socials.github} className="hover:text-white"><Github/></a>
              <a href={DATA.socials.linkedin} className="hover:text-white"><Linkedin/></a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks! Your message has been captured in this demo. Connect to a backend or service like Formspree for production.");
            }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Name" required />
              <input type="email" className="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Email" required />
              <input className="md:col-span-2 rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Subject" />
              <textarea rows={5} className="md:col-span-2 rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Tell me about your project" />
            </div>
            <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-sky-500/90 px-5 py-3 font-semibold text-slate-950 shadow-[0_0_30px_-8px_theme(colors.sky.500/80%)] hover:bg-sky-400">
              Send Message <ArrowRight className="h-4 w-4"/>
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 py-10 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} {DATA.name}. Crafted with motion and care.
    </footer>
  );
}

export default function PortfolioSite() {
  return (
    <main className="min-h-screen scroll-smooth bg-slate-950 antialiased">
      <NavBar />
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <Contact />
      <Footer />
    </main>
  );
}
