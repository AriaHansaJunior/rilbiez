import { FadeIn, SectionLabel, CONTAINER } from './Shared';
import { copy } from './Copy';

export function AboutSection({ c }: { c: (typeof copy)['en'] }) {
  return (
    <section id="about" className="py-24 md:py-32 lg:py-36 border-t border-edge">
      <div className={CONTAINER}>
        <FadeIn>
          <SectionLabel>{c.aboutLabel}</SectionLabel>
        </FadeIn>

        <div className="flex flex-col md:flex-row gap-12 md:gap-16 lg:gap-24">
          {/* Heading */}
          <div className="md:w-[52%] lg:w-[50%]">
            <FadeIn delay={60}>
              <h2 className="text-fg font-semibold leading-[1.1] tracking-tight text-[clamp(2.2rem,4.5vw,3.5rem)]">
                {c.aboutHeading.map((line, i) => (
                  <span
                    key={i}
                    className={`block ${i === c.aboutHeading.length - 1 ? 'text-dim' : ''}`}
                  >
                    {line}
                  </span>
                ))}
              </h2>
            </FadeIn>
          </div>

          {/* Copy + meta */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            <FadeIn delay={140}>
              <p className="text-dim text-[15px] md:text-base leading-[1.8]">{c.aboutCopy}</p>
            </FadeIn>

            <FadeIn delay={220}>
              <div className="flex flex-wrap gap-2">
                {c.aboutMeta.map((item) => (
                  <span
                    key={item}
                    className="font-mono text-[11px] tracking-[0.08em] text-dim border border-edge px-3 py-1.5 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
