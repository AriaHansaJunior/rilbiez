import { ArrowUpRight } from './Icons';
import { FadeIn, SectionLabel, CONTAINER } from './Shared';
import { copy } from './Copy';

function ProjectVisual() {
  const dots: React.ReactNode[] = []
  for (let i = 0; i <= 11; i++) {
    for (let j = 0; j <= 6; j++) {
      dots.push(
        <circle key={`d${i}-${j}`} cx={i * 51} cy={j * 51} r="1.2" fill="#252936" opacity="0.7" />
      )
    }
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: '#0C0E16', minHeight: 280 }}
      role="img"
      aria-label="Abstract computer vision visualization placeholder for IndoLens"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 560 340"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="scanLine" x1="185" y1="170" x2="375" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C84D16" stopOpacity="0" />
            <stop offset="0.5" stopColor="#C84D16" stopOpacity="0.55" />
            <stop offset="1" stopColor="#C84D16" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Dot grid */}
        {dots}

        {/* Main detection frame */}
        <rect x="185" y="80" width="190" height="170" rx="2" stroke="#C84D16" strokeWidth="0.9" opacity="0.42" />
        <rect x="177" y="72" width="206" height="186" rx="3" stroke="#C84D16" strokeWidth="0.4" opacity="0.18" />

        {/* Corner bracket marks */}
        <path d="M185 103 L185 80 L208 80" stroke="#C84D16" strokeWidth="1.5" opacity="0.88" />
        <path d="M352 103 L352 80 L329 80" stroke="#C84D16" strokeWidth="1.5" opacity="0.88" />
        <path d="M185 227 L185 250 L208 250" stroke="#C84D16" strokeWidth="1.5" opacity="0.88" />
        <path d="M352 227 L352 250 L329 250" stroke="#C84D16" strokeWidth="1.5" opacity="0.88" />

        {/* Confidence label */}
        <rect x="185" y="63" width="104" height="15" rx="1.5" fill="#C84D16" opacity="0.1" />
        <text x="190" y="74" fontFamily="'JetBrains Mono', monospace" fontSize="9" fill="#C84D16" opacity="0.88">
          ACTOR: 0.947
        </text>

        {/* Horizontal scan line */}
        <line x1="185" y1="165" x2="375" y2="165" stroke="url(#scanLine)" strokeWidth="1.2" />

        {/* Secondary side frames */}
        <rect x="60" y="100" width="96" height="120" rx="2" stroke="#A3A6B2" strokeWidth="0.5" opacity="0.17" />
        <rect x="402" y="108" width="82" height="105" rx="2" stroke="#A3A6B2" strokeWidth="0.5" opacity="0.13" />

        {/* Bottom rule and label */}
        <line x1="20" y1="312" x2="540" y2="312" stroke="#252936" strokeWidth="0.5" opacity="0.5" />
        <text x="20" y="328" fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="#A3A6B2" opacity="0.4">
          INDOLENS · COMPUTER VISION RECOGNITION SYSTEM
        </text>
        <text x="508" y="328" fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fill="#C84D16" opacity="0.5">
          v1.0
        </text>
      </svg>

      {/* Subtle warm overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(200,77,22,0.045) 0%, transparent 65%)' }}
      />
    </div>
  )
}

export function ProjectsSection({ c }: { c: (typeof copy)['en'] }) {
  return (
    <section id="projects" className="py-24 md:py-32 lg:py-36 border-t border-edge">
      <div className={CONTAINER}>
        <FadeIn>
          <SectionLabel>{c.projectsLabel}</SectionLabel>
        </FadeIn>

        <FadeIn delay={80}>
          <div
            className="group border border-edge rounded-xl overflow-hidden transition-all duration-300 hover:border-accent/35 hover:shadow-[0_10px_48px_rgba(200,77,22,0.07)] hover:-translate-y-0.5"
            style={{ background: '#13151D' }}
          >
            <div className="flex flex-col md:flex-row">
              {/* Visual */}
              <div className="w-full md:w-[44%] lg:w-[46%] min-h-[260px] md:min-h-[340px] overflow-hidden">
                <ProjectVisual />
              </div>

              {/* Content */}
              <div className="flex-1 p-7 sm:p-9 md:p-10 lg:p-12 flex flex-col justify-between gap-6">
                <div>
                  <span className="inline-block font-mono text-[11px] tracking-[0.12em] text-accent uppercase mb-4">
                    {c.projectBadge}
                  </span>
                  <h3 className="text-fg text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                    IndoLens
                  </h3>
                  <p className="text-dim text-[15px] md:text-base leading-[1.75] mb-7">
                    {c.projectDesc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {c.projectTags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[11px] text-dim border border-edge/60 px-2.5 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href="https://indolens.webprojek.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-fg border border-edge hover:border-accent hover:text-accent px-5 py-2.5 rounded text-[13.5px] font-medium transition-all duration-200 w-fit"
                >
                  {c.projectCTA}
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
