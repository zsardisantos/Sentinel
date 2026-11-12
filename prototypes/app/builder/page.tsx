"use client";

import { useState } from "react";
import { builderStrings } from "@/app/data/builder-strings";
import { resetBuilderWorkspace, setBuilderLang, useBuilderWorkspace } from "@/app/hooks/use-builder-workspace";
import OfferView from "@/app/components/builder-app/offer-view";
import StageWorkspace from "@/app/components/builder-app/stage-workspace";
import PaymentStatus from "@/app/components/builder-app/payment-status";
import ChangeRequest from "@/app/components/builder-app/change-request";

type Tab = "offer" | "stage" | "payments" | "change";
const tabs: Tab[] = ["offer", "stage", "payments", "change"];

export default function BuilderPage() {
  const { workspace, status } = useBuilderWorkspace();
  // null means "not chosen yet": open the offer until it is accepted, then the stage.
  const [chosenTab, setChosenTab] = useState<Tab | null>(null);
  const tab = chosenTab ?? (workspace.offer === "accepted" ? "stage" : "offer");
  const lang = workspace.lang;
  const t = builderStrings[lang];

  function open(next: Tab) {
    setChosenTab(next);
    window.scrollTo({ top: 0 });
  }

  function reset() {
    if (window.confirm(t.resetConfirm)) {
      resetBuilderWorkspace();
      setChosenTab(null);
    }
  }

  return <main className="bw-main" lang={lang === "pt" ? "pt-CV" : "en"}>
    <div className="bw-topbar">
      <span className="sample-label"><span className="tiny-dot" /> {t.example}</span>
      <button className="bw-lang" onClick={() => setBuilderLang(lang === "pt" ? "en" : "pt")}>{t.switchTo}</button>
    </div>

    <nav className="bw-tabs" aria-label={t.example}>
      {tabs.map((item) => <button key={item} aria-current={tab === item ? "page" : undefined} onClick={() => open(item)}>{t.tabs[item]}</button>)}
    </nav>

    <div className="bw-panel">
      {tab === "offer" && <OfferView offer={workspace.offer} lang={lang} t={t} onOpenStage={() => open("stage")} />}
      {tab === "stage" && <StageWorkspace record={workspace.stages["stage-1"]} offerAccepted={workspace.offer === "accepted"} storageFull={status === "unavailable"} lang={lang} t={t} onOpenOffer={() => open("offer")} onOpenPayments={() => open("payments")} />}
      {tab === "payments" && <PaymentStatus workspace={workspace} lang={lang} t={t} />}
      {tab === "change" && <ChangeRequest lang={lang} t={t} />}
    </div>

    <div className="draft-status">
      <p role="status">{status === "saved" ? `✓ ${t.saved}` : status === "unavailable" ? t.storageUnavailable : t.storageEmpty}</p>
      <button type="button" onClick={reset}>{t.reset}</button>
    </div>
  </main>;
}
