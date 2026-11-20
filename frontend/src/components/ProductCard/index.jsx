import { Link } from 'react-router-dom';
import './styles.css';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export default function ProductCard({
  image,
  imagem,
  name,
  category,
  price,
  priceDiscount,
  productPageId,
}) {
  const imageSource = image || imagem;

  return (
    <Link
      className="product-card__link"
      to={`/product/${productPageId}`}
      aria-label={`Ver detalhes de ${name}`}
    >
      <article className="product-card">
        <div className="product-card__media">
          {priceDiscount !== undefined && (
            <span className="product-card__discount">30% OFF</span>
          )}
          <img className="product-card__image" src={imageSource} alt="" />
        </div>
        <div className="product-card__details">
          {category && <p className="product-card__category">{category}</p>}
          <h3 className="product-card__name">{name}</h3>
          <div className="product-card__prices">
            {priceDiscount !== undefined ? (
              <>
                <span className="product-card__price product-card__price--original">
                  {currency.format(price)}
                </span>
                <span className="product-card__price">
                  {currency.format(priceDiscount)}
                </span>
              </>
            ) : (
              <span className="product-card__price">{currency.format(price)}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
