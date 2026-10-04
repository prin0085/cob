import Reveal from '../common/Reveal.jsx';
import { resolveImage } from '../../lib/api.js';
import { useI18n, localize } from '../../i18n/LanguageContext.jsx';
import './CTA.css';

export default function CTA({ data = {} }) {
  const { t, lang } = useI18n();
  const bg = data.backgroundImage || 'https://picsum.photos/seed/cob-cta/1920/1080';
  return (
    <section
      className="cta"
      style={{ backgroundImage: `linear-gradient(rgba(13,13,13,0.6),rgba(13,13,13,0.72)), url(${resolveImage(bg)})` }}
    >
      <div className="container cta__inner">
        <Reveal><p className="eyebrow cta__eyebrow">{t('cta.eyebrow')}</p></Reveal>
        <Reveal delay={80}>
          <h2 className="display cta__title">
            {localize(data, 'heading', lang) || t('cta.heading')}
          </h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="cta__desc">
            {localize(data, 'description', lang) || t('cta.desc')}
          </p>
        </Reveal>
        <Reveal delay={240}>
          <a href={data.buttonLink || '/#collection'} className="btn btn--gold">
            {localize(data, 'buttonText', lang) || t('cta.button')}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
