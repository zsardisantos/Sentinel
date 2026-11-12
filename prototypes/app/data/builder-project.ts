// Fictional project offered to a builder. No real client, plot, bank, or money.

export type Lang = "pt" | "en";
export type Localized = Record<Lang, string>;

export type ChecklistItem = {
  id: string;
  label: Localized;
  hint: Localized;
};

export type Stage = {
  id: string;
  number: number;
  title: Localized;
  work: Localized;
  amountMinor: number; // CVE centavos, so 78_000_000 = 780 000 escudos
  evidence: Localized;
  windowStart: string; // photos taken outside this window get flagged in review
  targetDate: string;
  checklist: ChecklistItem[];
};

const foundationChecklist: ChecklistItem[] = [
  {
    id: "excavation",
    label: { pt: "Escavação e sapatas", en: "Excavation and footings" },
    hint: { pt: "Mostre as valas abertas e as sapatas, com uma referência do terreno.", en: "Show the open trenches and footings, with a landmark from the plot." },
  },
  {
    id: "rebar",
    label: { pt: "Armadura antes da betonagem", en: "Rebar before the pour" },
    hint: { pt: "A armadura montada e visível, antes de o betão cobrir.", en: "Rebar in place and visible, before concrete covers it." },
  },
  {
    id: "pour",
    label: { pt: "Betonagem", en: "The pour" },
    hint: { pt: "O betão a ser colocado ou acabado de colocar.", en: "Concrete being poured or just poured." },
  },
  {
    id: "cement",
    label: { pt: "Sacos de cimento e fatura", en: "Cement bags and invoice" },
    hint: { pt: "Os sacos no local, com a fatura visível na mesma foto.", en: "Bags on site, with the invoice visible in the same photo." },
  },
];

export const sampleProject = {
  id: "PRJ-palmarejo-t2",
  client: { name: "Maria Lopes", city: "Brockton, Massachusetts" },
  plot: { label: "Palmarejo, Praia, Santiago", lat: 14.9246, lng: -23.5285 },
  home: { pt: "T2, construção nova", en: "T2 new build" } satisfies Localized,
  bank: { pt: "Banco parceiro (exemplo)", en: "Partner bank (example)" } satisfies Localized,
  stages: [
    {
      id: "stage-1",
      number: 1,
      title: { pt: "Fundações", en: "Foundation" },
      work: { pt: "Escavação, sapatas, armadura e betonagem", en: "Excavation, footings, rebar, and pour" },
      amountMinor: 78_000_000,
      evidence: { pt: "4 fotos com hora e localização, fatura do cimento", en: "4 photos with time and location, cement invoice" },
      windowStart: "2026-11-02",
      targetDate: "2026-12-04",
      checklist: foundationChecklist,
    },
    {
      id: "stage-2",
      number: 2,
      title: { pt: "Estrutura e paredes", en: "Structure and walls" },
      work: { pt: "Pilares, vigas e paredes de blocos", en: "Columns, beams, and block walls" },
      amountMinor: 156_000_000,
      evidence: { pt: "Fotos de cada fachada e da armadura dos pilares", en: "Photos of each side and the column rebar" },
      windowStart: "2026-12-05",
      targetDate: "2027-02-12",
      checklist: [],
    },
    {
      id: "stage-3",
      number: 3,
      title: { pt: "Laje e cobertura", en: "Slab and roof" },
      work: { pt: "Laje, impermeabilização e cobertura", en: "Slab, waterproofing, and roof" },
      amountMinor: 104_000_000,
      evidence: { pt: "Fotos da laje antes e depois da betonagem", en: "Photos of the slab before and after the pour" },
      windowStart: "2027-02-13",
      targetDate: "2027-04-09",
      checklist: [],
    },
    {
      id: "stage-4",
      number: 4,
      title: { pt: "Canalização e eletricidade", en: "Plumbing and electrical" },
      work: { pt: "Tubagens, cablagem e quadro elétrico", en: "Pipes, wiring, and electrical panel" },
      amountMinor: 78_000_000,
      evidence: { pt: "Fotos antes de fechar as paredes", en: "Photos before the walls are closed" },
      windowStart: "2027-04-10",
      targetDate: "2027-05-28",
      checklist: [],
    },
    {
      id: "stage-5",
      number: 5,
      title: { pt: "Acabamentos", en: "Finishes" },
      work: { pt: "Reboco, pavimento, pintura, louças", en: "Plaster, floors, paint, fixtures" },
      amountMinor: 104_000_000,
      evidence: { pt: "Visita final e fotos de cada divisão", en: "Final walkthrough and photos of every room" },
      windowStart: "2027-05-29",
      targetDate: "2027-07-23",
      checklist: [],
    },
  ] satisfies Stage[],
};

// Sum, never store, the total. Same rule as the ledger.
export const projectTotalMinor = sampleProject.stages.reduce((sum, stage) => sum + stage.amountMinor, 0);
