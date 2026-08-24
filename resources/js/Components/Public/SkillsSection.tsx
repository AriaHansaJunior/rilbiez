import { FadeIn, SectionLabel, CONTAINER } from './Shared';
import { copy } from './Copy';

export function SkillsSection({ c }: { c: (typeof copy)['en'] }) {
  return (
    <section id="skills" className="py-24 md:py-32 lg:py-36 border-t border-edge">
      <div className={CONTAINER}>
        <FadeIn>
          <SectionLabel>{c.skillsLabel}</SectionLabel>
        </FadeIn>

        <div className="border-t border-edge">
          {c.skillGroups.map((group, gi) => (
            <FadeIn key={group.title} delay={gi * 55}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-10 py-6 border-b border-edge">
                <div className="sm:w-36 md:w-44 flex-shrink-0 pt-0.5">
                  <span className="font-mono text-[11px] tracking-[0.13em] text-dim uppercase">
                    {group.title}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="font-mono text-[12px] text-fg border border-edge px-3.5 py-1.5 rounded hover:border-accent hover:text-accent transition-colors duration-200 cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
