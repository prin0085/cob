import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext.jsx';
import { useI18n } from '../../i18n/LanguageContext.jsx';
import Icon from '../common/Icon.jsx';
import './Navbar.css';

// Map the default section anchors to translation keys so seeded (English)
// menu items still localize. Custom admin menus fall back to their stored label.
const URL_LABEL_KEY = {
  '/#hero': 'nav.home',
  '/#story': 'nav.story',
  '/#collection': 'nav.collection',
  '/#gallery': 'nav.gallery',
  '/#contact': 'nav.contact',
};

export default function Navbar() {
  const { menus, settings } = useSite();
  const { t, lang, toggle } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const base = menus.length
    ? menus
    : [
        { url: '/#hero' },
        { url: '/#story' },
        { url: '/#collection' },
        { url: '/#gallery' },
        { url: '/#contact' },
      ];

  const items = base.map((m) => ({
    url: m.url,
    label: URL_LABEL_KEY[m.url] ? t(URL_LABEL_KEY[m.url]) : m.label || m.url,
  }));

  const brand = settings.brand_name || 'COB';

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}>
      <div className="nav__inner container">
        <Link to="/#hero" className="nav__brand" aria-label={`${brand} home`}>
          {brand}
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {items.map((m, i) => (
            <a key={i} href={m.url} className="nav__link">
              {m.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <button
            className="nav__lang"
            onClick={toggle}
            aria-label={lang === 'en' ? 'Switch to Thai' : 'Switch to English'}
          >
            <span className={lang === 'en' ? 'is-active' : ''}>EN</span>
            <span aria-hidden="true">/</span>
            <span className={lang === 'th' ? 'is-active' : ''}>TH</span>
          </button>

          <button
            className="nav__toggle"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <div className="nav__mobile" aria-hidden={!open}>
        {items.map((m, i) => (
          <a key={i} href={m.url} className="nav__mobile-link" onClick={() => setOpen(false)}>
            {m.label}
          </a>
        ))}
      </div>
    </header>
  );
}
