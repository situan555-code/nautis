import { SunderWordmarkScene } from "sunder-and-co";

// Mounted exactly as src/js/three/sunder-wordmark-hero.js does: inside
// .hero > .hero__scene > .sunder-wordmark-root, with the static fallback word
// underneath until the scene reports ready.
const Hero = () => (
  <section className="hero">
    <div className="hero__scene" data-scene-ready="true" aria-hidden="true">
      <div className="hero__scene-fallback">
        <span className="hero__fallback-word">Sunder</span>
        <span className="hero__fallback-dot" />
      </div>
      <div className="sunder-wordmark-root">
        <SunderWordmarkScene isVisible />
      </div>
    </div>
  </section>
);

export const HomeHero = () => (
  <div style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
    <Hero />
    <section className="section dc-intro">
      <div className="container">
        <div className="dc-intro__content">
          <span className="section-label">Sunder &amp; Co.</span>
          <h1>Make the outside match the work inside.</h1>
          <p>
            Websites, brand systems, local visibility, and follow-up improvements for businesses whose first
            impression has fallen behind the work they actually do.
          </p>
          <p className="dc-intro__support">Built in Ohio for local businesses, regional brands, and remote clients across the U.S.</p>
          <div className="dc-actions">
            <a href="/contact.html" className="dc-button dc-button--primary">Start a Project</a>
            <a href="#what-we-build" className="dc-button dc-button--secondary">See What We Build</a>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export const SceneOnly = () => (
  <div style={{ background: "var(--color-bg)" }}>
    <Hero />
  </div>
);
