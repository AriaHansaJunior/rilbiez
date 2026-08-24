import { ArrowUpRight, MapPinIcon } from './Icons';
import { CONTAINER } from './Shared';
import { copy } from './Copy';
import { useState, useEffect } from 'react';

function Typewriter({ texts }: { texts: string[] }) {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[index % texts.length];
    const delay = isDeleting ? 30 : 100;
    
    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentText) {
        setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setIndex(i => i + 1);
      } else {
        setText(currentText.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, texts]);

  return <span className="border-r-2 border-accent pr-1.5">{text}</span>;
}

export function HeroSection({ c }: { c: (typeof copy)['en'] }) {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16" aria-label="Hero">
      <div className={`${CONTAINER} w-full`}>
        <div className="flex flex-col md:flex-row md:items-center gap-14 md:gap-14 lg:gap-20 xl:gap-28">

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div
              className="flex items-center gap-3 mb-9"
              style={{ animation: 'fadeUp 0.6s ease 0.05s both' }}
            >
              <span className="block w-5 h-px bg-accent flex-shrink-0" />
              <span className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
                {c.heroLabel}
              </span>
            </div>

            <h1
              className="text-fg font-semibold leading-[1.08] tracking-tight mb-5"
              style={{ animation: 'fadeUp 0.65s ease 0.12s both' }}
            >
              <span className="block text-2xl sm:text-3xl md:text-[28px] lg:text-[34px] font-normal text-dim mb-1.5">
                {c.heroGreeting}
              </span>
              <span className="block text-[clamp(2rem,4vw,3.75rem)] leading-[1.06]">
                <Typewriter texts={[c.heroRole, ...c.heroTypewriter]} />
              </span>
            </h1>

            <div
              className="flex items-center gap-2 text-dim mb-8"
              style={{ animation: 'fadeUp 0.6s ease 0.2s both' }}
            >
              <span className="text-dim/70"><MapPinIcon size={13} /></span>
              <span className="font-mono text-[12px] tracking-wide">{c.heroLocation}</span>
            </div>

            <p
              className="text-dim text-[15px] md:text-base leading-[1.75] max-w-[500px] mb-10"
              style={{ animation: 'fadeUp 0.6s ease 0.27s both' }}
            >
              {c.heroCopy}
            </p>

            <div style={{ animation: 'fadeUp 0.6s ease 0.34s both' }}>
              <button
                onClick={scrollToContact}
                className="inline-flex items-center gap-2.5 bg-accent hover:bg-accent-h text-white font-medium text-sm px-6 py-3 rounded-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {c.heroCTA}
                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>

          {/* Photo */}
          <div
            className="w-full sm:max-w-sm sm:mx-auto md:mx-0 md:w-[340px] lg:w-[390px] xl:w-[430px] flex-shrink-0 relative"
            style={{ animation: 'fadeIn 0.8s ease 0.18s both' }}
          >
             <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full scale-90" />
             <img src="/images/pas foto_transparan bg.png" alt="Aria Hansa Junior" className="w-full h-auto object-cover relative z-10 drop-shadow-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
