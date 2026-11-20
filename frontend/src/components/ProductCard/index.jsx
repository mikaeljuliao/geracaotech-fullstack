import './styles.css';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function ProductCard({
  image,
  imagem,
  name,
  price,
  priceDiscount,
}) {
  const imageSource = image || imagem;

  return (
    <article className="product-card">
      <img className="product-card__image" src={imageSource} alt={name} />
      <div className="product-card__details">
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
  );
}
