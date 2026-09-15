import { ArrowUpRight } from './Icons';
import { CONTAINER, SectionLabel, Reveal, StaggerGroup, StaggerItem } from './Shared';
import { copy } from './Copy';

/**
 * IndoLensAbstractVisual:
 * Clean, technical, editorial abstraction. No fake metrics or HUD overlays.
 */
function IndoLensAbstractVisual() {
  return (
    <div
      className="relative w-full h-full min-h-[280px] sm:min-h-[340px] md:min-h-[400px] bg-[#0C0E16] overflow-hidden flex items-center justify-center select-none"
      role="img"
      aria-label="Abstract representation of IndoLens"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Abstract framing */}
        <div className="w-[60%] h-[60%] border border-edge/60 rounded-lg opacity-40 flex items-center justify-center relative shadow-[0_0_30px_rgba(200,77,22,0.05)]">
          {/* Inner focus area */}
          <div className="w-[70%] h-[70%] border border-accent/20 rounded backdrop-blur-sm bg-accent/5" />
          
          {/* Corner accents */}
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-accent/50" />
          <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-accent/50" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-accent/50" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-accent/50" />
        </div>
      </div>

      {/* Atmospheric warm radial overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(200,77,22,0.06) 0%, transparent 65%)' }}
      />
    </div>
  );
}

export function ProjectsSection({ c }: { c: (typeof copy)['en'] }) {
  return (
    <section
      id="projects"
      className="relative py-24 sm:py-32 lg:py-36 border-t border-edge/60"
      aria-label="Projects"
    >
      <div className={CONTAINER}>
        <Reveal direction="up" distance={20}>
          <SectionLabel>{c.projectsLabel}</SectionLabel>
        </Reveal>

        {/* IndoLens Showcase Card */}
        <Reveal direction="up" distance={30} delay={100}>
          <div className="mt-8 border border-edge rounded-2xl overflow-hidden bg-surface/80 backdrop-blur-sm shadow-2xl transition-all duration-300 hover:border-accent/40">
            <div className="flex flex-col lg:flex-row">

              {/* Visual Column */}
              <div className="w-full lg:w-[48%] overflow-hidden border-b lg:border-b-0 lg:border-r border-edge">
                <IndoLensAbstractVisual />
              </div>

              {/* Content Column */}
              <div className="flex-1 p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-8 z-10">
                <div>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase font-medium">
                      {c.projectBadge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-fg mb-5">
                    {c.projectTitle}
                  </h3>

                  {/* Description */}
                  <p className="text-dim text-[15px] sm:text-base leading-[1.8] mb-8 max-w-xl">
                    {c.projectDesc}
                  </p>

                  {/* Tech Stack Pills (Exact locked list) */}
                  <div>
                    <div className="font-mono text-[10px] tracking-widest text-dim/70 uppercase mb-3">
                      TECH STACK
                    </div>
                    <StaggerGroup interval={40} className="flex flex-wrap gap-2">
                      {c.projectTags.map((tag, i) => (
                        <StaggerItem key={tag} index={i} direction="none">
                          <span
                            className="font-mono text-[11px] text-fg/90 bg-edge/40 border border-edge/80 px-2.5 py-1 rounded hover:border-accent/50 hover:text-accent transition-colors duration-200 cursor-default inline-block"
                          >
                            {tag}
                          </span>
                        </StaggerItem>
                      ))}
                    </StaggerGroup>
                  </div>
                </div>

                {/* Direct Clickable CTA Button */}
                <div className="pt-6">
                  <a
                    href={c.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 bg-accent hover:bg-accent-h text-white font-medium text-[13.5px] px-6 py-3.5 rounded-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-lg shadow-accent/20 w-fit"
                  >
                    <span>{c.projectCTA}</span>
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
