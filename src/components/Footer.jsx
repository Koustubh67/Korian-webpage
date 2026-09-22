export default function Footer() {
  return (
    <footer className="section footer" id="contact">
      <span className="label">05 — Contact</span>
      <h2 className="display footer__lead">
        Let's make something
        <br />
        with <i>weight.</i>
      </h2>

      <a className="footer__mail" href="mailto:hello@cyberfriction.studio">
        hello@cyberfriction.studio
      </a>

      <div className="footer__meta">
        <span className="label">© {new Date().getFullYear()} Cyberfriction</span>
        <span className="label">Built with React, GSAP & WebGL</span>
      </div>
    </footer>
  );
}
