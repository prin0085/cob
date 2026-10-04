import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, resolveImage } from '../lib/api.js';
import SmartImage from '../components/common/SmartImage.jsx';
import Icon from '../components/common/Icon.jsx';
import { Loading, ErrorState } from '../components/common/States.jsx';
import { useI18n, localize } from '../i18n/LanguageContext.jsx';
import './ProductPage.css';

export default function ProductPage() {
  const { slug } = useParams();
  const { t, lang } = useI18n();
  const [state, setState] = useState({ loading: true, error: null });
  const [product, setProduct] = useState(null);
  const [active, setActive] = useState(0);

  const load = () => {
    setState({ loading: true, error: null });
    api
      .get(`/products/slug/${slug}`)
      .then((p) => {
        setProduct(p);
        setActive(0);
        setState({ loading: false, error: null });
      })
      .catch((err) => setState({ loading: false, error: err.message }));
  };

  useEffect(load, [slug]);

  if (state.loading) return <div className="product container"><Loading /></div>;
  if (state.error)
    return (
      <div className="product container">
        <ErrorState message={state.error} onRetry={load} />
      </div>
    );

  const name = localize(product, 'name', lang);
  const category = localize(product, 'category', lang);
  const description = localize(product, 'description', lang);

  const images = [product.main_image, ...(product.gallery || []).map((g) => g.url)].filter(Boolean);
  const uniqueImages = [...new Set(images)];
  const specs = [
    [t('spec.category'), category],
    [t('spec.alcohol'), product.alcohol],
    [t('spec.volume'), product.volume],
    [t('spec.country'), localize(product, 'country', lang)],
    [t('spec.region'), localize(product, 'region', lang)],
    [t('spec.vintage'), localize(product, 'vintage', lang)],
  ].filter(([, v]) => v);

  const notes = [
    [t('notes.aroma'), localize(product, 'aroma', lang)],
    [t('notes.taste'), localize(product, 'taste', lang)],
    [t('notes.finish'), localize(product, 'finish', lang)],
    [t('notes.pairing'), localize(product, 'food_pairing', lang)],
  ].filter(([, v]) => v);

  return (
    <article className="product container">
      <Link to="/#collection" className="product__back">
        <Icon name="arrowLeft" size={16} /> {t('product.back')}
      </Link>

      <div className="product__grid">
        <div className="product__gallery">
          <SmartImage
            src={uniqueImages[active] || product.main_image}
            alt={name}
            ratio="4 / 5"
            eager
          />
          {uniqueImages.length > 1 && (
            <div className="product__thumbs">
              {uniqueImages.map((src, i) => (
                <button
                  key={i}
                  className={`product__thumb ${i === active ? 'is-active' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={resolveImage(src)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product__info">
          {category && <p className="eyebrow product__cat">{category}</p>}
          <h1 className="product__name">{name}</h1>
          {description && <p className="product__desc">{description}</p>}

          {specs.length > 0 && (
            <div className="product__specs">
              {specs.map(([label, value]) => (
                <div key={label} className="product__spec">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          )}

          {notes.length > 0 && (
            <div className="product__notes">
              <h3>{t('product.notes')}</h3>
              <dl>
                {notes.map(([label, value]) => (
                  <div key={label} className="product__note-row">
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <Link to="/#collection" className="btn btn--solid">
            {t('product.back')}
          </Link>
        </div>
      </div>
    </article>
  );
}
