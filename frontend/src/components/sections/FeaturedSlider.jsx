import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Reveal from '../common/Reveal.jsx';
import SmartImage from '../common/SmartImage.jsx';
import Icon from '../common/Icon.jsx';
import { EmptyState } from '../common/States.jsx';
import { useI18n, localize } from '../../i18n/LanguageContext.jsx';
import './FeaturedSlider.css';

export default function FeaturedSlider({ products = [] }) {
  const { t, lang } = useI18n();
  return (
    <section id="featured" className="section featured">
      <div className="container">
        <div className="featured__head">
          <Reveal><p className="eyebrow">{t('featured.eyebrow')}</p></Reveal>
          <Reveal delay={80}><h2 className="h2">{t('featured.heading')}</h2></Reveal>
        </div>
      </div>

      <div className="container">
        {products.length === 0 ? (
          <EmptyState message={t('featured.empty')} />
        ) : (
          <Swiper
            modules={[Autoplay, Navigation, Pagination, EffectFade]}
            slidesPerView={1}
            loop={products.length > 1}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true, el: '.featured__pagination' }}
            navigation={{ prevEl: '.featured__prev', nextEl: '.featured__next' }}
            grabCursor
            className="featured__swiper"
          >
            {products.map((p) => {
              const name = localize(p, 'name', lang);
              const category = localize(p, 'category', lang);
              const description = localize(p, 'description', lang);
              return (
                <SwiperSlide key={p.id}>
                  <div className="featured__slide">
                    <div className="featured__media">
                      <SmartImage src={p.main_image} alt={name} ratio="1 / 1" />
                    </div>
                    <div className="featured__info">
                      {category && <p className="eyebrow">{category}</p>}
                      <h3 className="featured__name">{name}</h3>
                      {description && <p className="featured__desc">{description}</p>}
                      <ul className="featured__specs">
                        {p.vintage && <li><span>{t('spec.type')}</span>{localize(p, 'vintage', lang)}</li>}
                        {p.volume && <li><span>{t('spec.volume')}</span>{p.volume}</li>}
                        {p.alcohol && <li><span>{t('spec.alcohol')}</span>{p.alcohol}</li>}
                      </ul>
                      <Link to={`/product/${p.slug}`} className="btn">
                        {t('featured.view')}
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}

        <div className="featured__controls">
          <button className="featured__prev" aria-label={t('featured.prev')}>
            <Icon name="arrowLeft" />
          </button>
          <div className="featured__pagination" />
          <button className="featured__next" aria-label={t('featured.next')}>
            <Icon name="arrowRight" />
          </button>
        </div>
      </div>
    </section>
  );
}
