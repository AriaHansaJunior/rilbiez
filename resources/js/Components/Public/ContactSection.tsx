import { EmailIcon, GitHubIcon, LinkedInIcon, WhatsAppIcon, MapPinIcon } from './Icons';
import { FadeIn, SectionLabel, CONTAINER } from './Shared';
import { copy } from './Copy';

export function ContactSection({ c }: { c: (typeof copy)['en'] }) {
  const primary = [
    {
      icon: <EmailIcon size={19} />,
      label: 'Email',
      display: 'ahjunior200605@gmail.com',
      href: 'https://mail.google.com/mail/?view=cm&fs=1&to=ahjunior200605@gmail.com',
      delay: 160,
    },
    {
      icon: <GitHubIcon size={19} />,
      label: 'GitHub',
      display: 'AriaHansaJunior',
      href: 'https://github.com/AriaHansaJunior',
      delay: 210,
    },
    {
      icon: <LinkedInIcon size={19} />,
      label: 'LinkedIn',
      display: 'aria-hansa-junior',
      href: 'https://www.linkedin.com/in/aria-hansa-junior/',
      delay: 260,
    },
    {
      icon: <WhatsAppIcon size={19} />,
      label: 'WhatsApp',
      display: '0813-7005-3233',
      href: 'https://wa.me/6281370053233',
      delay: 310,
      hoverClass: 'group-hover:text-[#25D366]',
    },
    {
      icon: <MapPinIcon size={19} />,
      label: 'Location',
      display: 'Surabaya, Indonesia',
      href: 'https://maps.app.goo.gl/qVMJBousZwG5PjQn9',
      delay: 360,
      hoverClass: 'group-hover:text-accent',
    },
  ]

  return (
    <section id="contact" className="py-24 md:py-32 lg:py-36 border-t border-edge">
      <div className={CONTAINER}>
        <FadeIn>
          <SectionLabel>{c.contactLabel}</SectionLabel>
        </FadeIn>

        <FadeIn delay={60}>
          <h2 className="text-fg font-semibold tracking-tight leading-[1.04] mb-5 text-[clamp(3rem,8vw,6rem)]">
            {c.contactHeading}
          </h2>
        </FadeIn>

        <FadeIn delay={110}>
          <p className="text-dim text-[15px] md:text-base leading-[1.75] max-w-[480px] mb-12">
            {c.contactSub}
          </p>
        </FadeIn>

        {/* Contact cards */}
        <div className="flex flex-col gap-4 mb-5">
          {/* Top Row (3 items) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {primary.slice(0, 3).map((item) => (
              <FadeIn key={item.label} delay={item.delay}>
                <a
                  href={item.href}
                  target={item.href.startsWith('mailto') || item.href === '#' ? undefined : '_blank'}
                  rel={item.href.startsWith('mailto') || item.href === '#' ? undefined : 'noopener noreferrer'}
                  className="group flex items-start gap-4 p-5 border border-edge rounded-lg hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 cursor-pointer h-full"
                  style={{ background: '#13151D' }}
                >
                  <span className={`text-dim transition-colors duration-300 mt-0.5 flex-shrink-0 ${item.hoverClass || 'group-hover:text-accent'}`}>
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.12em] text-dim uppercase mb-1">
                      {item.label}
                    </div>
                    <div className={`text-fg text-[13px] font-medium transition-colors duration-300 ${item.label === 'Location' ? 'leading-relaxed text-[12px]' : 'truncate'} ${item.hoverClass || 'group-hover:text-accent'}`}>
                      {item.label === 'Location' ? c.address : item.display}
                    </div>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>

          {/* Bottom Row (2 items, centered) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:px-[16.666%]">
            {primary.slice(3).map((item) => (
              <FadeIn key={item.label} delay={item.delay}>
                <a
                  href={item.href}
                  target={item.href.startsWith('mailto') || item.href === '#' ? undefined : '_blank'}
                  rel={item.href.startsWith('mailto') || item.href === '#' ? undefined : 'noopener noreferrer'}
                  className="group flex items-start gap-4 p-5 border border-edge rounded-lg hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 cursor-pointer h-full"
                  style={{ background: '#13151D' }}
                >
                  <span className={`text-dim transition-colors duration-300 mt-0.5 flex-shrink-0 ${item.hoverClass || 'group-hover:text-accent'}`}>
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] tracking-[0.12em] text-dim uppercase mb-1">
                      {item.label}
                    </div>
                    <div className={`text-fg text-[13px] font-medium transition-colors duration-300 ${item.label === 'Location' ? 'leading-relaxed text-[12px]' : 'truncate'} ${item.hoverClass || 'group-hover:text-accent'}`}>
                      {item.label === 'Location' ? c.address : item.display}
                    </div>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
