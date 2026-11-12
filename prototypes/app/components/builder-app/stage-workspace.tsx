"use client";

import { sampleProject, type Lang } from "@/app/data/builder-project";
import type { BuilderStrings } from "@/app/data/builder-strings";
import { canEditEvidence, invoiceKey, submitStage, type StageRecord } from "@/app/hooks/use-builder-workspace";
import { formatCve, formatDate, formatDateTime } from "@/app/utils/format";
import EvidenceCard from "@/app/components/builder-app/evidence-card";

type Props = {
  record: StageRecord;
  offerAccepted: boolean;
  storageFull: boolean;
  lang: Lang;
  t: BuilderStrings;
  onOpenOffer: () => void;
  onOpenPayments: () => void;
};

// The demo has one active stage. A real workspace would pick the earliest stage the builder holds.
const stage = sampleProject.stages[0];

export default function StageWorkspace({ record, offerAccepted, storageFull, lang, t, onOpenOffer, onOpenPayments }: Props) {
  if (!offerAccepted) {
    return <div className="notice"><p>{t.stage.acceptFirst}</p><button className="button secondary" onClick={onOpenOffer}>{t.tabs.offer}</button></div>;
  }

  const editable = canEditEvidence(record.status);
  const requiredIds = stage.checklist.map((item) => item.id);
  const done = requiredIds.filter((id) => record.evidence[id]).length;
  const missing = requiredIds.length - done;
  const reworkItem = stage.checklist.find((item) => item.id === record.rework?.itemId);

  return <section aria-labelledby="stage-heading">
    <p className="eyebrow">{t.stage.eyebrow(stage.number)}</p>
    <h1 id="stage-heading" className="bw-title">{stage.title[lang]}</h1>
    <p className="bw-meta">{formatCve(stage.amountMinor, lang)} · {t.offer.target}: {formatDate(stage.targetDate, lang)}</p>

    <div className="bw-progress" aria-hidden="true"><span style={{ width: `${(done / requiredIds.length) * 100}%` }} /></div>
    <p className="small muted" aria-live="polite">{t.stage.progress(done, requiredIds.length)}</p>

    {record.status === "rework_requested" && record.rework && <div className="bw-alert" role="status">
      <strong>{t.stage.reworkTitle}{reworkItem ? `: ${reworkItem.label[lang]}` : ""}</strong>
      <p>{record.rework.reason}</p>
      <p className="small">{formatDateTime(record.rework.at, lang)}</p>
    </div>}

    {!editable && <div className="bw-sent" role="status">
      <strong>✓ {t.stage.sentTitle}</strong>
      <p>{t.stage.locked}</p>
      <p>{t.stage.sentNote}</p>
      <button className="button secondary" onClick={onOpenPayments}>{t.stage.seePayments} →</button>
    </div>}

    {editable && <p className="field-help">{t.stage.locationWhy}</p>}
    {storageFull && <p className="bw-error" role="alert">{t.stage.storageFull}</p>}

    <ol className="bw-evidence-list">
      {stage.checklist.map((item) => <EvidenceCard
        key={`${item.id}-${record.evidence[item.id]?.capturedAt ?? "empty"}`}
        stageId={stage.id}
        itemKey={item.id}
        title={item.label[lang]}
        hint={item.hint[lang]}
        evidence={record.evidence[item.id]}
        editable={editable}
        flagged={record.status === "rework_requested" && record.rework?.itemId === item.id}
        lang={lang}
        t={t}
      />)}
      <EvidenceCard
        key={`${invoiceKey}-${record.evidence[invoiceKey]?.capturedAt ?? "empty"}`}
        stageId={stage.id}
        itemKey={invoiceKey}
        title={t.stage.invoiceTitle}
        hint={t.stage.invoiceHint}
        evidence={record.evidence[invoiceKey]}
        editable={editable}
        flagged={false}
        lang={lang}
        t={t}
      />
    </ol>

    {editable && <div className="bw-submit">
      {missing > 0 && <p className="small muted">{t.stage.missing(missing)}</p>}
      <button className="button primary wide" disabled={missing > 0} onClick={() => submitStage(stage.id, requiredIds)}>
        {record.status === "rework_requested" ? t.stage.resubmit : t.stage.submit} →
      </button>
    </div>}
  </section>;
}
