import { Lang } from './Copy';
import { TerminalIcon, CloseIcon, MenuIcon } from './Icons';
import { CONTAINER } from './Shared';
import { useState, useEffect } from 'react';
import { copy } from './Copy';

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center border border-edge rounded overflow-hidden" role="group" aria-label="Language selector">
      {(['en', 'id'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={[
            'px-2.5 py-[5px] text-[11px] font-mono tracking-wider transition-colors duration-200 cursor-pointer',
            lang === l ? 'bg-accent text-white' : 'bg-transparent text-dim hover:text-fg',
          ].join(' ')}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function Navbar({ lang, setLang, c }: { lang: Lang; setLang: (l: Lang) => void; c: (typeof copy)['en'] }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (href: string) => {
    setMenuOpen(false)
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-edge bg-[#090A0F]/90 backdrop-blur-md' : 'border-b border-transparent',
      ].join(' ')}
    >
      <div className={CONTAINER}>
        <div className="flex items-center justify-between h-16 md:h-[68px]">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-3 text-fg hover:text-accent transition-colors duration-200"
            aria-label="RILBIEZ — back to top"
          >
            <img src="/images/Rilbiez_logo_transparan.png" alt="Rilbiez" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(200,77,22,0.4)]" />
            <span className="font-semibold tracking-widest text-[14px]">RILBIEZ</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {c.navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="text-dim hover:text-fg text-[13.5px] font-medium transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            <LangSwitcher lang={lang} setLang={setLang} />
            <button
              className="md:hidden text-dim hover:text-fg transition-colors duration-200 cursor-pointer"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={[
          'md:hidden overflow-hidden transition-all duration-300',
          menuOpen ? 'max-h-72 border-b border-edge' : 'max-h-0',
          'bg-[#090A0F]/95 backdrop-blur-md',
        ].join(' ')}
      >
        <nav className={`${CONTAINER} py-3`} aria-label="Mobile navigation">
          {c.navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="flex w-full text-left text-dim hover:text-fg text-sm font-medium py-3 border-b border-edge/40 last:border-0 transition-colors duration-200 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
