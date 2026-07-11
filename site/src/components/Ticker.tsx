const FACTS = [
  "52% of a bare model's 20-task bill",
  "1 backfire in 20 — rivals: 6 and 8",
  "tool output = 67.5% of session content",
  "eligible outputs shrink ~46%",
  "zero deps · zero network · zero LLM calls",
  "never touches Read / Edit / Write",
  "MIT licensed",
];

export default function Ticker() {
  const row = FACTS.map((f, i) => (
    <span key={i} className="flex items-center">
      <span className="px-6 text-xs text-dim">{f}</span>
      <span className="text-amber-deep">◆</span>
    </span>
  ));
  return (
    <div className="overflow-hidden border-y border-line bg-panel py-3" aria-hidden>
      <div className="marquee-track">
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
    </div>
  );
}
