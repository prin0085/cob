import { useSite } from '../../context/SiteContext.jsx';
import { useI18n } from '../../i18n/LanguageContext.jsx';
import Icon from '../common/Icon.jsx';
import './Footer.css';

const URL_LABEL_KEY = {
  '/#hero': 'nav.home',
  '/#story': 'nav.story',
  '/#collection': 'nav.collection',
  '/#gallery': 'nav.gallery',
  '/#contact': 'nav.contact',
};

export default function Footer() {
  const { settings, menus, social } = useSite();
  const { t } = useI18n();
  const brand = settings.brand_name || 'COB';
  const year = new Date().getFullYear();

  const navItems = (menus.length ? menus : [{ url: '/#hero' }]).map((m) => ({
    url: m.url,
    label: URL_LABEL_KEY[m.url] ? t(URL_LABEL_KEY[m.url]) : m.label || m.url,
  }));

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <div className="footer__logo">{brand}</div>
          <p className="footer__desc">
            {settings.brand_description || t('footer.desc')}
          </p>
          <div className="footer__social">
            {social.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.platform}>
                <Icon name={s.icon || 'arrowRight'} size={18} />
              </a>
            ))}
          </div>
        </div>

        <nav className="footer__col" aria-label="Footer navigation">
          <h4 className="footer__heading">{t('footer.navigation')}</h4>
          {navItems.map((m, i) => (
            <a key={i} href={m.url}>{m.label}</a>
          ))}
        </nav>

        <div className="footer__col">
          <h4 className="footer__heading">{t('footer.contact')}</h4>
          {settings.contact_email && <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>}
          {settings.contact_phone && <a href={`tel:${settings.contact_phone}`}>{settings.contact_phone}</a>}
          <a href="/#contact">{t('footer.getInTouch')}</a>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">{t('footer.legal')}</h4>
          <a href="#privacy">{t('footer.privacy')}</a>
          <a href="#terms">{t('footer.terms')}</a>
          <a href="#responsible">{t('footer.responsible')}</a>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>{settings.footer_copyright || `© ${year} ${brand}. All rights reserved.`}</span>
        <span className="footer__legal-age">{t('footer.enjoy')}</span>
      </div>
    </footer>
  );
}
