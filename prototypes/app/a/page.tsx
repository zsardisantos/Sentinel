"use client";

import Link from "next/link";
import { projectBrief } from "@/app/data/property-goals";
import { useEffect, useRef, useState } from "react";
import LocationStep from "@/app/components/location-step";
import HomePlanStep from "@/app/components/home-plan-step";
import BuilderBrowser from "@/app/components/builder-browser";
import ConnectionStep from "@/app/components/connection-step";
import { sampleBuilders } from "@/app/data/builders";
import { clearBuildDraft, updateBuildDraft, useBuildDraft } from "@/app/hooks/use-build-draft";

type Step = 1 | 2 | 3 | 4 | 5 | 6;
const steps = ["Location", "Your search", "Your home", "Teams", "Connect"];
const titles: Record<Step, string> = {
  1: "Where is your property project?",
  2: "Let’s find the right builder.",
  3: "What does home look like to you?",
  4: "A clearer path to the right team.",
  5: "A conversation is a good place to start.",
  6: "Your next connection, imagined.",
};

export default function GuidedIntroduction() {
  const [step, setStep] = useState<Step>(1);
  const { draft, status } = useBuildDraft();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const builder = sampleBuilders.find((item) => item.id === draft.selectedBuilderId);

  // Focus the new screen so keyboard and screen-reader users can follow the flow.
  useEffect(() => { headingRef.current?.focus(); }, [step]);

  function reset() {
    clearBuildDraft();
    setStep(1);
  }

  return (
    <main className="flow-main builder-flow">
      <Link className="back-link" href="/">← Home</Link>
      <div className="flow-layout">
        <aside className="journey-sidebar">
          <p className="eyebrow">Find your builder</p><h2>Your home.<br />Your next step.</h2>
          <p>A little clarity, from wherever you are.</p>
          <ol className="step-list" aria-label="Builder search steps">
            {steps.map((label, index) => <li key={label} aria-current={step === index + 1 ? "step" : undefined} className={step > index + 1 ? "complete" : ""}><span>{step > index + 1 ? "✓" : `0${index + 1}`}</span>{label}</li>)}
          </ol>
          <div className="sidebar-note"><span aria-hidden="true">⌂</span><p>Your starting point<br /><strong>{draft.location || "Somewhere to call home"}</strong><br />{draft.bedrooms} beds · {draft.bathrooms} baths</p></div>
        </aside>
        <section className="flow-panel" aria-labelledby="step-heading">
          <div className="panel-topline"><span className="eyebrow">{step === 6 ? "Preview complete" : `Step ${step} of 5`}</span><span className="sample-label">Concept preview</span></div>
          <h1 id="step-heading" ref={headingRef} tabIndex={-1}>{titles[step]}</h1>

          {step === 1 && <LocationStep location={draft.location} onChange={(location) => updateBuildDraft({ location, selectedBuilderId: "" })} onContinue={() => { if (draft.location.trim()) { updateBuildDraft({ location: draft.location.trim() }); setStep(2); } }} />}

          {step === 2 && <>
            <p className="panel-description">You’re in the right place. Are you finding your first team or looking for a fresh start? Builders, renovation teams, and property managers all start here.</p>
            <fieldset className="stage-options"><legend className="field-label">I’m looking for…</legend>
              <label className={`stage-choice ${draft.searchGoal === "first" ? "selected" : ""}`}><input type="radio" name="goal" checked={draft.searchGoal === "first"} onChange={() => updateBuildDraft({ searchGoal: "first" })} /><span><strong>My first builder or property team</strong><span>I need help building, renovating, buying, or caring for a home.</span></span></label>
              <label className={`stage-choice ${draft.searchGoal === "replacement" ? "selected" : ""}`}><input type="radio" name="goal" checked={draft.searchGoal === "replacement"} onChange={() => updateBuildDraft({ searchGoal: "replacement" })} /><span><strong>A replacement builder or property team</strong><span>I have a team, but I’m looking for someone new.</span></span></label>
            </fieldset>
            <div className="guidance-note"><span aria-hidden="true">↗</span><p>We’ll help you create a simple brief, compare teams, and start a conversation. You stay in control of who you hire.</p></div>
            <div className="button-row"><button className="button secondary" onClick={() => setStep(1)}>Back</button><button className="button primary" disabled={!draft.searchGoal} onClick={() => setStep(3)}>Yes, help me find a team →</button></div>
          </>}

          {step === 3 && <>
            <HomePlanStep draft={draft} onChange={updateBuildDraft} />
            <div className="button-row"><button className="button secondary" onClick={() => setStep(2)}>Back</button><button className="button primary" onClick={() => setStep(4)}>Explore teams →</button></div>
          </>}

          {step === 4 && <>
            <BuilderBrowser location={draft.location} homeType={draft.homeType} projectGoal={draft.projectGoal} selectedId={draft.selectedBuilderId} onSelect={(selected) => updateBuildDraft({ selectedBuilderId: selected.id })} />
            {builder && <p className="selected-builder-recap" role="status">Selected: <strong>{builder.name}</strong></p>}
            <div className="button-row"><button className="button secondary" onClick={() => setStep(3)}>Back</button><button className="button primary" disabled={!builder} onClick={() => setStep(5)}>Continue with this team →</button></div>
          </>}

          {step === 5 && builder && <>
            <ConnectionStep builder={builder} draft={draft} onChange={updateBuildDraft} onSubmit={() => setStep(6)} />
            <div className="button-row"><button className="button secondary" onClick={() => setStep(4)}>Back</button><button type="submit" form="connection-form" className="button primary">{draft.contactMethod === "video" ? "Preview video introduction →" : "Preview message request →"}</button></div>
          </>}
          {step === 5 && !builder && <div className="notice"><p>Choose a builder before setting up a connection.</p><button className="button secondary" onClick={() => setStep(4)}>Browse builders</button></div>}

          {step === 6 && <>
            <span className="success-mark" aria-hidden="true">✓</span>
            <p className="panel-description">This is a preview only. Nothing was sent, no meeting was created, and no time has been booked.</p>
            <div className="summary-card"><p className="eyebrow">{draft.contactMethod === "video" ? "Video introduction preview" : "Message preview"}</p><h2>{builder?.name || "Your selected builder"}</h2><p>{projectBrief(draft)} in {draft.location}</p>{draft.contactMethod === "video" ? <p>Preference: {draft.timePreference}. A real service would confirm a time with you both, then send a Google Meet link.</p> : <p>A real service would share your project introduction with the builder after you agree.</p>}{draft.message && <blockquote className="message-preview">{draft.message}</blockquote>}</div>
            <p className="field-help">Your draft stays in this browser so you can revisit it. Use “Clear draft” before handing the device to another interview participant.</p>
            <div className="button-row"><button className="button secondary" onClick={() => setStep(5)}>Edit request</button><Link className="button primary" href="/">Back to home →</Link></div>
          </>}
          <div className="draft-status"><p role="status">{status === "saved" ? "✓ Draft saved in this browser only" : status === "unavailable" ? "Browser storage unavailable. Changes are kept in memory only; a previous saved draft may remain." : "Your draft will save in this browser"}</p><button type="button" onClick={reset}>Clear draft</button></div>
        </section>
      </div>
    </main>
  );
}
