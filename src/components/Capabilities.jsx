const ITEMS = [
  {
    n: "01",
    title: "Brand & Identity",
    body: "Naming, visual systems, typographic direction and motion guidelines that survive contact with a real product.",
  },
  {
    n: "02",
    title: "Interface Design",
    body: "Design systems, product UI and prototypes built to be handed to engineers, not admired in Figma.",
  },
  {
    n: "03",
    title: "Motion & WebGL",
    body: "Scroll narratives, shader work and real-time 3D — the parts of the page that make people stay.",
  },
  {
    n: "04",
    title: "Front-end Build",
    body: "React, GSAP and a performance budget we actually hold ourselves to. Shipped, measured, tuned.",
  },
];

export default function Capabilities() {
  return (
    <section className="section capabilities" id="capabilities">
      <span className="label">02 — Capabilities</span>
      <ul className="cap__list">
        {ITEMS.map((item) => (
          <li className="cap" key={item.n}>
            <span className="cap__n label">{item.n}</span>
            <h3 className="cap__title">{item.title}</h3>
            <p className="cap__body">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
