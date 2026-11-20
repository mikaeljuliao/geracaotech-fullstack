import starIcon from '../../assets/star-icon.svg';
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
          <img src={starIcon} alt="" aria-hidden="true" />
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
