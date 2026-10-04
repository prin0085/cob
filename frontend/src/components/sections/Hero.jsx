import { motion, useReducedMotion } from 'framer-motion';
import { resolveImage } from '../../lib/api.js';
import { useI18n, localize } from '../../i18n/LanguageContext.jsx';
import './Hero.css';

export default function Hero({ data = {} }) {
  const reduce = useReducedMotion();
  const { t, lang } = useI18n();
  const bg = data.backgroundImage || 'https://picsum.photos/seed/cob-hero/1920/1080';

  const fade = (delay) => ({
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <section id="hero" className="hero">
      <div className="hero__bg" style={{ backgroundImage: `url(${resolveImage(bg)})` }} />
      <div className="hero__overlay" />
      <div className="container hero__content">
        {data.logo && <motion.div className="hero__logo" {...fade(0)}>{data.logo}</motion.div>}
        <motion.p className="eyebrow hero__eyebrow" {...fade(0.1)}>
          {t('hero.eyebrow')}
        </motion.p>
        <motion.h1 className="display hero__title" {...fade(0.2)}>
          {localize(data, 'heading', lang) || t('hero.heading')}
        </motion.h1>
        <motion.p className="hero__desc" {...fade(0.35)}>
          {localize(data, 'description', lang) || t('hero.desc')}
        </motion.p>
        <motion.div {...fade(0.5)}>
          <a href={data.buttonLink || '/#collection'} className="btn btn--gold hero__cta">
            {localize(data, 'buttonText', lang) || t('hero.cta')}
          </a>
        </motion.div>
      </div>
      <div className="hero__scroll" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
