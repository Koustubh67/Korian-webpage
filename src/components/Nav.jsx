import { useTheme } from "../hooks/useTheme";

const LINKS = [
  { label: "Studio", href: "#studio" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Work", href: "#work" },
];

export default function Nav() {
  const { theme, toggle } = useTheme();

  return (
    <>
      {/* Sibling, not a child: the nav uses mix-blend-mode, which would
          otherwise blend the scrim too. */}
      <div className="nav__scrim" aria-hidden="true" />
      <header className="nav">
      <a className="nav__mark" href="#top">
        <b>CYBER</b>FRICTION<span className="nav__star">*</span>
      </a>

      <nav className="nav__links">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="label nav__link">
            {l.label}
          </a>
        ))}
      </nav>

      <button
        className="nav__toggle"
        onClick={toggle}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      >
        <span className="nav__toggle-dot" />
        {theme === "dark" ? "Light" : "Dark"}
      </button>
      </header>
    </>
  );
}
