import { ArrowUpRight } from './Icons';
import { CONTAINER } from './Shared';
import { copy } from './Copy';

/**
 * Footer: "CALM OUTRO"
 * Quiet, elegant ending to the cinematic scroll journey.
 */
export function Footer({ c, onBackToTop }: { c: (typeof copy)['en'], onBackToTop?: () => void }) {
  const handleBackToTop = () => {
    if (onBackToTop) {
      onBackToTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative border-t border-edge/60 py-10 sm:py-12 select-none">
      <div className={CONTAINER}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] sm:text-[12px] tracking-wide text-dim">
              {c.footerCopy}
            </span>
          </div>

          {/* Back to Top */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleBackToTop}
              className="group flex items-center gap-2 font-mono text-[10px] tracking-widest text-dim hover:text-accent transition-colors duration-200 uppercase cursor-pointer"
            >
              BACK TO TOP
              <span className="transform -rotate-45 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-200">
                <ArrowUpRight size={14} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
