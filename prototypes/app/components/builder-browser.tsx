import Link from "next/link";
import { goalDetails, type ProjectGoal } from "@/app/data/property-goals";
import { useEffect, useRef, useState } from "react";
import { sampleBuilders, type Builder, type HomeType } from "@/app/data/builders";

type Props = {
  location: string;
  homeType: HomeType;
  projectGoal: ProjectGoal;
  selectedId: string;
  onSelect: (builder: Builder) => void;
};

type Sort = "name" | "experience" | "homes";

export default function BuilderBrowser({ location, homeType, projectGoal, selectedId, onSelect }: Props) {
  const [sort, setSort] = useState<Sort>("name");
  const [soonOnly, setSoonOnly] = useState(false);
  const [homeTypeOnly, setHomeTypeOnly] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  // A changed result set should start at its first card, not an old scroll offset.
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0, behavior: "instant" });
  }, [sort, soonOnly, homeTypeOnly, homeType, projectGoal]);
  const builders = sampleBuilders
    .filter((builder) => builder.services.includes(projectGoal))
    .filter((builder) => (!homeTypeOnly || builder.homeTypes.includes(homeType)) && (!soonOnly || builder.availability === "Soon"))
    .toSorted((a, b) => sort === "experience" ? b.yearsExperience - a.yearsExperience : sort === "homes" ? b.completedProjects - a.completedProjects : a.name.localeCompare(b.name));
  const hasLocationExample = builders.some((builder) => builder.serviceAreas.some((area) => location.toLocaleLowerCase().includes(area.toLocaleLowerCase())));

  function move(direction: number) {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.88, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return (
    <>
      <p className="panel-description">Browse teams offering the service you chose. Inspect their approach, checks, and open questions before choosing who to meet.</p>
      <p className="service-context">Looking for: <strong>{goalDetails[projectGoal].title}</strong></p>
      <div className="builder-toolbar">
        <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="name">Name A–Z</option><option value="experience">Most experience</option><option value="homes">Largest track record</option></select></label>
        <label className="filter-toggle"><input type="checkbox" checked={homeTypeOnly} onChange={(event) => setHomeTypeOnly(event.target.checked)} />{homeType}</label>
        <label className="filter-toggle"><input type="checkbox" checked={soonOnly} onChange={(event) => setSoonOnly(event.target.checked)} />Available soon</label>
      </div>
      <div className="carousel-heading"><p><strong>{builders.length}</strong> sample {builders.length === 1 ? "team" : "teams"} to explore</p><div><button type="button" aria-label="Previous builders" onClick={() => move(-1)}>←</button><button type="button" aria-label="Next builders" onClick={() => move(1)}>→</button></div></div>
      {builders.length === 0 ? <div className="empty-builders"><h2>No examples with these filters.</h2><p>Try including all home types or turning off “Available soon.”</p><button className="button secondary" onClick={() => { setSoonOnly(false); setHomeTypeOnly(false); }}>Reset filters</button></div> : (
        <div className="builder-track" ref={trackRef} tabIndex={0} role="region" aria-label="Sample builder cards. Swipe or use the arrow buttons to browse.">
          {builders.map((builder) => (
            <article className={`builder-card ${selectedId === builder.id ? "chosen" : ""}`} key={builder.id}>
              <div className={`builder-cover ${builder.accent}`} aria-hidden="true"><div className="architectural-house"><i /><i /><i /></div><span>{builder.initials}</span></div>
              <div className="builder-card-content">
                <p className="eyebrow">Fictional {builder.teamType.toLowerCase()}</p><h2>{builder.name}</h2><p className="builder-location">{builder.location}</p>
                <p className="builder-approach">{builder.approach}</p>
                <dl className="builder-stats"><div><dt>Experience</dt><dd>{builder.yearsExperience} years</dd></div><div><dt>{builder.trackRecordLabel}</dt><dd>{builder.completedProjects}</dd></div></dl>
                <div className="builder-tags">{builder.homeTypes.map((type) => <span key={type}>{type}</span>)}</div>
                <p className="builder-meta"><strong>Areas:</strong> {builder.serviceAreas.join(", ")}<br /><strong>Languages:</strong> {builder.languages.join(", ")}<br /><strong>Availability:</strong> {builder.availability === "Soon" ? "Open to a conversation soon" : "Planning further ahead"}</p>
                <p className="verification-card-note">Verification example: review in progress. <Link href={`/b?team=${builder.id}`}>Inspect the verification process →</Link></p>
                <details className="builder-evidence"><summary>See checks and open questions</summary><ul>{builder.checks.map((check) => <li key={check.title}><strong>{check.title}</strong><p>{check.detail}</p></li>)}</ul><p><strong>Still to check:</strong> {builder.unchecked.join("; ")}. All figures and checks are fictional.</p></details>
                <button className={`button ${selectedId === builder.id ? "selected-builder-button" : "primary"}`} aria-pressed={selectedId === builder.id} onClick={() => onSelect(builder)}>{selectedId === builder.id ? "✓ Selected for introduction" : "Choose this team →"}</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="field-help">Swipe the cards or use the arrows. All profiles, checks, experience, and availability are fictional.{!hasLocationExample && <> These are not confirmed matches for {location}.</>} A real service would confirm fit and coverage before an introduction.</p>
    </>
  );
}
