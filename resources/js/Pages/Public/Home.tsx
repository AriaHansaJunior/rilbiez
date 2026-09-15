import { useState } from 'react';
import { Lang, copy } from '../../Components/Public/Copy';
import { Navbar } from '../../Components/Public/Navbar';
import { HeroSection } from '../../Components/Public/HeroSection';
import { AboutSection } from '../../Components/Public/AboutSection';
import { SkillsSection } from '../../Components/Public/SkillsSection';
import { ProjectsSection } from '../../Components/Public/ProjectsSection';
import { ContactSection } from '../../Components/Public/ContactSection';
import { Footer } from '../../Components/Public/Footer';
import { BackgroundMotion } from '../../Components/Motion/BackgroundMotion';
import { ResetContext } from '../../Components/Public/Shared';

export default function Home() {
  const [lang, setLang] = useState<Lang>('en');
  const [resetSignal, setResetSignal] = useState(0);
  const c = copy[lang];

  const handleBackToTop = () => {
    // Instantly signal all sections to gracefully fade out 
    setResetSignal(prev => prev + 1);
    // Smooth scroll to top, where the Hero section will naturally intersect and fade back in
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-bg text-fg selection:bg-accent/30 selection:text-white">
      {/* Cinematic Ambient Background Layer */}
      <BackgroundMotion />

      {/* Navigation */}
      <Navbar lang={lang} setLang={setLang} c={c} />

      {/* 6 Public Sections Orchestration */}
      <ResetContext.Provider value={resetSignal}>
        <main className="relative z-10">
          <HeroSection c={c} />
          <AboutSection c={c} />
          <SkillsSection c={c} />
          <ProjectsSection c={c} />
          <ContactSection c={c} />
        </main>
      </ResetContext.Provider>

      {/* Outro */}
      <div className="relative z-10">
        <Footer c={c} onBackToTop={handleBackToTop} />
      </div>
    </div>
  );
}
