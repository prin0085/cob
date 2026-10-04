import { Link } from 'react-router-dom';
import SmartImage from '../common/SmartImage.jsx';
import Icon from '../common/Icon.jsx';
import { useI18n, localize } from '../../i18n/LanguageContext.jsx';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { t, lang } = useI18n();
  const name = localize(product, 'name', lang);
  const category = localize(product, 'category', lang);
  const description = localize(product, 'description', lang);

  return (
    <Link to={`/product/${product.slug}`} className="pcard">
      <div className="pcard__media">
        <SmartImage src={product.main_image} alt={name} ratio="4 / 5" />
        {category && <span className="pcard__cat">{category}</span>}
      </div>
      <div className="pcard__body">
        <h3 className="pcard__name">{name}</h3>
        {description && <p className="pcard__desc">{description}</p>}
        <div className="pcard__meta">
          {product.alcohol && <span>{product.alcohol}</span>}
          {product.volume && <span>{product.volume}</span>}
        </div>
        <span className="pcard__cta">
          {t('product.view')} <Icon name="arrowRight" size={16} />
        </span>
      </div>
    </Link>
  );
}
