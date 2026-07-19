const evidence = [
  {
    value: "21 + 38",
    label: "21개 기업과 유효 후보자 38명의 응답을 분리해 본 양면 채용 리서치",
  },
  {
    value: "57",
    label: "문서화된 RE100·CF100 전환 전략의 분석 결과",
  },
  {
    value: "118",
    label: "Fitory 0→1 가설 검증을 위한 탐색적 정량 응답",
  },
] as const;

export function EvidenceRail() {
  return (
    <section className="evidence-rail" aria-labelledby="evidence-rail-title">
      <h2 id="evidence-rail-title" className="sr-only">
        대표 검증 수치
      </h2>
      <div className="evidence-rail__grid">
        {evidence.map((item) => (
          <article className="evidence-rail__item" key={item.value}>
            <p className="evidence-rail__metric">{item.value}</p>
            <p>{item.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
