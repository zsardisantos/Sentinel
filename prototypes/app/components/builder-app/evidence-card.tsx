"use client";

import { useState, type ChangeEvent } from "react";
import type { Lang } from "@/app/data/builder-project";
import type { BuilderStrings } from "@/app/data/builder-strings";
import { patchEvidence, saveEvidence, type ItemEvidence } from "@/app/hooks/use-builder-workspace";
import { nowIso } from "@/app/utils/clock";
import { formatDateTime } from "@/app/utils/format";
import { readLocation, type GeoReading } from "@/app/utils/geo";
import { downscalePhoto } from "@/app/utils/photo";

type Props = {
  stageId: string;
  itemKey: string;
  title: string;
  hint: string;
  evidence: ItemEvidence | undefined;
  editable: boolean;
  flagged: boolean;
  lang: Lang;
  t: BuilderStrings;
};

function LocationLine({ location, t }: { location: GeoReading; t: BuilderStrings }) {
  const text = location.status === "shared" ? t.stage.location.shared(location.accuracyM) : t.stage.location[location.status];
  return <span className={`bw-location ${location.status}`}>{text}</span>;
}

export default function EvidenceCard({ stageId, itemKey, title, hint, evidence, editable, flagged, lang, t }: Props) {
  const [preparing, setPreparing] = useState(false);
  const [failed, setFailed] = useState(false);
  // The note is typed into local state and saved on blur, so every keystroke does not
  // re-serialize all the photos into localStorage.
  const [note, setNote] = useState(evidence?.note ?? "");
  const inputId = `${stageId}-${itemKey}-photo`;

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the same file be chosen again after a retake
    if (!file) return;
    const capturedAt = nowIso();
    setPreparing(true);
    setFailed(false);
    // Ask for location now so it runs while the photo is being shrunk.
    const locationRequest = readLocation();
    try {
      const photo = await downscalePhoto(file);
      saveEvidence(stageId, itemKey, {
        photo,
        capturedAt,
        fileModifiedAt: new Date(file.lastModified).toISOString(),
        location: { status: "pending" },
        note,
      });
    } catch {
      setFailed(true);
      return;
    } finally {
      setPreparing(false);
    }
    patchEvidence(stageId, itemKey, capturedAt, { location: await locationRequest });
  }

  return <li className={`bw-evidence ${evidence ? "done" : ""} ${flagged ? "flagged" : ""}`}>
    <div className="bw-evidence-head">
      <span className="bw-evidence-check" aria-hidden="true">{evidence ? "✓" : ""}</span>
      <div><h3>{title}</h3><p>{hint}</p></div>
    </div>
    {evidence && <figure className="bw-photo">
      {/* A data URL from this device, so next/image optimization does not apply. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={evidence.photo} alt={title} />
      <figcaption>
        <span>{t.stage.capturedAt} {formatDateTime(evidence.capturedAt, lang)}</span>
        <LocationLine location={evidence.location} t={t} />
      </figcaption>
    </figure>}
    {editable && <>
      <label htmlFor={inputId} className={`button ${evidence ? "secondary" : "primary"} bw-capture`} aria-disabled={preparing}>
        {preparing ? t.stage.preparing : evidence ? t.stage.retake : `📷 ${t.stage.takePhoto}`}
      </label>
      <input id={inputId} className="sr-only" type="file" accept="image/*" capture="environment" disabled={preparing} onChange={handleFile} />
      {failed && <p className="bw-error" role="alert">{t.stage.photoError}</p>}
      {evidence && <label className="bw-note">
        <span>{t.stage.note}</span>
        <input className="text-input" value={note} maxLength={300} placeholder={t.stage.notePlaceholder} onChange={(event) => setNote(event.target.value)} onBlur={() => patchEvidence(stageId, itemKey, evidence.capturedAt, { note })} />
      </label>}
    </>}
    {!editable && evidence?.note && <p className="bw-note-text">{evidence.note}</p>}
  </li>;
}
