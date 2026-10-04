import Reveal from '../common/Reveal.jsx';
import Icon from '../common/Icon.jsx';
import { useSite } from '../../context/SiteContext.jsx';
import { useI18n, localize } from '../../i18n/LanguageContext.jsx';
import './Contact.css';

export default function Contact({ data = {} }) {
  const { settings, social } = useSite();
  const { t, lang } = useI18n();
  const address = localize(data, 'address', lang) || data.address || settings.contact_address;
  const phone = data.phone || settings.contact_phone;
  const email = data.email || settings.contact_email;
  const mapsUrl = data.mapsUrl || settings.contact_maps_url;

  return (
    <section id="contact" className="section contact">
      <div className="container contact__grid">
        <div className="contact__info">
          <Reveal><p className="eyebrow">{t('contact.eyebrow')}</p></Reveal>
          <Reveal delay={80}><h2 className="h2 contact__title">{localize(data, 'heading', lang) || t('contact.heading')}</h2></Reveal>

          <ul className="contact__list">
            {address && (
              <Reveal as="li" delay={120}>
                <Icon name="pin" /><span>{address}</span>
              </Reveal>
            )}
            {phone && (
              <Reveal as="li" delay={180}>
                <Icon name="phone" /><a href={`tel:${phone}`}>{phone}</a>
              </Reveal>
            )}
            {email && (
              <Reveal as="li" delay={240}>
                <Icon name="mail" /><a href={`mailto:${email}`}>{email}</a>
              </Reveal>
            )}
          </ul>

          {social.length > 0 && (
            <Reveal delay={300} className="contact__social">
              {social.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.platform}>
                  <Icon name={s.icon || 'arrowRight'} size={18} />
                </a>
              ))}
            </Reveal>
          )}
        </div>

        <Reveal className="contact__map">
          <a
            href={mapsUrl || 'https://maps.google.com'}
            target="_blank"
            rel="noreferrer"
            className="contact__map-link"
          >
            <span>{t('contact.maps')}</span>
            <Icon name="arrowRight" size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
