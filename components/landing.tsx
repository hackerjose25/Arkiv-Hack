"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Database,
  ChartNoAxesCombined,
  Layers3,
  Pause,
  Play,
} from "lucide-react";
import Link from "next/link";
import "./landing.css";

const videoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4";
const links = [
  { label: "Home", href: "/" },
  { label: "Workspace", href: "/studio" },
  { label: "Documentation", href: "https://docs.arkiv.network" },
  { label: "GitHub", href: "https://github.com/hackerjose25/Arkiv-Hack" },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setPaused(motion.matches);
      if (motion.matches) video.current?.pause();
      else void video.current?.play().catch(() => setPaused(true));
    };
    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    menu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const close = () => {
      setMenuOpen(false);
      burger.current?.focus();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const items = [
          burger.current,
          ...Array.from(
            menu.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [],
          ),
        ].filter(
          (item): item is HTMLButtonElement | HTMLAnchorElement =>
            item !== null,
        );
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const resize = () => {
      if (window.innerWidth > 720) close();
    };
    document.addEventListener("keydown", keyboard);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("keydown", keyboard);
      window.removeEventListener("resize", resize);
    };
  }, [menuOpen]);

  function toggleVideo() {
    if (paused)
      void video.current
        ?.play()
        .then(() => setPaused(false))
        .catch(() => setPaused(true));
    else {
      video.current?.pause();
      setPaused(true);
    }
  }

  return (
    <main className={`landing${menuOpen ? " landing-menu-open" : ""}`}>
      <div className="landing-bg" aria-hidden="true">
        <video
          ref={video}
          className="landing-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/assets/landing-poster.svg"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>
      <header className="landing-header">
        <Link href="/" className="landing-brand" aria-label="ArkivSight home">
          <span className="landing-logo">
            <Layers3 size={29} strokeWidth={1.7} />
          </span>
          <span className="landing-wordmark">ArkivSight</span>
        </Link>
        <nav className="landing-nav" aria-label="Main navigation">
          {links.map(({ label, href }, i) => (
            <a
              key={label}
              href={href}
              className={i === 0 ? "current" : undefined}
              aria-current={i === 0 ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <Link className="landing-enter" href="/studio">
          Open studio <ArrowUpRight size={14} />
        </Link>
        <button
          ref={burger}
          className="landing-burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="landing-mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
      <div
        className="landing-menu-backdrop"
        hidden={!menuOpen}
        onClick={() => {
          setMenuOpen(false);
          burger.current?.focus();
        }}
      />
      <nav
        ref={menu}
        id="landing-mobile-menu"
        className="landing-mobile-menu"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
      >
        {links.map(({ label, href }, i) => (
          <a
            key={label}
            href={href}
            aria-current={i === 0 ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </a>
        ))}
        <Link
          href="/studio"
          className="landing-mobile-cta"
          onClick={() => setMenuOpen(false)}
        >
          Open studio <ArrowUpRight size={15} />
        </Link>
      </nav>
      <section
        className="landing-hero"
        aria-labelledby="landing-title"
        inert={menuOpen}
      >
        <div
          className="landing-trust landing-reveal"
          style={{ animationDelay: "0.05s" }}
        >
          <div className="landing-rings" aria-hidden="true">
            {[Database, ChartNoAxesCombined, Layers3].map((Icon, i) => (
              <span key={i}>
                <i>
                  <Icon size={15} strokeWidth={1.8} />
                </i>
              </span>
            ))}
          </div>
          <span className="landing-trust-label">
            Public data. Infinite perspectives.
          </span>
        </div>
        <h1 id="landing-title" className="landing-headline">
          <span>Onchain Data.</span>
          <span>Designed For Clarity.</span>
        </h1>
        <p
          className="landing-description landing-reveal"
          style={{ animationDelay: "0.28s" }}
        >
          Explore public Arkiv data with ArkivSight. Build queries,
          <br className="landing-desktop-break" /> visualize results, and share
          live dashboards. No code required.
        </p>
        <Link
          className="landing-cta landing-reveal"
          style={{ animationDelay: "0.4s" }}
          href="/studio"
        >
          Get Started <ArrowUpRight size={16} />
        </Link>
        <span
          className="landing-caption landing-reveal"
          style={{ animationDelay: "0.5s" }}
        >
          OPEN SOURCE. WALLET-FREE EXPLORATION.
        </span>
      </section>
      <footer className="landing-footer" inert={menuOpen}>
        <div className="landing-stats" aria-label="Studio capabilities">
          {[
            { icon: "↗", value: "No code", label: "Query to dashboard" },
            { icon: "◷", value: "30s", label: "Polling · pauses when hidden" },
            {
              icon: "</>",
              value: "Share & embed",
              label: "Public dashboard readers",
            },
            { icon: "*", value: "MIT", label: "Open source. Yours to build." },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="landing-stat landing-reveal"
              style={{ animationDelay: `${0.5 + i * 0.08}s` }}
            >
              <span className="landing-stat-symbol" aria-hidden="true">
                {stat.icon}
              </span>
              <span className="landing-stat-value">{stat.value}</span>
              <span className="landing-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="landing-bottom">
          <span>
            ARKIVSIGHT <span className="landing-bottom-divider">/</span> BUILT
            ON ARKIV <span className="landing-bottom-divider">/</span>
            <a href="https://www.onlinewebfonts.com/fonts">Web Fonts</a>
          </span>
          <button
            className="landing-motion"
            onClick={toggleVideo}
            aria-label={
              paused ? "Play background video" : "Pause background video"
            }
          >
            {paused ? <Play size={11} /> : <Pause size={11} />}
            <span>{paused ? "Play motion" : "Pause motion"}</span>
          </button>
          <span className="landing-network">
            <i /> TIRAMISU TESTNET
          </span>
        </div>
      </footer>
    </main>
  );
}
