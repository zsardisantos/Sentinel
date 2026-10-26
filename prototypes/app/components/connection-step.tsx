import type { Builder } from "@/app/data/builders";
import { projectBrief } from "@/app/data/property-goals";
import type { BuildDraft } from "@/app/hooks/use-build-draft";

type Props = {
  builder: Builder;
  draft: BuildDraft;
  onChange: (patch: Partial<BuildDraft>) => void;
  onSubmit: () => void;
};

export default function ConnectionStep({ builder, draft, onChange, onSubmit }: Props) {
  return (
    <form id="connection-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <p className="panel-description">Meet {builder.name}, ask your questions, and see whether it feels like a fit. Choose how you’d like to start.</p>
      <fieldset className="contact-options"><legend className="field-label">How would you like to connect?</legend>
        <label className={draft.contactMethod === "video" ? "selected" : ""}><input type="radio" name="contact" checked={draft.contactMethod === "video"} onChange={() => onChange({ contactMethod: "video" })} /><span><strong>Video introduction</strong><span>A Google Meet conversation, at an agreed time</span></span></label>
        <label className={draft.contactMethod === "message" ? "selected" : ""}><input type="radio" name="contact" checked={draft.contactMethod === "message"} onChange={() => onChange({ contactMethod: "message" })} /><span><strong>Start with a message</strong><span>Introduce your project before arranging a call</span></span></label>
      </fieldset>
      {draft.contactMethod === "video" && <div className="connection-field"><label className="field-label" htmlFor="call-time">When usually works for you?</label><select className="text-input" id="call-time" value={draft.timePreference} onChange={(event) => onChange({ timePreference: event.target.value })}><option>To be agreed</option><option>Weekday mornings</option><option>Weekday afternoons</option><option>Weekday evenings</option><option>Weekends</option></select><p className="field-help">Your local time. We’d confirm the time zone and availability with both of you.</p></div>}
      <label className="field-label" htmlFor="intro-message">Anything you’d like to ask? <span className="optional-label">Optional</span></label>
      <textarea className="text-input" id="intro-message" rows={3} maxLength={800} placeholder="For example: Have you worked with owners living abroad?" value={draft.message} onChange={(event) => onChange({ message: event.target.value })} />
      <div className="connection-summary"><strong>{projectBrief(draft)}</strong><span>{draft.location}</span><span>{draft.searchGoal === "replacement" ? "Looking for a replacement team" : "Finding my first property team"}</span></div>
      <p className="field-help">Demo only. This previews a request; it doesn’t send a message, contact a builder, create a Google Meet link, or book a time.</p>
    </form>
  );
}
