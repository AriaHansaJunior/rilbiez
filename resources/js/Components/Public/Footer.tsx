import { TerminalIcon, GitHubIcon, LinkedInIcon } from './Icons';
import { CONTAINER } from './Shared';
import { copy } from './Copy';

export function Footer({ c }: { c: (typeof copy)['en'] }) {
  return (
    <footer className="border-t border-edge py-9">
      <div className={CONTAINER}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="font-mono text-[11px] tracking-wide text-dim">
            © 2026 Rilbiez, All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <a
              href="https://github.com/AriaHansaJunior"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dim hover:text-fg transition-colors duration-200"
              aria-label="GitHub profile"
            >
              <GitHubIcon size={17} />
            </a>
            <a
              href="https://www.linkedin.com/in/aria-hansa-junior/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dim hover:text-fg transition-colors duration-200"
              aria-label="LinkedIn profile"
            >
              <LinkedInIcon size={17} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
