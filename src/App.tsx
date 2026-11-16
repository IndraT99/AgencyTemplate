import { useEffect } from 'react';
import { CursorMarquee } from './components/CursorMarquee';
import { HeroSection } from './components/HeroSection';
import { LoadWipe } from './components/LoadWipe';
import { Nav } from './components/Nav';
import { TeamSection } from './components/TeamSection';
import { WorkSection } from './components/WorkSection';
import { initKolibrie } from './lib/kolibrieMotion';

export default function App() {
  useEffect(() => {
    return initKolibrie();
  }, []);

  return (
    <>
      <LoadWipe />
      <CursorMarquee />
      <Nav />
      <main>
        <HeroSection />
        <WorkSection />
        <TeamSection />
      </main>
    </>
  );
}
