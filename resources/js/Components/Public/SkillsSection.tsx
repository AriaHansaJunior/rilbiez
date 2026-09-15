import { CONTAINER, SectionLabel, StaggerGroup, StaggerItem, Reveal } from './Shared';
import { copy } from './Copy';

/**
 * SkillsSection: "HORIZONTAL ENTRANCE"
 * Natural vertical scrolling.
 * Horizontal visual movement is used strictly as an entrance/reveal effect.
 */
export function SkillsSection({ c }: { c: (typeof copy)['en'] }) {
  return (
    <div
      id="skills"
      className="relative w-full py-24 sm:py-32 lg:py-36 border-t border-edge/60"
      aria-label="Skills"
    >
      <div className={`${CONTAINER} w-full`}>
        <Reveal direction="up" distance={40} delay={200}>
          <SectionLabel>{c.skillsLabel}</SectionLabel>
        </Reveal>

        {/* Naturally flowing flex container with staggered horizontal entrances */}
        <StaggerGroup interval={200} delay={400} className="flex flex-wrap gap-3.5 sm:gap-6 mt-8 sm:mt-10">
          {c.skillsList.map((skill, i) => (
            <StaggerItem
              key={skill}
              index={i}
              direction={i % 2 === 0 ? 'left' : 'right'} // Alternate direction for entrance
              distance={60}
              className="grow flex"
            >
              <div
                className="group relative w-full h-full flex items-center justify-center flex-shrink-0 bg-surface/70 border border-edge hover:border-accent/60 rounded-xl px-5 py-4 sm:px-8 sm:py-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 backdrop-blur-sm"
              >
                {/* Skill Name */}
                <span className="font-mono text-lg sm:text-xl md:text-2xl font-medium text-fg tracking-tight group-hover:text-accent transition-colors duration-200 whitespace-nowrap text-center">
                  {skill}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  );
}
