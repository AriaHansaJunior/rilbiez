import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Lang, copy } from './Copy';
import { CloseIcon, MenuIcon } from './Icons';
import { CONTAINER } from './Shared';

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div
      className="flex items-center border border-edge rounded overflow-hidden select-none"
      role="group"
      aria-label="Language selector"
    >
      {(['en', 'id'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={[
            'px-2.5 py-[5px] text-[11px] font-mono tracking-wider transition-colors duration-200 cursor-pointer',
            lang === l ? 'bg-accent text-white font-medium' : 'bg-transparent text-dim hover:text-fg',
          ].join(' ')}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Navbar({
  lang,
  setLang,
  c,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  c: (typeof copy)['en'];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-edge/80 bg-[#090A0F]/85 backdrop-blur-md shadow-lg shadow-black/20'
          : 'border-b border-transparent bg-transparent',
      ].join(' ')}
    >
      <div className={CONTAINER}>
        <div className="flex items-center justify-between h-16 md:h-[70px]">
          {/* Brand Logo */}
          <a
            href="#"
            onClick={scrollToTop}
            className="flex items-center gap-2.5 text-fg hover:text-accent transition-colors duration-200 group cursor-pointer"
            aria-label="RILBIEZ — back to top"
          >
            <img
              src="/images/Rilbiez_logo_transparan.png"
              alt="Rilbiez"
              className="w-7 h-7 object-contain drop-shadow-[0_0_10px_rgba(200,77,22,0.4)] group-hover:scale-105 transition-transform duration-200"
            />
            <span className="font-semibold tracking-[0.2em] text-[13.5px]">RILBIEZ</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {c.navLinks.map((link) =>
              link.href.startsWith('#') ? (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className="text-dim hover:text-fg text-[13px] font-mono tracking-wide transition-colors duration-200 cursor-pointer"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-dim hover:text-fg text-[13px] font-mono tracking-wide transition-colors duration-200 cursor-pointer"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Language Switcher & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <LangSwitcher lang={lang} setLang={setLang} />

            <button
              className="md:hidden text-dim hover:text-fg transition-colors duration-200 p-1 cursor-pointer"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={[
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          menuOpen ? 'max-h-80 border-b border-edge/80 bg-[#090A0F]/95 backdrop-blur-xl' : 'max-h-0',
        ].join(' ')}
      >
        <nav className={`${CONTAINER} py-4 flex flex-col gap-1`} aria-label="Mobile navigation">
          {c.navLinks.map((link) =>
            link.href.startsWith('#') ? (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="flex w-full text-left text-dim hover:text-fg text-sm font-mono tracking-wide py-3 border-b border-edge/30 last:border-0 transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex w-full text-left text-dim hover:text-fg text-sm font-mono tracking-wide py-3 border-b border-edge/30 last:border-0 transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
