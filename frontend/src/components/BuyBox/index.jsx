import './styles.css';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function BuyBox({
  name,
  category,
  brand,
  reference,
  stars,
  rating,
  price,
  priceDiscount,
  description,
  stock,
  children,
}) {
  return (
    <section className="buy-box" aria-label={`Detalhes de ${name}`}>
      <h1 className="buy-box__name">{name}</h1>
      <p className="buy-box__reference">
        {category && <>{category} <span aria-hidden="true">|</span> </>}
        {brand && <>{brand} <span aria-hidden="true">|</span> </>}
        REF:{reference}
      </p>

      {stars && rating && (
        <div className="buy-box__rating">
          <span className="buy-box__stars" aria-label={`${stars} estrelas`}>
            {Array.from({ length: 5 }, (_, index) => (
              <svg key={index} viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1L12 2Z" />
              </svg>
            ))}
          </span>
          <span className="buy-box__rating-score">{stars}</span>
          <span className="buy-box__rating-count">({rating} avaliações)</span>
        </div>
      )}

      <div className="buy-box__prices">
        {priceDiscount !== undefined ? (
          <>
            <span className="buy-box__price">
              {currency.format(priceDiscount)}
            </span>
            <span className="buy-box__price buy-box__price--original">
              {currency.format(price)}
            </span>
          </>
        ) : (
          <span className="buy-box__price">{currency.format(price)}</span>
        )}
      </div>

      <h2 className="buy-box__description-title">Descrição do produto</h2>
      <p className="buy-box__description">{description}</p>
      {stock !== undefined && <p>Estoque: {stock}</p>}
      <div className="buy-box__options">{children}</div>
    </section>
  );
}
