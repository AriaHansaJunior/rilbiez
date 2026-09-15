import { EmailIcon, GitHubIcon, LinkedInIcon, WhatsAppIcon, MapPinIcon } from './Icons';
import { CONTAINER, SectionLabel, Reveal, StaggerGroup, StaggerItem } from './Shared';
import { copy } from './Copy';

/**
 * ContactSection: "LET'S CONNECT" — Cinematic Climax
 * Impactful focal typography, progressive staggered card reveals.
 */
export function ContactSection({ c }: { c: (typeof copy)['en'] }) {
  return (
    <section
      id="contact"
      className="relative py-24 sm:py-32 lg:py-40 border-t border-edge/60 overflow-hidden"
      aria-label="Contact"
    >
      <div className={CONTAINER}>
        <Reveal direction="up" distance={20}>
          <SectionLabel>{c.contactLabel}</SectionLabel>
        </Reveal>

        {/* Cinematic Climax Heading: LET'S CONNECT */}
        <div className="mt-6 mb-12 sm:mb-16 select-none">
          <h2 className="font-bold tracking-tighter leading-[0.9] text-fg">
            <Reveal direction="up" distance={30} delay={200}>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] text-dim">
                {c.contactHeadingTop}
              </span>
            </Reveal>
            <Reveal direction="up" distance={30} delay={400}>
              <span className="block text-[clamp(2.5rem,6vw,5rem)] text-fg">
                {c.contactHeadingBottom}
              </span>
            </Reveal>
          </h2>
        </div>

        {/* Contact Grid with Staggered Entrance */}
        <StaggerGroup interval={250} delay={600} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">
          {/* Email */}
          <StaggerItem index={0} direction="up" distance={40}>
            <a
              href={`mailto:${c.email}`}
              className="group p-6 rounded-xl bg-surface/70 border border-edge hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 backdrop-blur-sm cursor-pointer flex flex-col justify-between min-h-[140px] h-full"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest text-dim uppercase">EMAIL</span>
                <span className="text-dim group-hover:text-accent transition-colors duration-200">
                  <EmailIcon size={18} />
                </span>
              </div>
              <div className="text-fg font-medium text-sm sm:text-[15px] group-hover:text-accent transition-colors duration-200 truncate">
                {c.email}
              </div>
            </a>
          </StaggerItem>

          {/* WhatsApp */}
          <StaggerItem index={1} direction="up" distance={40}>
            <a
              href={c.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-xl bg-surface/70 border border-edge hover:border-[#25D366]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#25D366]/5 backdrop-blur-sm cursor-pointer flex flex-col justify-between min-h-[140px] h-full"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest text-dim uppercase">WHATSAPP</span>
                <span className="text-dim group-hover:text-[#25D366] transition-colors duration-200">
                  <WhatsAppIcon size={18} />
                </span>
              </div>
              <div className="text-fg font-medium text-sm sm:text-[15px] group-hover:text-[#25D366] transition-colors duration-200">
                {c.whatsappDisplay}
              </div>
            </a>
          </StaggerItem>

          {/* GitHub */}
          <StaggerItem index={2} direction="up" distance={40}>
            <a
              href={c.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-xl bg-surface/70 border border-edge hover:border-fg/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-white/5 backdrop-blur-sm cursor-pointer flex flex-col justify-between min-h-[140px] h-full"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest text-dim uppercase">GITHUB</span>
                <span className="text-dim group-hover:text-fg transition-colors duration-200">
                  <GitHubIcon size={18} />
                </span>
              </div>
              <div className="text-fg font-medium text-sm sm:text-[15px] group-hover:text-fg transition-colors duration-200">
                AriaHansaJunior
              </div>
            </a>
          </StaggerItem>

          {/* LinkedIn */}
          <StaggerItem index={3} direction="up" distance={40}>
            <a
              href={c.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-xl bg-surface/70 border border-edge hover:border-[#0A66C2]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0A66C2]/5 backdrop-blur-sm cursor-pointer flex flex-col justify-between min-h-[140px] h-full"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest text-dim uppercase">LINKEDIN</span>
                <span className="text-dim group-hover:text-[#0A66C2] transition-colors duration-200">
                  <LinkedInIcon size={18} />
                </span>
              </div>
              <div className="text-fg font-medium text-sm sm:text-[15px] group-hover:text-[#0A66C2] transition-colors duration-200">
                aria-hansa-junior
              </div>
            </a>
          </StaggerItem>

          {/* Address */}
          <StaggerItem index={4} direction="up" distance={40} className="sm:col-span-2 lg:col-span-2">
            <a 
              href="https://maps.app.goo.gl/R3i5BvKfuBrbN6WL8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group p-6 rounded-xl bg-surface/70 border border-edge hover:border-accent/60 backdrop-blur-sm flex flex-col justify-between min-h-[140px] h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest text-dim uppercase">LOCATION</span>
                <span className="text-accent group-hover:text-accent-h transition-colors duration-200">
                  <MapPinIcon size={18} />
                </span>
              </div>
              <div className="text-dim group-hover:text-fg font-mono text-[12px] sm:text-[13px] leading-relaxed transition-colors duration-200">
                {c.address}
              </div>
            </a>
          </StaggerItem>
        </StaggerGroup>
      </div>
    </section>
  );
}
