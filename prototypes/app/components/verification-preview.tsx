"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { sampleBuilders } from "@/app/data/builders";
import { localChecks, onlineChecks, onboardingSections, type VerificationCheck } from "@/app/data/verification";

function EvidenceChecks({ checks }: { checks: VerificationCheck[] }) {
  return <div className="verification-checks">{checks.map((check) => <details className="verification-check" key={check.title}>
    <summary><span>{check.title}</span><span className={`finding-status ${check.status === "Reviewed" ? "observed" : ""}`}>{check.status}</span></summary>
    <div><p><strong>Example evidence:</strong> {check.evidence}</p><p><strong>What this does not establish:</strong> {check.limitation}</p></div>
  </details>)}</div>;
}

function OnboardingPreview({ teamName }: { teamName: string }) {
  const [sections, setSections] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  return <section className="onboarding-demo" aria-labelledby="onboarding-heading">
    <div className="verification-section-heading"><div><p className="eyebrow">For builders and property managers</p><h2 id="onboarding-heading">Most of the first steps can happen online.</h2></div><span className="sample-label">Interactive example</span></div>
    <p className="muted small">Try assembling a fictional onboarding packet for {teamName}. No documents or personal details are collected.</p>
    <div className="onboarding-progress"><span style={{ width: `${sections.length / onboardingSections.length * 100}%` }} /></div>
    <p className="small muted" aria-live="polite">{sections.length} of {onboardingSections.length} sample sections prepared</p>
    <fieldset className="onboarding-sections" disabled={submitted}><legend className="sr-only">Sample onboarding sections</legend>{onboardingSections.map((section) => <label key={section.title}>
      <input type="checkbox" checked={sections.includes(section.title)} onChange={(event) => setSections(event.target.checked ? [...sections, section.title] : sections.filter((item) => item !== section.title))} />
      <span><strong>{section.title}</strong><span>{section.detail}</span></span>
    </label>)}</fieldset>
    {submitted ? <div className="notice" role="status"><strong>Sample packet ready for human review.</strong><p>No evidence was sent and no verification status changed. A real reviewer would check the evidence, contact sources, record gaps, and decide whether local follow-up is needed.</p><button className="text-button" onClick={() => { setSections([]); setSubmitted(false); }}>Reset onboarding example</button></div> : <button className="button primary" disabled={sections.length !== onboardingSections.length} onClick={() => setSubmitted(true)}>Preview evidence submission →</button>}
    <p className="field-help">Prepared evidence is not verified evidence. Online submission does not automatically approve a provider.</p>
  </section>;
}

export default function VerificationPreview() {
  const searchParams = useSearchParams();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const team = sampleBuilders.find((builder) => builder.id === (chosenId ?? searchParams.get("team"))) ?? sampleBuilders[0];
  const [mode, setMode] = useState<"online" | "local">("online");
  const [showHandoff, setShowHandoff] = useState(false);

  return <main className="report-main verification-main">
    <Link className="back-link" href="/">← Home</Link>
    <section className="verification-intro"><div><p className="eyebrow">The trust behind the introduction</p><h1>Reliable builders.<br /><span>Evidence you can inspect.</span></h1><p className="lede">Know who you’re hiring, what has been checked, and what still needs an answer. For builders, renovation teams, and property managers.</p></div><div className="verification-principle"><span aria-hidden="true">⌾</span><strong>Digital first.<br />Local when it matters.</strong><p>Online onboarding and independent review, with targeted in-person checks for unresolved gaps.</p></div></section>

    <article className="report-sheet" aria-labelledby="dossier-heading">
      <header className="report-sheet-header"><div><p className="eyebrow">Fictional verification record</p><h2 id="dossier-heading">Look beyond a badge.</h2><p>No real business has been verified in this demo.</p></div><span className="status-pill">Review in progress</span></header>
      <div className="report-body">
        <div className="verification-team-picker"><label className="field-label" htmlFor="verification-team">Explore a sample team</label><select id="verification-team" className="text-input" value={team.id} onChange={(event) => setChosenId(event.target.value)}>{sampleBuilders.map((builder) => <option value={builder.id} key={builder.id}>{builder.name}</option>)}</select><p className="field-help">{team.teamType} · {team.location}. All teams use an illustrative review checklist, not an actual assessment.</p></div>
        <div className="verification-summary"><span className="provider-avatar">{team.initials}</span><div><h3>{team.name}</h3><p>{team.services.length} sample services · {team.yearsExperience} years claimed experience</p></div></div>
        <div className="verification-mode" role="group" aria-label="Verification evidence type"><button aria-pressed={mode === "online"} onClick={() => setMode("online")}>Online evidence</button><button aria-pressed={mode === "local"} onClick={() => setMode("local")}>Targeted local checks</button></div>
        <p className="small muted">{mode === "online" ? "Example reviewer outcomes after examining remote evidence. Open each item to see its limits." : "Some gaps require someone on the ground. These local checks are not completed in this example."}</p>
        <EvidenceChecks checks={mode === "online" ? onlineChecks : localChecks} />
        <div className="notice"><strong>Overall review remains open.</strong><p>Credentials and project fit need follow-up. A real profile should record evidence sources, review dates, reviewer responsibility, outstanding issues, and when checks need refreshing.</p></div>
        <p className="report-limits">Verification is a scoped review of evidence, not a guarantee of reliability or workmanship. A new-build check is different from assessing property management or purchase-related services.</p>
      </div>
    </article>

    <OnboardingPreview teamName={team.name} key={team.id} />

    <section className="bank-partners" id="bank-partners" aria-labelledby="bank-heading">
      <p className="eyebrow">Proposed payment partnership</p><h2 id="bank-heading">Bank-held funds.<br />Verification from Sentinel.</h2>
      <p className="panel-description">Our intended model is to partner with banks for escrow and payments. Sentinel would help verify milestones and provide the evidence for the agreed release process.</p>
      <div className="partner-role-grid"><article><span>01 / BANK</span><h3>Holds and moves the money</h3><p>A partner bank would operate escrow and execute payments under its agreed terms and authorizations.</p></article><article><span>02 / SENTINEL</span><h3>Checks and reports on progress</h3><p>Collects milestone evidence, coordinates human verification, and reports completed work and unresolved issues.</p></article><article><span>03 / OWNER & TEAM</span><h3>Agree the work and milestones</h3><p>The owner and provider agree scope, evidence, and payment conditions with the bank. For upkeep, these could cover visits, repairs, and reports.</p></article></div>
      <p className="field-help">Partnership concept only. No bank is connected or confirmed, no escrow account is opened, and this prototype cannot hold or release funds. Existing-home purchases would need a separately agreed process.</p>
      <button className="button secondary" aria-expanded={showHandoff} aria-controls="milestone-handoff" onClick={() => setShowHandoff(!showHandoff)}>{showHandoff ? "Hide milestone handoff" : "Preview a milestone handoff →"}</button>
      {showHandoff && <div className="milestone-handoff" id="milestone-handoff" role="status"><p className="eyebrow">Sample report to a future bank partner</p><h3>Milestone: agreed exterior repairs</h3><dl><div><dt>Evidence</dt><dd>Visit notes, before-and-after photos, and itemized invoice</dd></div><div><dt>Verification result</dt><dd>Further evidence needed for one repair</dd></div><div><dt>Payment action</dt><dd>None. A report is not a payment instruction.</dd></div></dl><p>The bank would follow the escrow agreement and required authorizations. No report was transmitted in this demo.</p></div>}
    </section>
    <div className="report-bottom"><Link className="button primary" href="/a">Find my property team →</Link><Link className="back-link" href="/">Return home</Link></div>
  </main>;
}
