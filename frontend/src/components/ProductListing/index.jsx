import ProductCard from '../ProductCard';
import './styles.css';

export default function ProductListing({ products = [] }) {
  return (
    <div className="product-listing">
      {products.map((product, index) => (
        <ProductCard
          key={product.id || `${product.name}-${index}`}
          {...product}
        />
      ))}
    </div>
  );
}
