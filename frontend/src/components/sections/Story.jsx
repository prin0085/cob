import Reveal from '../common/Reveal.jsx';
import SmartImage from '../common/SmartImage.jsx';
import { useI18n, localize } from '../../i18n/LanguageContext.jsx';
import './Story.css';

export default function Story({ data = {} }) {
  const { t, lang } = useI18n();
  const heading = localize(data, 'heading', lang) || t('story.heading');
  const description = localize(data, 'description', lang);

  return (
    <section id="story" className="section story">
      <div className="container story__grid">
        <Reveal className="story__media">
          <SmartImage
            src={data.image || 'https://picsum.photos/seed/cob-story/1200/1400'}
            alt={heading}
            ratio="4 / 5"
          />
        </Reveal>
        <div className="story__body">
          <Reveal>
            <p className="eyebrow">{t('story.eyebrow')}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="h2 story__title">{heading}</h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="story__text">
              {description ||
                'From our home in Nong Bua Lam Phu, we ferment single-origin Thai ingredients with distilled craft spirits to create cream liqueurs that are unmistakably ours.'}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
