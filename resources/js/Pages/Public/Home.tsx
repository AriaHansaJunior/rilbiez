import { useState } from 'react';
import { Lang, copy } from '../../Components/Public/Copy';
import { Navbar } from '../../Components/Public/Navbar';
import { HeroSection } from '../../Components/Public/HeroSection';
import { AboutSection } from '../../Components/Public/AboutSection';
import { SkillsSection } from '../../Components/Public/SkillsSection';
import { ProjectsSection } from '../../Components/Public/ProjectsSection';
import { ContactSection } from '../../Components/Public/ContactSection';
import { Footer } from '../../Components/Public/Footer';

export default function Home() {
  const [lang, setLang] = useState<Lang>('en')
  const c = copy[lang]

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Navbar lang={lang} setLang={setLang} c={c} />
      <main>
        <HeroSection c={c} />
        <AboutSection c={c} />
        <SkillsSection c={c} />
        <ProjectsSection c={c} />
        <ContactSection c={c} />
      </main>
      <Footer c={c} />
    </div>
  )
}
