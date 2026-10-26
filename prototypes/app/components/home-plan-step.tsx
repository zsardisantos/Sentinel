import { homeTypes } from "@/app/data/builders";
import { careFrequencies, goalDetails, projectGoals, projectBrief, type CareFrequency } from "@/app/data/property-goals";
import type { BuildDraft } from "@/app/hooks/use-build-draft";

type Props = {
  draft: BuildDraft;
  onChange: (patch: Partial<BuildDraft>) => void;
};

function RoomCounter({ label, value, onChange }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="room-counter">
      <span>{label}</span>
      <div>
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= 1} onClick={() => onChange(value - 1)}>−</button>
        <output aria-label={`${label} count`} aria-live="polite">{value}</output>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} disabled={value >= 8} onClick={() => onChange(value + 1)}>+</button>
      </div>
    </div>
  );
}

export default function HomePlanStep({ draft, onChange }: Props) {
  return (
    <>
      <p className="panel-description">Build, improve, buy, or look after a home. Tell us the basics so we can show you the right kind of team.</p>
      <fieldset className="project-goal-options">
        <legend className="field-label">What would you like help with?</legend>
        {projectGoals.map((goal) => <label className={draft.projectGoal === goal ? "selected" : ""} key={goal}>
          <input type="radio" name="project-goal" checked={draft.projectGoal === goal} onChange={() => onChange({ projectGoal: goal, selectedBuilderId: "" })} />
          <span><strong>{goalDetails[goal].title}</strong><span>{goalDetails[goal].description}</span></span>
        </label>)}
      </fieldset>
      <fieldset className="home-type-options">
        <legend className="field-label">Property type</legend>
        {homeTypes.map((type) => (
          <label className={draft.homeType === type ? "selected" : ""} key={type}>
            <input type="radio" name="home-type" checked={draft.homeType === type} onChange={() => onChange({ homeType: type, selectedBuilderId: "" })} />
            <span aria-hidden="true">{type === "Family house" ? "⌂" : type === "Villa" ? "⌘" : "↗"}</span>
            <strong>{type}</strong>
          </label>
        ))}
      </fieldset>
      <div className="room-counters">
        <RoomCounter label="Bedrooms" value={draft.bedrooms} onChange={(bedrooms) => onChange({ bedrooms })} />
        <RoomCounter label="Bathrooms" value={draft.bathrooms} onChange={(bathrooms) => onChange({ bathrooms })} />
      </div>
      {(draft.projectGoal === "upkeep" || draft.projectGoal === "buy-and-upkeep") && <div className="connection-field"><label className="field-label" htmlFor="care-frequency">How often might you need property care?</label><select id="care-frequency" className="text-input" value={draft.careFrequency} onChange={(event) => onChange({ careFrequency: event.target.value as CareFrequency })}>{careFrequencies.map((frequency) => <option key={frequency}>{frequency}</option>)}</select></div>}
      <div className="plan-recap"><span className="eyebrow">Your starting point</span><p>{projectBrief(draft)}<br /><span>{draft.location}</span></p></div>
      {draft.projectGoal === "buy-and-upkeep" && <p className="field-help">This demo helps you find a local team for viewing coordination and future upkeep. Property listings and purchases are not available here.</p>}
      <p className="field-help">A starting brief for your property team. Agree the scope, responsibilities, reporting, and itemized fees before committing.</p>
    </>
  );
}
