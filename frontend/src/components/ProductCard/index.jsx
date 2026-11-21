import { Link } from 'react-router-dom';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
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
  const discountPercentage = price > 0 && priceDiscount !== undefined
    ? Math.round((1 - priceDiscount / price) * 100)
    : 0;

  return (
    <Link
      className="block min-w-0 text-inherit no-underline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
      to={`/product/${productPageId}`}
      aria-label={`Ver detalhes de ${name}`}
    >
      <article className="min-w-0">
        <div className="relative h-[321px] max-[520px]:h-auto max-[520px]:aspect-[292/321] bg-white rounded-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          {priceDiscount !== undefined && (
            <span className="absolute top-[18px] left-[20px] z-10 py-[6px] px-[12px] rounded-[20px] bg-[#e7ff86] text-dark-gray-2 text-[12px] font-bold">
              {discountPercentage}% OFF
            </span>
          )}
          <img
            className="block w-full h-full object-contain bg-white"
            src={imageSource}
            alt={name || ''}
            onError={(e) => {
              e.currentTarget.src = '/featured-k-swiss.png';
            }}
          />
        </div>
        <div className="pt-4 pb-2">
          {category && <p className="m-0 mb-1 text-light-gray text-[12px] font-bold">{category}</p>}
          <h3 className="m-0 mb-1.5 text-dark-gray-2 text-[18px] font-normal leading-tight">{name}</h3>
          <div className="flex items-baseline gap-2 flex-wrap max-[520px]:gap-x-2 max-[520px]:gap-y-1">
            {priceDiscount !== undefined ? (
              <>
                <span className="text-light-gray text-[18px] font-normal line-through">
                  {currency.format(price)}
                </span>
                <span className="text-dark-gray text-[20px] max-[520px]:text-[18px] font-bold whitespace-nowrap">
                  {currency.format(priceDiscount)}
                </span>
              </>
            ) : (
              <span className="text-dark-gray text-[20px] max-[520px]:text-[18px] font-bold whitespace-nowrap">
                {currency.format(price)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
