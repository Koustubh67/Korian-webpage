const PROJECTS = [
  { name: "Nocturne", kind: "Identity + Site", year: "2025" },
  { name: "Halflight", kind: "WebGL Campaign", year: "2025" },
  { name: "Atlas OS", kind: "Design System", year: "2024" },
  { name: "Signal", kind: "Brand Film", year: "2024" },
];

export default function Work() {
  return (
    <section className="section work" id="work">
      <span className="label">03 — Selected work</span>
      <ul className="work__list">
        {PROJECTS.map((p) => (
          <li className="work__row" key={p.name}>
            <a href="#work" className="work__link">
              <span className="work__name">{p.name}</span>
              <span className="work__kind label">{p.kind}</span>
              <span className="work__year label">{p.year}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
