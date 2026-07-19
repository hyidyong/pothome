const lawLenses = [
  {
    title: "Issue framing",
    body: "복잡한 상황을 실제로 답해야 할 쟁점과 누락된 질문으로 구조화합니다.",
  },
  {
    title: "Stakeholder & accountability",
    body: "이해관계자의 권한, 책임과 제약을 같은 지도 위에 놓고 비교합니다.",
  },
  {
    title: "Execution-risk translation",
    body: "규칙과 불확실성을 실행 순서, 검토 지점과 다음 검증 기준으로 번역합니다.",
  },
] as const;

export function LawLensSection() {
  return (
    <section id="about" className="law-lens" aria-labelledby="law-lens-title">
      <div className="law-lens__grid">
        <p className="law-lens__index">03 · Why Law Matters</p>
        <div className="law-lens__content">
          <h2 id="law-lens-title">
            법학은 목적지가 아니라, 더 나은 전략을 위한 렌즈입니다.
          </h2>
          <div className="law-lens__notes">
            {lawLenses.map((lens) => (
              <article className="law-lens__note" key={lens.title}>
                <h3>{lens.title}</h3>
                <p>{lens.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
