import Reveal from '../common/Reveal.jsx';
import Icon from '../common/Icon.jsx';
import { useI18n, localize } from '../../i18n/LanguageContext.jsx';
import './Philosophy.css';

const fallback = [
  { icon: 'leaf', title: 'Selected Ingredients', description: 'Single-origin Thai cacao and Arabica coffee.' },
  { icon: 'hammer', title: 'Expert Craftsmanship', description: 'Slow fermentation in small batches.' },
  { icon: 'award', title: 'Premium Quality', description: 'Silky texture and balanced flavour.' },
  { icon: 'heritage', title: 'Authentic Heritage', description: 'Proudly made in Thailand.' },
];

export default function Philosophy({ data = {} }) {
  const { t, lang } = useI18n();
  const features = data.features?.length ? data.features : fallback;
  return (
    <section id="philosophy" className="section philosophy">
      <div className="container">
        <div className="philosophy__head">
          <Reveal><p className="eyebrow">{t('philosophy.eyebrow')}</p></Reveal>
          <Reveal delay={80}><h2 className="h2">{localize(data, 'heading', lang) || t('philosophy.heading')}</h2></Reveal>
          <Reveal delay={160}>
            <p>{localize(data, 'description', lang) || t('philosophy.desc')}</p>
          </Reveal>
        </div>
        <div className="philosophy__grid">
          {features.map((f, i) => (
            <Reveal key={i} className="philosophy__item" delay={i * 90}>
              <div className="philosophy__icon">
                <Icon name={f.icon || 'award'} size={34} stroke={1.2} />
              </div>
              <h3>{localize(f, 'title', lang)}</h3>
              <p>{localize(f, 'description', lang)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
