import { sampleProject, type Lang } from "@/app/data/builder-project";
import type { BuilderStrings } from "@/app/data/builder-strings";
import type { BuilderWorkspace } from "@/app/hooks/use-builder-workspace";
import { formatCve, formatDateTime } from "@/app/utils/format";

type Props = {
  workspace: BuilderWorkspace;
  lang: Lang;
  t: BuilderStrings;
};

export default function PaymentStatus({ workspace, lang, t }: Props) {
  const firstStage = sampleProject.stages[0];
  const history = workspace.stages[firstStage.id].history;
  return <section aria-labelledby="payments-heading">
    <h1 id="payments-heading" className="bw-title">{t.payments.title}</h1>
    <div className="bw-funds"><span aria-hidden="true">🏦</span><p>{t.payments.whoPays}</p></div>

    <ol className="bw-stage-list">
      {sampleProject.stages.map((stage) => {
        const status = workspace.stages[stage.id].status;
        return <li key={stage.id}>
          <div className="bw-stage-top"><span className="bw-stage-number">{stage.number}</span><strong>{stage.title[lang]}</strong><span className="bw-amount">{formatCve(stage.amountMinor, lang)}</span></div>
          <p><span className={`bw-status ${status}`}>{t.payments.statusLabels[status]}</span></p>
          <p className="small muted">{t.payments.statusHelp[status]}</p>
        </li>;
      })}
    </ol>

    <h2 className="bw-subtitle">{t.payments.history}: {firstStage.title[lang]}</h2>
    <ol className="bw-history">
      {history.map((event, index) => <li key={`${event.status}-${index}`}>
        <span className={`bw-status ${event.status}`}>{t.payments.statusLabels[event.status]}</span>
        <span className="small muted">{formatDateTime(event.at, lang)}</span>
      </li>)}
    </ol>
  </section>;
}
