import Link from "next/link";
import ParticleField from "@/app/components/particle-field";

export default function Home() {
  return (
    <main className="landing-main">
      <section className="future-hero" aria-labelledby="hero-heading">
        <ParticleField />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-eyebrow"><span /> Rooted in Cape Verde. Connected to you.</p>
          <h1 id="hero-heading">Your home.<br />An ocean away.<br /><span>A clearer path.</span></h1>
          <p className="hero-description">Build, renovate, buy, or care for a home back home. Find reliable local teams, understand their checks, and start a conversation.</p>
          <Link className="hero-cta" href="/a">Find my property team <span aria-hidden="true">↗</span></Link>
          <p className="hero-secondary">Trust comes first. <Link href="/b">See how builder verification works →</Link></p>
        </div>
        <div className="globe-label" aria-hidden="true"><span /> YOUR FUTURE STARTS WITH A CONNECTION<br /><small>14.92° N / 23.51° W · PRAIA</small></div>
        <div className="hero-bottom"><span>FROM YOUR FIRST IDEA TO YOUR FIRST CONVERSATION</span><span>01 / A CLEARER WAY HOME</span></div>
      </section>
      <section className="landing-path" aria-label="How finding a builder works">
        <div><p className="eyebrow">A little guidance. A lot more clarity.</p><h2>Big plans.<br />Simple next steps.</h2></div>
        <ol><li><span>01</span><div><h3>Tell us about your home</h3><p>A new build, renovation, existing-home purchase, or ongoing care.</p></div></li><li><span>02</span><div><h3>Find a team you can assess</h3><p>Compare builders and property managers, with evidence and open questions.</p></div></li><li><span>03</span><div><h3>Start a conversation</h3><p>Choose a team and explore a video introduction or a message.</p></div></li></ol>
      </section>
      <section className="partner-teaser"><div><p className="eyebrow">A proposed partnership model</p><h2>Banks handle escrow.<br />Sentinel helps verify the work.</h2><p>We aim to work with banks that hold funds and operate escrow. Sentinel would provide milestone evidence and verification reports for the agreed payment process.</p></div><Link className="button secondary" href="/b#bank-partners">Explore the roles →</Link></section>
      <p className="landing-demo-note">An early concept for your feedback. Builder profiles and connection requests are examples.</p>
    </main>
  );
}
