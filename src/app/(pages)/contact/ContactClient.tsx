"use client";

import { useState, useRef, type FormEvent } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
} from "motion/react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const SUBJECTS = ["General", "Technical Support", "Partnership", "Feedback"] as const;

/* ------------------------------------------------------------------ */
/*  Reusable animation variants                                        */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ------------------------------------------------------------------ */
/*  SVG Icon Components                                                */
/* ------------------------------------------------------------------ */
function EnvelopeIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className={className}>
      <rect x="3" y="6" width="22" height="16" stroke="#D4A84B" strokeWidth="2" />
      <path d="M3 6L14 16L25 6" stroke="#D4A84B" strokeWidth="2" />
      <path d="M3 22L11 14" stroke="#D4A84B" strokeWidth="2" />
      <path d="M25 22L17 14" stroke="#D4A84B" strokeWidth="2" />
    </svg>
  );
}

function CodeBracketIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className={className}>
      <path d="M10 7L4 14L10 21" stroke="#D4A84B" strokeWidth="2" />
      <path d="M18 7L24 14L18 21" stroke="#D4A84B" strokeWidth="2" />
      <path d="M16 5L12 23" stroke="#D4A84B" strokeWidth="2" />
    </svg>
  );
}

function WrenchIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className={className}>
      <circle cx="11" cy="11" r="6" stroke="#D4A84B" strokeWidth="2" />
      <circle cx="11" cy="11" r="2.5" stroke="#D4A84B" strokeWidth="2" />
      <path d="M15.5 15.5L24 24" stroke="#D4A84B" strokeWidth="2" />
      <path d="M7 4V6" stroke="#D4A84B" strokeWidth="2" />
      <path d="M15 4V6" stroke="#D4A84B" strokeWidth="2" />
      <path d="M4 7H6" stroke="#D4A84B" strokeWidth="2" />
      <path d="M4 15H6" stroke="#D4A84B" strokeWidth="2" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className={className}>
      <path d="M14 3L4 7V14C4 20 8 24 14 26C20 24 24 20 24 14V7L14 3Z" stroke="#D4A84B" strokeWidth="2" />
      <path d="M10 14L13 17L19 11" stroke="#D4A84B" strokeWidth="2" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Geometric Hero Illustration                                        */
/* ------------------------------------------------------------------ */
function HeroIllustration() {
  return (
    <div className="relative w-full h-full min-h-[320px] sm:min-h-[400px]">
      <svg
        viewBox="0 0 400 400"
        fill="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Large circle */}
        <motion.circle
          cx="200"
          cy="160"
          r="100"
          stroke="#D4A84B"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        />

        {/* Floating small circle */}
        <motion.circle
          cx="320"
          cy="80"
          r="30"
          stroke="#D4A84B"
          strokeWidth="2"
          opacity="0.5"
          animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Overlapping rectangle */}
        <motion.rect
          x="140"
          y="100"
          width="160"
          height="160"
          stroke="white"
          strokeWidth="2"
          opacity="0.15"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        />

        {/* Diagonal line 1 */}
        <motion.line
          x1="60"
          y1="280"
          x2="200"
          y2="140"
          stroke="#D4A84B"
          strokeWidth="2"
          opacity="0.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        />

        {/* Diagonal line 2 */}
        <motion.line
          x1="200"
          y1="260"
          x2="340"
          y2="120"
          stroke="white"
          strokeWidth="2"
          opacity="0.1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        />

        {/* Floating diamond */}
        <motion.rect
          x="60"
          y="60"
          width="40"
          height="40"
          stroke="#D4A84B"
          strokeWidth="2"
          opacity="0.3"
          transform="rotate(45 80 80)"
          animate={{ y: [0, 6, 0], rotate: [45, 50, 45] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Small square */}
        <motion.rect
          x="300"
          y="250"
          width="50"
          height="50"
          stroke="#D4A84B"
          strokeWidth="2"
          opacity="0.25"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Dot pattern cluster */}
        {[
          [280, 300], [295, 300], [310, 300],
          [280, 315], [295, 315], [310, 315],
          [280, 330], [295, 330], [310, 330],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={cx}
            cy={cy}
            r="1.5"
            fill="#D4A84B"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 1.2 + i * 0.05 }}
          />
        ))}

        {/* Connection lines between shapes */}
        <motion.path
          d="M200 260 L140 320 L260 320 Z"
          stroke="#D4A84B"
          strokeWidth="1.5"
          opacity="0.2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 1.3 }}
        />

        {/* Floating circle bottom-left */}
        <motion.circle
          cx="80"
          cy="340"
          r="20"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.1"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Horizontal line accent */}
        <motion.line
          x1="60"
          y1="200"
          x2="160"
          y2="200"
          stroke="#D4A84B"
          strokeWidth="2"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dot Grid Background                                                */
/* ------------------------------------------------------------------ */
function DotGridBg() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(212,168,75,0.06) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Quick-link data with icons                                         */
/* ------------------------------------------------------------------ */
const LINKS: {
  icon: React.ReactNode;
  label: string;
  href: string;
  text: string;
  external?: boolean;
}[] = [
  {
    icon: <EnvelopeIcon />,
    label: "General Inquiries",
    href: "mailto:hello@zgnal.ai",
    text: "hello@zgnal.ai",
  },
  {
    icon: <CodeBracketIcon />,
    label: "GitHub",
    href: "https://github.com/Neens6655",
    text: "github.com/Neens6655",
    external: true,
  },
  {
    icon: <WrenchIcon />,
    label: "Technical Support",
    href: "mailto:support@zgnal.ai",
    text: "support@zgnal.ai",
  },
  {
    icon: <ShieldIcon />,
    label: "Privacy",
    href: "mailto:privacy@zgnal.ai",
    text: "privacy@zgnal.ai",
  },
];

/* ================================================================== */
/*  ContactClient                                                      */
/* ================================================================== */
export default function ContactClient() {
  /* form state */
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  /* refs for useInView */
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.1 });
  const formInView = useInView(formRef, { once: true, amount: 0.1 });
  const linksInView = useInView(linksRef, { once: true, amount: 0.1 });
  const bottomInView = useInView(bottomRef, { once: true, amount: 0.1 });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="relative min-h-screen bg-[#0A0A0B] overflow-hidden">
      <DotGridBg />

      {/* ============================================================ */}
      {/*  HERO — Split: Text left, Illustration right                 */}
      {/* ============================================================ */}
      <section
        ref={heroRef}
        className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-8 sm:pt-36 sm:pb-12"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Left: Text */}
          <div className="lg:w-[55%]">
            <motion.div
              initial={{ width: 0 }}
              animate={heroInView ? { width: 64 } : {}}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="h-[2px] bg-[#D4A84B] mb-8"
            />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-[10px] font-mono font-semibold tracking-[0.25em] uppercase text-[#D4A84B] mb-5"
            >
              Contact
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.45, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-5xl sm:text-7xl font-mono font-bold text-white leading-[1.05] mb-6"
            >
              Let&rsquo;s talk.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-base sm:text-lg text-white/50 max-w-xl font-sans leading-relaxed"
            >
              Questions, feedback, or partnership inquiries&mdash;we&rsquo;d love to
              hear from you.
            </motion.p>
          </div>

          {/* Right: Geometric Illustration */}
          <motion.div
            className="hidden lg:block lg:w-[45%]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={heroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  MAIN: Form (55%) + Illustration/Links (45%)                 */}
      {/* ============================================================ */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* -------------------------------------------------------- */}
          {/*  CONTACT FORM (55%)                                      */}
          {/* -------------------------------------------------------- */}
          <div ref={formRef} className="w-full lg:w-[55%]">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial="hidden"
                  animate={formInView ? "visible" : "hidden"}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.35 } }}
                  variants={staggerContainer}
                  className="space-y-10"
                >
                  {/* Name */}
                  <motion.div variants={fadeUp} custom={0} className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      {/* Geometric accent — small gold square */}
                      <span className="inline-block w-2 h-2 bg-[#D4A84B]/30 border border-[#D4A84B]/50" />
                      <label
                        htmlFor="name"
                        className="block text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-white/40"
                      >
                        Name
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        onFocus={() => setFocused("name")}
                        onBlur={() => setFocused(null)}
                        placeholder="Your name"
                        className={`
                          w-full bg-transparent border-0 border-b-2 px-0 py-3
                          text-white font-sans text-base
                          placeholder:text-white/20
                          outline-none transition-colors duration-300
                          ${focused === "name" ? "border-[#D4A84B]" : "border-white/10"}
                        `}
                      />
                      {/* Gold triangle indicator on focus */}
                      <motion.div
                        className="absolute right-0 bottom-0"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={focused === "name" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="#D4A84B">
                          <polygon points="0,10 10,10 10,0" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={fadeUp} custom={1} className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block w-2 h-2 border border-[#D4A84B]/50 rotate-45" />
                      <label
                        htmlFor="email"
                        className="block text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-white/40"
                      >
                        Email
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        onFocus={() => setFocused("email")}
                        onBlur={() => setFocused(null)}
                        placeholder="you@company.com"
                        className={`
                          w-full bg-transparent border-0 border-b-2 px-0 py-3
                          text-white font-sans text-base
                          placeholder:text-white/20
                          outline-none transition-colors duration-300
                          ${focused === "email" ? "border-[#D4A84B]" : "border-white/10"}
                        `}
                      />
                      <motion.div
                        className="absolute right-0 bottom-0"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={focused === "email" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="#D4A84B">
                          <polygon points="0,10 10,10 10,0" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Subject */}
                  <motion.div variants={fadeUp} custom={2} className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block w-2 h-2 bg-[#D4A84B]/20 border border-[#D4A84B]/40" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
                      <label
                        htmlFor="subject"
                        className="block text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-white/40"
                      >
                        Subject
                      </label>
                    </div>
                    <div className="relative">
                      <select
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        onFocus={() => setFocused("subject")}
                        onBlur={() => setFocused(null)}
                        className={`
                          w-full bg-transparent border-0 border-b-2 px-0 py-3
                          text-white font-sans text-base
                          outline-none transition-colors duration-300
                          appearance-none cursor-pointer
                          ${focused === "subject" ? "border-[#D4A84B]" : "border-white/10"}
                        `}
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s} className="bg-[#141416] text-white">
                            {s}
                          </option>
                        ))}
                      </select>
                      {/* Chevron */}
                      <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-white/30 text-xs font-mono">
                        &#x25BC;
                      </span>
                      <motion.div
                        className="absolute right-0 bottom-0"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={focused === "subject" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="#D4A84B">
                          <polygon points="0,10 10,10 10,0" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Message */}
                  <motion.div variants={fadeUp} custom={3} className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block w-2 h-2 rounded-full border border-[#D4A84B]/50" />
                      <label
                        htmlFor="message"
                        className="block text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-white/40"
                      >
                        Message
                      </label>
                    </div>
                    <div className="relative">
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        onFocus={() => setFocused("message")}
                        onBlur={() => setFocused(null)}
                        placeholder="Tell us what you're working on..."
                        className={`
                          w-full bg-transparent border-0 border-b-2 px-0 py-3
                          text-white font-sans text-base resize-none
                          placeholder:text-white/20
                          outline-none transition-colors duration-300
                          ${focused === "message" ? "border-[#D4A84B]" : "border-white/10"}
                        `}
                      />
                      <motion.div
                        className="absolute right-0 bottom-0"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={focused === "message" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="#D4A84B">
                          <polygon points="0,10 10,10 10,0" />
                        </svg>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Submit */}
                  <motion.div variants={fadeUp} custom={4}>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="
                        group flex items-center gap-3
                        bg-[#D4A84B] text-[#0A0A0B] font-mono font-bold text-sm
                        tracking-[0.15em] uppercase
                        px-10 py-4
                        border-2 border-[#D4A84B]
                        transition-colors duration-300
                        hover:bg-[#E2BC6A] hover:border-[#E2BC6A]
                        focus:outline-none focus:ring-2 focus:ring-[#D4A84B]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0B]
                      "
                    >
                      Send Message
                      {/* Geometric arrow icon */}
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                        <path d="M3 8H13" stroke="#0A0A0B" strokeWidth="2" />
                        <path d="M9 4L13 8L9 12" stroke="#0A0A0B" strokeWidth="2" />
                      </svg>
                    </motion.button>
                  </motion.div>
                </motion.form>
              ) : (
                /* ---------------------------------------------------- */
                /*  SUCCESS STATE                                       */
                /* ---------------------------------------------------- */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                  style={{ perspective: 800 }}
                >
                  {/* Checkmark circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 border-2 border-[#D4A84B] flex items-center justify-center mb-8"
                  >
                    <motion.svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                    >
                      <motion.path
                        d="M8 16L14 22L24 10"
                        stroke="#D4A84B"
                        strokeWidth="2.5"
                        strokeLinecap="square"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      />
                    </motion.svg>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-2xl sm:text-3xl font-mono font-bold text-white mb-4"
                  >
                    Message sent.
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.5 }}
                    className="text-base text-white/50 font-sans max-w-sm"
                  >
                    We&rsquo;ll be in touch. Expect a reply within 24 hours.
                  </motion.p>

                  {/* Reset */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
                    }}
                    className="mt-10 text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-white/30 hover:text-[#D4A84B] transition-colors"
                  >
                    Send another message
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* -------------------------------------------------------- */}
          {/*  RIGHT SIDE (45%) — Quick Links with SVG Icons            */}
          {/* -------------------------------------------------------- */}
          <div ref={linksRef} className="w-full lg:w-[45%]">
            {/* Response-time badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={linksInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-10 p-4 border border-white/[0.06] bg-white/[0.02]"
            >
              {/* Clock icon as SVG */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <circle cx="10" cy="10" r="8" stroke="#D4A84B" strokeWidth="1.5" />
                <path d="M10 5V10L13 13" stroke="#D4A84B" strokeWidth="1.5" />
              </svg>
              <p className="text-xs font-mono text-white/40 leading-relaxed">
                We typically respond within{" "}
                <span className="text-[#D4A84B] font-semibold">24 hours</span>
              </p>
            </motion.div>

            {/* Link cards */}
            <motion.div
              initial="hidden"
              animate={linksInView ? "visible" : "hidden"}
              variants={staggerContainer}
              className="space-y-4"
            >
              {LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -4 }}
                  className="
                    group block p-5
                    border border-white/[0.06] bg-white/[0.01]
                    transition-all duration-300
                    hover:border-l-[#D4A84B] hover:border-l-2 hover:bg-white/[0.03]
                  "
                >
                  <div className="flex items-start gap-4">
                    {/* SVG Icon */}
                    <div className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                      {link.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-white/30 group-hover:text-[#D4A84B] transition-colors">
                          {link.label}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 opacity-20 group-hover:opacity-60 transition-opacity">
                          <path d="M3 9L9 3" stroke="#D4A84B" strokeWidth="1.5" />
                          <path d="M4 3H9V8" stroke="#D4A84B" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <p className="mt-1.5 text-sm font-mono text-white/60 group-hover:text-white/80 transition-colors truncate">
                        {link.text}
                      </p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  BOTTOM: Prefer email fallback                               */}
      {/* ============================================================ */}
      <section ref={bottomRef} className="relative z-10 mx-auto max-w-7xl px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={bottomInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="border-t border-white/[0.06] pt-12"
        >
          <p className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase text-white/25 mb-6">
            Prefer email?
          </p>
          <div className="flex flex-wrap gap-x-10 gap-y-4">
            {["hello@zgnal.ai", "support@zgnal.ai", "privacy@zgnal.ai"].map((email) => (
              <a
                key={email}
                href={`mailto:${email}`}
                className="text-sm font-mono text-white/40 hover:text-[#D4A84B] transition-colors duration-300"
              >
                {email}
              </a>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
