"use client";

import { useState, type FormEvent } from "react";
import { sampleProject, type Lang } from "@/app/data/builder-project";
import type { BuilderStrings } from "@/app/data/builder-strings";
import { formatCve, formatDate } from "@/app/utils/format";

type Props = { lang: Lang; t: BuilderStrings };

export default function ChangeRequest({ lang, t }: Props) {
  const [kind, setKind] = useState<"cost" | "schedule">("cost");
  const [stageId, setStageId] = useState(sampleProject.stages[0].id);
  const [escudos, setEscudos] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const stage = sampleProject.stages.find((item) => item.id === stageId) ?? sampleProject.stages[0];

  // Whole escudos only, converted to centavos. No decimals for money.
  const deltaMinor = /^-?\d{1,9}$/.test(escudos.trim()) ? Number(escudos.trim()) * 100 : null;
  const valid = reason.trim().length > 0 && (kind === "cost" ? deltaMinor !== null && deltaMinor !== 0 : date !== "");

  function preview(event: FormEvent) {
    event.preventDefault();
    if (valid) setPreviewing(true);
  }

  if (previewing) {
    return <section aria-labelledby="change-heading">
      <h1 id="change-heading" className="bw-title">{t.change.previewTitle}</h1>
      <div className="summary-card">
        <p className="eyebrow">{stage.number}. {stage.title[lang]}</p>
        {kind === "cost" && deltaMinor !== null
          ? <p><strong>{deltaMinor > 0 ? "+" : "−"}{formatCve(Math.abs(deltaMinor), lang)}</strong> · {t.change.newTotal}: {formatCve(stage.amountMinor + deltaMinor, lang)}</p>
          : <p><strong>{formatDate(stage.targetDate, lang)} → {formatDate(date, lang)}</strong></p>}
        <blockquote className="message-preview">{reason}</blockquote>
      </div>
      <p className="field-help">{t.change.previewNote}</p>
      <button className="button secondary" onClick={() => setPreviewing(false)}>{t.change.edit}</button>
    </section>;
  }

  return <section aria-labelledby="change-heading">
    <h1 id="change-heading" className="bw-title">{t.change.title}</h1>
    <p className="field-help">{t.change.intro}</p>
    <form onSubmit={preview} className="bw-form">
      <fieldset className="bw-segmented"><legend className="field-label">{t.change.type}</legend>
        <label><input type="radio" name="kind" checked={kind === "cost"} onChange={() => setKind("cost")} /><span>{t.change.cost}</span></label>
        <label><input type="radio" name="kind" checked={kind === "schedule"} onChange={() => setKind("schedule")} /><span>{t.change.schedule}</span></label>
      </fieldset>
      <label className="field-label" htmlFor="change-stage">{t.change.stage}</label>
      <select id="change-stage" className="text-input" value={stageId} onChange={(event) => setStageId(event.target.value)}>
        {sampleProject.stages.map((item) => <option key={item.id} value={item.id}>{item.number}. {item.title[lang]}</option>)}
      </select>
      {kind === "cost" ? <>
        <label className="field-label" htmlFor="change-amount">{t.change.amount}</label>
        <input id="change-amount" className="text-input" inputMode="numeric" value={escudos} onChange={(event) => setEscudos(event.target.value)} placeholder="25000" />
        <p className="field-help">{t.change.amountHelp}</p>
      </> : <>
        <label className="field-label" htmlFor="change-date">{t.change.date}</label>
        <input id="change-date" className="text-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </>}
      <label className="field-label" htmlFor="change-reason">{t.change.reason}</label>
      <textarea id="change-reason" className="text-input" rows={3} maxLength={500} value={reason} placeholder={t.change.reasonPlaceholder} onChange={(event) => setReason(event.target.value)} />
      <button type="submit" className="button primary wide" disabled={!valid}>{t.change.preview} →</button>
    </form>
  </section>;
}
