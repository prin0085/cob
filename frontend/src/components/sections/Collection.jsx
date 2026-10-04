import Reveal from '../common/Reveal.jsx';
import ProductCard from './ProductCard.jsx';
import { EmptyState } from '../common/States.jsx';
import { useI18n } from '../../i18n/LanguageContext.jsx';
import './Collection.css';

export default function Collection({ products = [] }) {
  const { t } = useI18n();
  return (
    <section id="collection" className="section collection">
      <div className="container">
        <div className="collection__head">
          <Reveal><p className="eyebrow">{t('collection.eyebrow')}</p></Reveal>
          <Reveal delay={80}><h2 className="h2">{t('collection.heading')}</h2></Reveal>
        </div>
        {products.length === 0 ? (
          <EmptyState message={t('collection.empty')} />
        ) : (
          <div className="collection__grid">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
