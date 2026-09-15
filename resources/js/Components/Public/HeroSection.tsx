import { useState, useEffect, useContext } from 'react';
import { ArrowUpRight, MapPinIcon } from './Icons';
import { CONTAINER, Reveal, ResetContext } from './Shared';
import { copy } from './Copy';

/**
 * ProfilePhotoVisual:
 * Brings back the user's photo with a cinematic glowing background.
 */
function ProfilePhotoVisual() {
  return (
    <div
      className="relative w-[250px] h-[250px] min-[360px]:w-[280px] min-[360px]:h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[400px] lg:h-[400px] flex items-center justify-center select-none hero-zoom-visual"
    >
      {/* Ambient core glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-accent/30 to-transparent blur-[60px] opacity-80" />

      {/* Outer subtle orbital ring */}
      <div className="absolute inset-0 rounded-full border border-edge/60" />

      {/* Photo Container */}
      <div className="relative w-48 h-48 min-[360px]:w-56 min-[360px]:h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full border border-edge shadow-2xl overflow-hidden bg-surface/40 backdrop-blur-sm">
        <img
          src="/images/pas foto_transparan bg.png"
          alt="Aria Hansa Junior"
          className="w-full h-full object-cover object-top scale-[1.05]"
        />
        {/* Subtle inner shadow overlay */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
      </div>
    </div>
  );
}

function TypewriterText({ text, delay = 0 }: { text: string, delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const resetSignal = useContext(ResetContext);

  useEffect(() => {
    setDisplayText(''); // Reset text when signal changes
    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayText(text.substring(0, i + 1));
        i++;
        if (i === text.length) clearInterval(interval);
      }, 50); // typing speed
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay, resetSignal]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse border-r-2 border-accent ml-0.5 inline-block h-[0.8em] align-middle" />
    </span>
  );
}

export function HeroSection({ c }: { c: (typeof copy)['en'] }) {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      id="hero"
      className="relative min-h-[90vh] sm:min-h-screen w-full flex items-center pt-24 pb-16 overflow-hidden hero-parallax-bg"
      aria-label="Hero"
    >
      <div className={`${CONTAINER} w-full`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-14 lg:gap-16 xl:gap-24">

          {/* Left Content Column */}
          <div className="flex-1 min-w-0 z-10 hero-text-shift w-full">
            <Reveal delay={300} direction="up" distance={40}>
              {/* Section Tag */}
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <span className="block w-6 h-px bg-accent flex-shrink-0" />
                <span className="font-mono text-[11px] sm:text-[12px] tracking-[0.16em] text-accent uppercase font-medium">
                  {c.heroLabel}
                </span>
              </div>

              {/* Main Greeting & Role */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-fg font-semibold tracking-tight leading-[1.08]">
                  <span className="block text-2xl sm:text-3xl md:text-4xl text-dim font-normal mb-2 min-h-[1.5em]">
                    <TypewriterText text={c.heroGreeting} delay={800} />
                  </span>
                  <span className="block text-[clamp(2.2rem,5vw,4.2rem)] font-bold tracking-tight text-fg">
                    {c.heroRole}
                  </span>
                </h1>
              </div>

              {/* Location Badge */}
              <div className="flex items-center gap-2 text-dim mb-8 sm:mb-10">
                <span className="text-accent flex-shrink-0">
                  <MapPinIcon size={14} />
                </span>
                <span className="font-mono text-[12px] sm:text-[13px] tracking-wide">
                  {c.heroLocation}
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={scrollToContact}
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-h text-white font-medium text-[13.5px] px-6 py-3.5 rounded-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-lg shadow-accent/20"
                >
                  {c.heroCTA}
                  <ArrowUpRight size={15} />
                </button>

                <button
                  onClick={scrollToProjects}
                  className="inline-flex items-center gap-2 text-dim hover:text-fg border border-edge hover:border-accent/60 font-medium text-[13.5px] px-5 py-3.5 rounded-md transition-all duration-200 cursor-pointer"
                >
                  {c.heroSecondaryCTA}
                </button>
              </div>
            </Reveal>
          </div>

          {/* Right Abstract Profile Visual Column */}
          <div className="w-full sm:w-auto flex justify-center lg:justify-end flex-shrink-0 z-10">
            <Reveal delay={600} direction="none" distance={0}>
              <ProfilePhotoVisual />
            </Reveal>
          </div>

        </div>
      </div>
    </div>
  );
}
