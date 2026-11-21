import ProductCard from '../ProductCard';

export default function ProductListing({ products = [] }) {
  return (
    <div className="product-listing grid grid-cols-2 sm:grid-cols-4 gap-4 w-full min-w-0">
      {products.map((product, index) => (
        <ProductCard
          key={product.id || `${product.name}-${index}`}
          productPageId={product.productPageId || product.id}
          {...product}
        />
      ))}
    </div>
  );
}
