import FrameBackground from "./components/FrameBackground";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Ticker from "./components/Ticker";
import Studio from "./components/Studio";
import Capabilities from "./components/Capabilities";
import WaveSection from "./components/WaveSection";
import Work from "./components/Work";
import Footer from "./components/Footer";
import { useLenis } from "./hooks/useLenis";

export default function App() {
  useLenis();

  return (
    <>
      {/* Fixed behind everything: runs for the full length of the page. */}
      <FrameBackground />
      <Nav />
      <main className="content">
        <Hero />
        <Ticker />
        <Studio />
        <Capabilities />
        <WaveSection />
        <Work />
        <Footer />
      </main>
    </>
  );
}
