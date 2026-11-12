import { projectTotalMinor, sampleProject, type Lang } from "@/app/data/builder-project";
import type { BuilderStrings } from "@/app/data/builder-strings";
import { decideOffer, type BuilderWorkspace } from "@/app/hooks/use-builder-workspace";
import { formatCve, formatDate } from "@/app/utils/format";

type Props = {
  offer: BuilderWorkspace["offer"];
  lang: Lang;
  t: BuilderStrings;
  onOpenStage: () => void;
};

export default function OfferView({ offer, lang, t, onOpenStage }: Props) {
  const { client, plot, home, bank, stages } = sampleProject;
  return <section aria-labelledby="offer-heading">
    <p className="eyebrow">{t.offer.eyebrow}</p>
    <h1 id="offer-heading" className="bw-title">{t.offer.title}</h1>

    <dl className="bw-facts">
      <div><dt>{t.offer.client}</dt><dd>{client.name}, {client.city}</dd></div>
      <div><dt>{t.offer.plot}</dt><dd>{plot.label}</dd></div>
      <div><dt>{t.offer.home}</dt><dd>{home[lang]}</dd></div>
      <div><dt>{t.offer.total}</dt><dd><strong>{formatCve(projectTotalMinor, lang)}</strong></dd></div>
    </dl>

    <div className="bw-funds"><span aria-hidden="true">🏦</span><div><strong>{t.offer.fundsHeld(1)}</strong><p>{bank[lang]}. {t.offer.fundsNote}</p></div></div>

    <h2 className="bw-subtitle">{t.offer.schedule}</h2>
    <ol className="bw-stage-list">
      {stages.map((stage) => <li key={stage.id}>
        <div className="bw-stage-top"><span className="bw-stage-number">{stage.number}</span><strong>{stage.title[lang]}</strong><span className="bw-amount">{formatCve(stage.amountMinor, lang)}</span></div>
        <p>{stage.work[lang]}</p>
        <p className="small muted">{t.offer.evidence}: {stage.evidence[lang]}</p>
        <p className="small muted">{t.offer.target}: {formatDate(stage.targetDate, lang)}</p>
      </li>)}
    </ol>

    <p className="field-help">{t.offer.howPaid}</p>

    {offer === "pending" && <div className="bw-actions">
      <button className="button secondary" onClick={() => decideOffer("declined")}>{t.offer.decline}</button>
      <button className="button primary" onClick={() => { decideOffer("accepted"); onOpenStage(); }}>{t.offer.accept} →</button>
    </div>}
    {offer !== "pending" && <div className="notice" role="status">
      <p><strong>{offer === "accepted" ? t.offer.accepted : t.offer.declined}</strong></p>
      <div className="bw-actions">
        <button className="text-button" onClick={() => decideOffer("pending")}>{t.offer.undo}</button>
        {offer === "accepted" && <button className="button primary" onClick={onOpenStage}>{t.offer.goToStage} →</button>}
      </div>
    </div>}
  </section>;
}
