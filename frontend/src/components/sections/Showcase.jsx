import Reveal from '../common/Reveal.jsx';
import SmartImage from '../common/SmartImage.jsx';
import { EmptyState } from '../common/States.jsx';
import { useI18n, localize } from '../../i18n/LanguageContext.jsx';
import './Showcase.css';

export default function Showcase({ items = [] }) {
  const { t, lang } = useI18n();
  return (
    <section id="gallery" className="section showcase">
      <div className="container">
        <div className="showcase__head">
          <Reveal><p className="eyebrow">{t('showcase.eyebrow')}</p></Reveal>
          <Reveal delay={80}><h2 className="h2">{t('showcase.heading')}</h2></Reveal>
        </div>
        {items.length === 0 ? (
          <EmptyState message={t('showcase.empty')} />
        ) : (
          <div className="showcase__masonry">
            {items.map((g, i) => {
              const title = localize(g, 'title', lang);
              const description = localize(g, 'description', lang);
              return (
                <Reveal key={g.id} className="showcase__item" delay={(i % 3) * 90}>
                  <SmartImage
                    src={g.image}
                    alt={title || 'Gallery image'}
                    ratio={i % 3 === 1 ? '3 / 4' : '4 / 3'}
                  />
                  {(title || description) && (
                    <div className="showcase__caption">
                      {title && <strong>{title}</strong>}
                      {description && <span>{description}</span>}
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
