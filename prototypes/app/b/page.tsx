import { Suspense } from "react";
import VerificationPreview from "@/app/components/verification-preview";

export default function BuilderVerificationPage() {
  return <Suspense fallback={<main className="report-main"><p>Loading the sample verification record…</p></main>}>
    <VerificationPreview />
  </Suspense>;
}
