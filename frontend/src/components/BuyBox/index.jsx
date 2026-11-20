import './styles.css';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function BuyBox({
  name,
  reference,
  stars,
  rating,
  price,
  priceDiscount,
  description,
  children,
}) {
  return (
    <section className="buy-box" aria-label={`Detalhes de ${name}`}>
      <h1 className="buy-box__name">{name}</h1>
      <p className="buy-box__reference">Ref.: {reference}</p>

      <div className="buy-box__rating">
        <span className="buy-box__stars">
          {stars}
          <svg viewBox="0 0 24 24" aria-label="estrelas" role="img">
            <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1L12 2Z" />
          </svg>
        </span>
        <span className="buy-box__rating-count">({rating} avaliações)</span>
      </div>

      <div className="buy-box__prices">
        {priceDiscount !== undefined ? (
          <>
            <span className="buy-box__price buy-box__price--original">
              {currency.format(price)}
            </span>
            <span className="buy-box__price">
              {currency.format(priceDiscount)}
            </span>
          </>
        ) : (
          <span className="buy-box__price">{currency.format(price)}</span>
        )}
      </div>

      <p className="buy-box__description">{description}</p>
      <div className="buy-box__options">{children}</div>
      <button className="buy-box__button" type="button">COMPRAR</button>
    </section>
  );
}
