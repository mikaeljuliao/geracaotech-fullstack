import starIcon from '../../assets/star-icon.svg';

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
    <section className="min-w-0 text-dark-gray-2" aria-label={`Detalhes de ${name}`}>
      <h1 className="m-0 mb-4 text-dark-gray text-[32px] max-[650px]:text-[20px] font-bold leading-tight">
        {name}
      </h1>
      <p className="flex flex-wrap gap-1.5 m-0 mb-4 max-[650px]:mb-3 text-dark-gray-3 text-[12px]">
        {category && <>{category} <span aria-hidden="true">|</span> </>}
        {brand && <>{brand} <span aria-hidden="true">|</span> </>}
        REF:{reference}
      </p>

      {stars !== undefined && rating !== undefined && (
        <div className="flex items-center gap-2.5 mb-7 max-[650px]:mb-4">
          <span
            className="inline-flex items-center gap-1 py-1 px-2.5 rounded-[4px] bg-warning text-white text-[14px] font-bold"
            aria-label={`${stars} estrelas`}
          >
            {stars}
            <img className="w-[14px] h-[14px]" src={starIcon} alt="" aria-hidden="true" />
          </span>
          <span className="text-light-gray text-[14px]">({rating} avaliações)</span>
        </div>
      )}

      <div className="flex items-baseline gap-2 mb-3 max-[650px]:mb-4">
        {priceDiscount !== undefined ? (
          <>
            <span className="text-dark-gray-2 text-[32px] max-[650px]:text-[24px] font-bold">
              {currency.format(priceDiscount)}
            </span>
            <span className="text-light-gray-2 text-[16px] max-[650px]:text-[12px] font-normal line-through">
              {currency.format(price)}
            </span>
          </>
        ) : (
          <span className="text-dark-gray-2 text-[32px] max-[650px]:text-[24px] font-bold">
            {currency.format(price)}
          </span>
        )}
      </div>

      <h2 className="m-0 mb-3 max-[650px]:mb-2 text-dark-gray-3 text-[14px] max-[650px]:text-[12px] font-bold">
        Descrição do produto
      </h2>
      <p className="m-0 mb-10 max-[650px]:mb-7 text-dark-gray-2 text-[14px] max-[650px]:text-[12px] leading-relaxed">
        {description}
      </p>
      {stock !== undefined && <p className="mb-4 text-[13px] text-light-gray font-semibold">Estoque: {stock}</p>}
      <div className="grid gap-4 max-[650px]:gap-5">{children}</div>

      <button
        className="w-[220px] max-[650px]:w-full min-h-[48px] max-[650px]:min-h-[42px] mt-9 border-0 rounded-[4px] bg-warning text-white text-[16px] max-[650px]:text-[14px] font-bold cursor-pointer hover:brightness-95 transition-all shadow-md"
        type="button"
      >
        COMPRAR
      </button>
    </section>
  );
}
