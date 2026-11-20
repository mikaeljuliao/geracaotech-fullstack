import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BuyBox from '../../components/BuyBox';
import Gallery from '../../components/Gallery';
import ProductListing from '../../components/ProductListing';
import ProductOptions from '../../components/ProductOptions';
import Section from '../../components/Section';
import { getCategories, getProduct, getProducts, toProductCard } from '../../services/storeApi';
import Layout from '../Layout';
import './styles.css';

const productFields = 'id,enabled,name,price,price_with_discount,category_ids,images';
const galleryBackgrounds = ['#E4E4FE', '#FFE9C7', '#FFC2C4', '#E3D0A7', '#E9E0D3'];

export default function ProductViewPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedError, setRelatedError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');
    setRelatedProducts([]);
    Promise.all([getProduct(id), getCategories({ limit: -1 })])
      .then(([productData, categoryResponse]) => {
        if (active) {
          setProduct(productData);
          setCategories(categoryResponse.data);
        }
      })
      .catch((requestError) => {
        if (active) {
          setProduct(null);
          setError(requestError.status === 404
            ? 'Produto não encontrado.'
            : requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!product) return undefined;
    let active = true;
    const params = { limit: 5, fields: productFields };
    if (product.category_ids.length) {
      params.category_ids = String(product.category_ids[0]);
    }

    getProducts(params)
      .then(({ data }) => {
        if (active) {
          setRelatedProducts(
            data.filter((item) => item.id !== product.id && item.enabled)
              .slice(0, 4)
              .map((item) => toProductCard(item, categories)),
          );
        }
      })
      .catch((requestError) => {
        if (active) setRelatedError(requestError.message);
      });

    return () => {
      active = false;
    };
  }, [categories, product]);

  const categoryNames = product?.category_ids
    .map((categoryId) => categories.find((category) => category.id === categoryId)?.name)
    .filter(Boolean) || [];
  const categoryName = categoryNames.join(', ');
  const images = product?.images.map((image, index) => ({
    src: image.content,
    alt: `${product.name} - imagem ${index + 1}`,
    background: galleryBackgrounds[index % galleryBackgrounds.length],
  })) || [];

  return (
    <Layout defaultSearchTerm={categoryName}>
      {loading ? (
        <div className="product-view-page__not-found" role="status">
          Carregando produto...
        </div>
      ) : error ? (
        <div className="product-view-page__not-found" role="alert">
          <h1>{error}</h1>
          <Link to="/produtos">Voltar aos produtos</Link>
        </div>
      ) : (
        <div className="product-view-page">
          <div className="product-view-page__inner">
            <nav className="product-view-page__breadcrumb" aria-label="Navegação estrutural">
              <ol>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/produtos">Produtos</Link></li>
                {categoryNames.map((name, index) => (
                  <li key={product.category_ids[index]}>
                    <Link to={`/produtos?category_ids=${product.category_ids[index]}`}>
                      {name}
                    </Link>
                  </li>
                ))}
                <li><span aria-current="page">{product.name}</span></li>
              </ol>
            </nav>

            <div className="product-view-page__details">
              <Gallery
                className="product-view-page__gallery"
                images={images}
                showThumbs
                width="700px"
                height="570px"
                radius="4px"
                renderSlide={(image) => (
                  <div
                    className="product-view-page__slide"
                    style={{ backgroundColor: image.background }}
                  >
                    <img src={image.src} alt={image.alt} />
                  </div>
                )}
              />
              <BuyBox
                name={product.name}
                category={categoryName}
                reference={String(product.id).padStart(8, '0')}
                stock={product.stock}
                price={Number(product.price)}
                priceDiscount={
                  Number(product.price_with_discount) > 0
                    && Number(product.price_with_discount) < Number(product.price)
                    ? Number(product.price_with_discount)
                    : undefined
                }
                description={product.description}
              >
                {product.options.map((option) => (
                  <div className="product-view-page__option-group" key={option.id}>
                    <h2>{option.title}</h2>
                    <ProductOptions
                      options={option.values.split(',')}
                      shape={option.shape}
                      type={option.type}
                      radius={`${option.radius || 0}px`}
                    />
                  </div>
                ))}
              </BuyBox>
            </div>

            {relatedError ? (
              <p role="alert">{relatedError}</p>
            ) : relatedProducts.length > 0 ? (
              <Section
                title="Produtos Relacionados"
                mobileTitle="Coleções em destaque"
                titleAlign="left"
                link={{
                  text: 'Ver todos →',
                  href: product.category_ids.length
                    ? `/produtos?category_ids=${product.category_ids[0]}`
                    : '/produtos',
                }}
              >
                <ProductListing products={relatedProducts} />
              </Section>
            ) : null}
          </div>
        </div>
      )}
    </Layout>
  );
}
