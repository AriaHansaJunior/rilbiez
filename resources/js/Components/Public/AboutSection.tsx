import { CONTAINER, SectionLabel, Reveal } from './Shared';
import { copy } from './Copy';

/**
 * AboutSection: "DEPTH REVEAL"
 * Tasteful editorial reveal without forced layout scale.
 */
export function AboutSection({ c }: { c: (typeof copy)['en'] }) {
  return (
    <section
      id="about"
      className="relative py-24 sm:py-32 lg:py-36 flex items-center border-t border-edge/60 overflow-hidden"
      aria-label="About"
    >
      <div className={`${CONTAINER} w-full`}>
        <Reveal direction="up" distance={25} delay={100}>
          {/* Section Header */}
          <SectionLabel>{c.aboutLabel}</SectionLabel>

          {/* Main Editorial Text Block */}
          <div className="w-full mt-8">
            <p className="text-fg text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-normal leading-[1.35] tracking-tight">
              {c.aboutCopy}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
